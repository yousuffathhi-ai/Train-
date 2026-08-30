import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationTelemetry, LocomotiveConfig, ServiceType, SignalAspect, StationData } from '../types';
import { STATIONS_DATA } from '../data/stations';
import { trainAudio } from '../utils/audio';

interface UseTrainPhysicsProps {
  locoConfig: LocomotiveConfig;
  serviceType: ServiceType;
  selectedStationIds?: number[];
  onScoreEarned?: (xp: number, coins: number, reason: string) => void;
  onTripComplete?: (stats: any) => void;
}

export function useTrainPhysics({
  locoConfig,
  serviceType,
  selectedStationIds,
  onScoreEarned,
  onTripComplete
}: UseTrainPhysicsProps) {
  // Filter active stations for service type
  const activeStations = STATIONS_DATA.filter((station) => {
    if (serviceType === 'commuter') return true;
    if (serviceType === 'express') return station.isMajor || station.isTerminal;
    if (serviceType === 'intercity') return [1, 8, 14, 18, 19].includes(station.id);
    if (serviceType === 'custom' && selectedStationIds) {
      return selectedStationIds.includes(station.id);
    }
    return true;
  });

  const [telemetry, setTelemetry] = useState<SimulationTelemetry>({
    speed: 0,
    speedKmh: 0,
    targetSpeedLimit: activeStations[0]?.speedLimit || 40,
    throttle: 0,
    throttleNotch: 0,
    brake: 0,
    brakeMode: 'RELEASE',
    reverser: 1,
    trainPosition: 0,
    trackGradient: 0,
    brakePipePressure: 5.0,
    brakeCylinderPressure: 0.0,
    mainReservoirPressure: 8.5,
    equalizingResPressure: 5.0,
    sanderActive: false,
    headlightsOn: true,
    headlightMode: 'bright',
    cabLightOn: false,
    wipersOn: false,
    hornActive: false,
    deadmanAlarmActive: false,
    deadmanCountdown: 36, // 36-second Vigilance Control System
    awsAlarmActive: false,
    awsAcknowledged: true,
    doorsOpen: { left: false, right: false },
    tractionLocked: false,
    dwellTimer: 0,
    passengerComfort: 100,
    currentSignal: 'green',
    distanceToSignal: 450,
    currentStationIndex: 0,
    isAtPlatform: false,
    tripActive: true,
    tripCompleted: false,
    tripTimeSeconds: 0
  });

  const stateRef = useRef(telemetry);
  stateRef.current = telemetry;

  const lastAwsSignalId = useRef<number>(-1);
  const emergencyBrakePenalty = useRef<boolean>(false);

  // Helper: Get active target station
  const getCurrentTargetStation = useCallback((): StationData | undefined => {
    return activeStations[stateRef.current.currentStationIndex];
  }, [activeStations]);

  // Vigilance / Deadman Reset (36s Safety Timer)
  const resetDeadman = useCallback(() => {
    if (emergencyBrakePenalty.current) {
      // Clear emergency penalty if driver acknowledges
      emergencyBrakePenalty.current = false;
    }
    setTelemetry((prev) => ({
      ...prev,
      deadmanCountdown: 36,
      deadmanAlarmActive: false
    }));
  }, []);

  // AWS Acknowledgment
  const acknowledgeAws = useCallback(() => {
    resetDeadman();
    if (stateRef.current.awsAlarmActive) {
      setTelemetry((prev) => ({
        ...prev,
        awsAlarmActive: false,
        awsAcknowledged: true
      }));
    }
  }, [resetDeadman]);

  // Throttle Notch Setter (0 to 8 Notches)
  const setThrottle = useCallback((notchOrPercent: number) => {
    resetDeadman();
    const current = stateRef.current;
    
    // Interlock: Train cannot accelerate if doors are open or reverser is neutral
    if (current.doorsOpen.left || current.doorsOpen.right || current.reverser === 0 || current.tractionLocked || emergencyBrakePenalty.current) {
      setTelemetry((prev) => ({
        ...prev,
        throttle: 0,
        throttleNotch: 0,
        tractionLocked: true
      }));
      return;
    }

    const val = Math.max(0, Math.min(100, notchOrPercent));
    const notch = Math.round((val / 100) * 8);
    // Snap throttle to clean notch percentage
    const snappedPercent = (notch / 8) * 100;

    setTelemetry((prev) => ({
      ...prev,
      throttle: snappedPercent,
      throttleNotch: notch,
      tractionLocked: false
    }));
  }, [resetDeadman]);

  // Air Brake Setter (0% to 100%)
  const setBrake = useCallback((val: number) => {
    resetDeadman();
    const clamped = Math.max(0, Math.min(100, val));
    let mode: SimulationTelemetry['brakeMode'] = 'RELEASE';
    if (clamped === 0) mode = 'RELEASE';
    else if (clamped < 25) mode = 'INITIAL';
    else if (clamped < 65) mode = 'SERVICE';
    else if (clamped < 95) mode = 'FULL_SERVICE';
    else mode = 'EMERGENCY';

    if (clamped > 20 && stateRef.current.speedKmh > 2) {
      trainAudio.playBrakeSqueal(stateRef.current.speedKmh);
    }

    setTelemetry((prev) => ({
      ...prev,
      brake: clamped,
      brakeMode: mode,
      brakePipePressure: parseFloat((5.0 - (clamped / 100) * 5.0).toFixed(2)),
      brakeCylinderPressure: parseFloat(((clamped / 100) * 3.8).toFixed(2))
    }));
  }, [resetDeadman]);

  // Horn Trigger
  const triggerHorn = useCallback(() => {
    resetDeadman();
    setTelemetry((prev) => ({ ...prev, hornActive: true }));
    trainAudio.playHorn(locoConfig.hornType);
    setTimeout(() => {
      setTelemetry((prev) => ({ ...prev, hornActive: false }));
    }, 1500);
  }, [locoConfig.hornType, resetDeadman]);

  // Sander Toggle
  const toggleSander = useCallback(() => {
    resetDeadman();
    setTelemetry((prev) => {
      const next = !prev.sanderActive;
      if (next) trainAudio.playSanderHiss();
      return { ...prev, sanderActive: next };
    });
  }, [resetDeadman]);

  // Reverser Setter (Forward = 1, Neutral = 0, Reverse = -1)
  const setReverser = useCallback((rev: 1 | 0 | -1) => {
    if (stateRef.current.speedKmh > 1) return; // Interlock: Prevent shifting reverser while in motion
    resetDeadman();
    setTelemetry((prev) => {
      const lockTraction = rev === 0 || prev.doorsOpen.left || prev.doorsOpen.right;
      return {
        ...prev,
        reverser: rev,
        throttle: lockTraction ? 0 : prev.throttle,
        throttleNotch: lockTraction ? 0 : prev.throttleNotch,
        tractionLocked: lockTraction
      };
    });
  }, [resetDeadman]);

  // Open Doors (Station Interlock: Only when speed == 0 km/h)
  const openDoors = useCallback((): boolean => {
    const current = stateRef.current;
    const targetStation = activeStations[current.currentStationIndex];

    // 1. Safety Interlock: Speed must be 0 km/h (<= 0.2 km/h)
    if (current.speedKmh > 0.2) {
      return false;
    }

    // Configure platform side
    let left = false;
    let right = false;
    if (targetStation) {
      if (targetStation.platformSide === 'LEFT' || targetStation.platformSide === 'BOTH') left = true;
      if (targetStation.platformSide === 'RIGHT' || targetStation.platformSide === 'BOTH') right = true;
    } else {
      left = true;
      right = true;
    }

    // Sound chime & lock traction
    trainAudio.playDoorChime(true);

    // Calculate stopping accuracy score if near target station
    if (targetStation && onScoreEarned) {
      const distanceToPlatform = Math.abs(current.trainPosition - targetStation.position);
      if (distanceToPlatform <= (targetStation.stopTolerance || 30)) {
        const accuracy = Math.max(0, 100 - (distanceToPlatform / (targetStation.stopTolerance || 30)) * 50);
        const xp = Math.round(150 * (accuracy / 100));
        const coins = Math.round(50 * (accuracy / 100));
        onScoreEarned(xp, coins, `Perfect Stop at ${targetStation.name} (${Math.round(accuracy)}% accuracy)`);
      }
    }

    setTelemetry((prev) => ({
      ...prev,
      doorsOpen: { left, right },
      tractionLocked: true,
      throttle: 0,
      throttleNotch: 0,
      dwellTimer: targetStation ? targetStation.dwellTime : 20,
      isAtPlatform: true
    }));

    return true;
  }, [activeStations, onScoreEarned]);

  // Close Doors
  const closeDoors = useCallback(() => {
    trainAudio.playDoorChime(false);
    trainAudio.playBrakeRelease();

    setTelemetry((prev) => {
      const nextIndex = prev.currentStationIndex + 1;
      const isComplete = nextIndex >= activeStations.length;

      if (isComplete && onTripComplete) {
        onTripComplete({
          totalTime: prev.tripTimeSeconds,
          comfortScore: Math.round(prev.passengerComfort),
          distance: activeStations[activeStations.length - 1].position / 1000
        });
      }

      return {
        ...prev,
        doorsOpen: { left: false, right: false },
        tractionLocked: false,
        dwellTimer: 0,
        isAtPlatform: false,
        currentStationIndex: isComplete ? prev.currentStationIndex : nextIndex,
        tripCompleted: isComplete
      };
    });
  }, [activeStations, onTripComplete]);

  // Main Simulation Physics Engine Loop (Runs every 100ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const targetStation = activeStations[prev.currentStationIndex];
        const distToStation = targetStation ? targetStation.position - prev.trainPosition : 9999;

        // 1. Station Dwell Timer Countdown
        let newDwell = prev.dwellTimer;
        if (prev.dwellTimer > 0 && (prev.doorsOpen.left || prev.doorsOpen.right)) {
          newDwell = Math.max(0, prev.dwellTimer - 0.1);
          if (newDwell === 0) {
            setTimeout(closeDoors, 100);
          }
        }

        // 2. Deadman / Vigilance Control System (36s Countdown)
        let newDeadman = prev.deadmanCountdown - 0.1;
        let deadmanAlarm = prev.deadmanAlarmActive;
        if (newDeadman <= 6.0 && newDeadman > 0 && !deadmanAlarm) {
          deadmanAlarm = true;
          trainAudio.playVigilanceAlert();
        } else if (newDeadman <= 0) {
          // Emergency Penalty Brake triggered!
          emergencyBrakePenalty.current = true;
          newDeadman = 0;
          deadmanAlarm = true;
        }

        // 3. Signaling & AWS Detection
        let currentSig: SignalAspect = 'green';
        let awsAlarm = prev.awsAlarmActive;
        let awsAck = prev.awsAcknowledged;

        // AWS magnet 300m before signal
        const nearSignal = Math.abs(distToStation - 450) < 30;
        if (nearSignal && lastAwsSignalId.current !== prev.currentStationIndex) {
          lastAwsSignalId.current = prev.currentStationIndex;
          if (distToStation < 1200) {
            currentSig = 'yellow';
            awsAlarm = true;
            awsAck = false;
            trainAudio.playAwsWarningHorn();
          } else {
            currentSig = 'green';
            trainAudio.playAwsBell();
          }
        }

        // 4. Power & Braking Physics Calculation
        const isEmergency = emergencyBrakePenalty.current;
        const areDoorsOpen = prev.doorsOpen.left || prev.doorsOpen.right;
        const isTractionCutoff = areDoorsOpen || prev.reverser === 0 || prev.tractionLocked || isEmergency;

        const effectiveBrake = isEmergency ? 100 : prev.brake;
        const effectiveThrottle = isTractionCutoff ? 0 : prev.throttle;
        const effectiveNotch = isTractionCutoff ? 0 : prev.throttleNotch;

        // Tractive Effort (Notch 0 to 8 scaling with KW / weight)
        const powerPerNotch = (locoConfig.powerKW / 8) * effectiveNotch;
        const maxTraction = (powerPerNotch / locoConfig.weightTons) * 0.18;
        const tractionForce = (effectiveThrottle / 100) * maxTraction * prev.reverser;

        // Braking Force (Brake % + Emergency multiplier)
        const brakeForce = (effectiveBrake / 100) * 2.2;

        // Resistances: Rolling friction + aerodynamic drag (v^2)
        const rollingFriction = 0.035;
        const aeroDrag = 0.00018 * Math.pow(prev.speedKmh, 2);
        const totalResistance = prev.speedKmh > 0 ? (rollingFriction + aeroDrag) : 0;

        // Net Acceleration (m/s^2 equivalent)
        let accel = tractionForce - brakeForce - (prev.speedKmh > 0 ? totalResistance : 0);
        if (prev.sanderActive) {
          accel *= 1.2; // Adhesion boost
        }

        let newSpeed = prev.speedKmh + (accel * 0.55);
        if (newSpeed < 0.05) newSpeed = 0;
        if (newSpeed > locoConfig.maxSpeed) newSpeed = locoConfig.maxSpeed;

        // Calculate Distance advanced (meters in 0.1s: (v * 1000 / 3600) * 0.1)
        const deltaMeters = (newSpeed * 1000 / 3600) * 0.1 * (prev.reverser >= 0 ? 1 : -1);
        const newPosition = Math.max(0, prev.trainPosition + deltaMeters);

        // 5. Passenger Comfort Score
        let comfort = prev.passengerComfort;
        const jerk = Math.abs(accel);
        if (jerk > 0.8) {
          comfort = Math.max(30, comfort - 0.3);
        } else {
          comfort = Math.min(100, comfort + 0.1);
        }

        // 6. Platform alignment status
        const isAligned = targetStation ? Math.abs(newPosition - targetStation.position) <= (targetStation.stopTolerance || 30) : false;

        // Update dynamic engine sound
        trainAudio.updateEngineSound(newSpeed, effectiveThrottle, newSpeed > 0);

        return {
          ...prev,
          speed: parseFloat(newSpeed.toFixed(1)),
          speedKmh: parseFloat(newSpeed.toFixed(1)),
          targetSpeedLimit: targetStation?.speedLimit || 40,
          throttle: effectiveThrottle,
          throttleNotch: effectiveNotch,
          brake: effectiveBrake,
          brakeMode: isEmergency ? 'EMERGENCY' : prev.brakeMode,
          tractionLocked: isTractionCutoff,
          trainPosition: newPosition,
          deadmanCountdown: newDeadman,
          deadmanAlarmActive: deadmanAlarm,
          awsAlarmActive: awsAlarm,
          awsAcknowledged: awsAck,
          dwellTimer: newDwell,
          passengerComfort: parseFloat(comfort.toFixed(1)),
          currentSignal: currentSig,
          distanceToSignal: Math.max(0, 450 - (newPosition % 450)),
          isAtPlatform: isAligned,
          tripTimeSeconds: prev.tripTimeSeconds + 0.1
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStations, closeDoors, locoConfig]);

  return {
    telemetry,
    setThrottle,
    setBrake,
    setReverser,
    triggerHorn,
    toggleSander,
    openDoors,
    closeDoors,
    resetDeadman,
    acknowledgeAws,
    setHeadlights: (on: boolean) => setTelemetry((p) => ({ ...p, headlightsOn: on, headlightMode: on ? 'bright' : 'off' })),
    setHeadlightMode: (mode: 'off' | 'dim' | 'bright') => setTelemetry((p) => ({ ...p, headlightMode: mode, headlightsOn: mode !== 'off' })),
    cycleHeadlights: () => setTelemetry((p) => {
      const cur = p.headlightMode || (p.headlightsOn ? 'bright' : 'off');
      const next: 'off' | 'dim' | 'bright' = cur === 'off' ? 'dim' : cur === 'dim' ? 'bright' : 'off';
      return { ...p, headlightMode: next, headlightsOn: next !== 'off' };
    }),
    setCabLight: (on: boolean) => setTelemetry((p) => ({ ...p, cabLightOn: on })),
    setWipers: (on: boolean) => setTelemetry((p) => ({ ...p, wipersOn: on })),
    currentTargetStation: getCurrentTargetStation(),
    activeStations
  };
}
