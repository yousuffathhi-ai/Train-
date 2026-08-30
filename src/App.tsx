import React, { useState, useEffect, useCallback } from 'react';
import { TrainSimulatorScene } from './components/3d/TrainSimulatorScene';
import { LandscapeHUD } from './components/ui/LandscapeHUD';
import { PhotoModeOverlay } from './components/ui/PhotoModeOverlay';
import { RouteMapModal } from './components/ui/RouteMapModal';
import { TimetableModal } from './components/ui/TimetableModal';
import { DriverProfileModal } from './components/ui/DriverProfileModal';
import { TrainSelectorModal } from './components/ui/TrainSelectorModal';
import { RouteSelectorModal } from './components/ui/RouteSelectorModal';
import { WeatherSelector } from './components/ui/WeatherSelector';
import { TripCompleteModal } from './components/ui/TripCompleteModal';
import { PWAInstallBanner } from './components/ui/PWAInstallBanner';
import { useTrainPhysics } from './hooks/useTrainPhysics';
import { useRandomEvents } from './hooks/useRandomEvents';
import { LOCOMOTIVES } from './data/trains';
import { INITIAL_DRIVER_PROFILE } from './data/career';
import { LocomotiveConfig, ServiceType, WeatherType, CameraViewMode, DriverProfile, Snapshot } from './types';
import { trainAudio } from './utils/audio';
import { Play, Volume2 } from 'lucide-react';

export default function App() {
  // Audio unlock state
  const [audioStarted, setAudioStarted] = useState(false);

  // Simulation Configurations
  const [selectedLoco, setSelectedLoco] = useState<LocomotiveConfig>(LOCOMOTIVES[0]);
  const [serviceType, setServiceType] = useState<ServiceType>('commuter');
  const [customStationIds, setCustomStationIds] = useState<number[] | undefined>(undefined);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('cab360');

  // Photo Mode State
  const [isPhotoMode, setIsPhotoMode] = useState(false);

  // Modals visibility
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrainSelectOpen, setIsTrainSelectOpen] = useState(false);
  const [isRouteSelectOpen, setIsRouteSelectOpen] = useState(false);
  const [isWeatherSelectOpen, setIsWeatherSelectOpen] = useState(false);
  const [tripSummary, setTripSummary] = useState<any>(null);

  // Driver Career Profile (Stored in localStorage)
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(() => {
    try {
      const saved = localStorage.getItem('tse_driver_profile');
      return saved ? JSON.parse(saved) : INITIAL_DRIVER_PROFILE;
    } catch {
      return INITIAL_DRIVER_PROFILE;
    }
  });

  // Save profile helper
  const handleUpdateProfile = useCallback((updated: Partial<DriverProfile>) => {
    setDriverProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('tse_driver_profile', JSON.stringify(next));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
      return next;
    });
  }, []);

  // Save captured scenic snapshot
  const handleSaveSnapshot = useCallback((snapshot: Snapshot) => {
    setDriverProfile((prev) => {
      const currentSnaps = prev.snapshots || [];
      const next = {
        ...prev,
        snapshots: [snapshot, ...currentSnaps]
      };
      try {
        localStorage.setItem('tse_driver_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Award XP & Coins callback
  const handleScoreEarned = useCallback((xp: number, coins: number, reason: string) => {
    setDriverProfile((prev) => {
      const next = {
        ...prev,
        xp: prev.xp + xp,
        coins: prev.coins + coins,
        perfectStops: prev.perfectStops + 1
      };
      try {
        localStorage.setItem('tse_driver_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Random Event resolution callback
  const handleEventResolved = useCallback((xp: number, coins: number, reason: string) => {
    setDriverProfile((prev) => {
      const next = {
        ...prev,
        xp: prev.xp + xp,
        coins: prev.coins + coins,
        eventsResolved: (prev.eventsResolved || 0) + 1
      };
      try {
        localStorage.setItem('tse_driver_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Trip Complete callback
  const handleTripComplete = useCallback((stats: any) => {
    const earnedXP = 500;
    const earnedCoins = 250;
    setTripSummary({
      ...stats,
      earnedXP,
      earnedCoins
    });
    setDriverProfile((prev) => {
      const next = {
        ...prev,
        xp: prev.xp + earnedXP,
        coins: prev.coins + earnedCoins,
        tripsCompleted: prev.tripsCompleted + 1,
        totalDistanceKm: prev.totalDistanceKm + (stats.distance || 125)
      };
      try {
        localStorage.setItem('tse_driver_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Train Physics Engine Hook
  const {
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
    setHeadlights,
    cycleHeadlights,
    setCabLight,
    setWipers,
    currentTargetStation,
    activeStations
  } = useTrainPhysics({
    locoConfig: selectedLoco,
    serviceType,
    selectedStationIds: customStationIds,
    onScoreEarned: handleScoreEarned,
    onTripComplete: handleTripComplete
  });

  // Random Events System Hook
  const {
    activeEvent,
    triggerEvent: triggerRandomEvent
  } = useRandomEvents({
    speedKmh: telemetry.speedKmh,
    currentWeather: weather,
    wipersOn: telemetry.wipersOn,
    headlightsOn: telemetry.headlightsOn,
    hornActive: telemetry.hornActive,
    awsAcknowledged: telemetry.awsAcknowledged,
    onEventResolved: handleEventResolved,
    onSetWeather: setWeather
  });

  const handleStartAudio = async () => {
    await trainAudio.init();
    setAudioStarted(true);
  };

  const handleRestartTrip = () => {
    setTripSummary(null);
    window.location.reload();
  };

  // Compute dynamic speed limit and signal based on random events
  const effectiveSpeedLimit = activeEvent?.targetSpeedLimit ?? telemetry.targetSpeedLimit;
  const effectiveSignal = activeEvent?.forcedSignal ?? telemetry.currentSignal;
  const currentStationName = currentTargetStation?.name || "Batticaloa Terminal";
  const distToStation = currentTargetStation 
    ? Math.max(0, currentTargetStation.position - telemetry.trainPosition) 
    : 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B0D0E] select-none">
      {/* 3D React Three Fiber Railway Simulator World */}
      <TrainSimulatorScene
        trainPosition={telemetry.trainPosition}
        speedKmh={telemetry.speedKmh}
        throttle={telemetry.throttle}
        throttleNotch={telemetry.throttleNotch}
        brake={telemetry.brake}
        reverser={telemetry.reverser}
        weather={weather}
        cameraMode={cameraMode}
        locoConfig={selectedLoco}
        headlightsOn={telemetry.headlightsOn}
        headlightMode={telemetry.headlightMode || (telemetry.headlightsOn ? 'bright' : 'off')}
        cabLightOn={telemetry.cabLightOn}
        doorsOpen={telemetry.doorsOpen}
        wipersOn={telemetry.wipersOn}
        awsAlarm={telemetry.awsAlarmActive || (activeEvent?.type === 'signal_failure')}
        currentSignal={effectiveSignal}
        speedLimit={effectiveSpeedLimit}
        nextStationName={currentStationName}
        distToStationMeters={distToStation}
        deadmanCountdown={telemetry.deadmanCountdown}
        tractionLocked={telemetry.tractionLocked}
      />

      {/* PHOTO MODE (Hides HUD and provides full camera capture controls) */}
      <PhotoModeOverlay
        isActive={isPhotoMode}
        onExit={() => setIsPhotoMode(false)}
        cameraMode={cameraMode}
        onSetCamera={setCameraMode}
        speedKmh={telemetry.speedKmh}
        locoConfig={selectedLoco}
        stationName={currentStationName}
        weather={weather}
        onSaveSnapshot={handleSaveSnapshot}
      />

      {/* CONSOLIDATED LANDSCAPE CONTROL & TELEMETRY HUD (Visible when not in Photo Mode) */}
      {!isPhotoMode && (
        <LandscapeHUD
          telemetry={{
            ...telemetry,
            targetSpeedLimit: effectiveSpeedLimit,
            currentSignal: effectiveSignal
          }}
          targetStation={currentTargetStation}
          cameraMode={cameraMode}
          onSetCamera={setCameraMode}
          weather={weather}
          onSetWeather={setWeather}
          // Modals
          onOpenMap={() => setIsMapOpen(true)}
          onOpenTimetable={() => setIsTimetableOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenTrainSelect={() => setIsTrainSelectOpen(true)}
          onOpenRouteSelect={() => setIsRouteSelectOpen(true)}
          onOpenWeatherSelect={() => setIsWeatherSelectOpen(true)}
          onEnterPhotoMode={() => setIsPhotoMode(true)}
          // Controls
          onSetThrottle={setThrottle}
          onSetBrake={setBrake}
          onSetReverser={setReverser}
          onTriggerHorn={triggerHorn}
          onToggleSander={toggleSander}
          onOpenDoors={openDoors}
          onCloseDoors={closeDoors}
          onResetDeadman={resetDeadman}
          onAcknowledgeAws={acknowledgeAws}
          onToggleHeadlights={() => setHeadlights(!telemetry.headlightsOn)}
          onCycleHeadlights={cycleHeadlights}
          onToggleCabLight={() => setCabLight(!telemetry.cabLightOn)}
          onToggleWipers={() => setWipers(!telemetry.wipersOn)}
          // Random Events
          activeEvent={activeEvent}
          onTriggerRandomEvent={() => triggerRandomEvent()}
        />
      )}

      {/* Audio Initializer Banner (if user hasn't clicked yet) */}
      {!audioStarted && !isPhotoMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-[#CCFF00] bg-black/90 p-3.5 shadow-2xl backdrop-blur-xl animate-bounce">
          <Volume2 className="h-5 w-5 text-[#CCFF00]" />
          <span className="text-xs font-bold text-white">
            Audio Synthesizer Engine Ready
          </span>
          <button
            onClick={handleStartAudio}
            className="rounded-xl bg-[#CCFF00] px-3.5 py-1.5 text-xs font-extrabold text-black shadow-md hover:bg-lime-400 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>ENABLE DIESEL SOUNDS</span>
          </button>
        </div>
      )}

      {/* PWA Offline Ready & Install Banner */}
      <PWAInstallBanner />

      {/* Modals */}
      <RouteMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        trainPosition={telemetry.trainPosition}
      />

      <TimetableModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        stations={activeStations}
        currentStationIndex={telemetry.currentStationIndex}
        serviceType={serviceType}
        tripTimeSeconds={telemetry.tripTimeSeconds}
      />

      <DriverProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={driverProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      <TrainSelectorModal
        isOpen={isTrainSelectOpen}
        onClose={() => setIsTrainSelectOpen(false)}
        selectedLoco={selectedLoco}
        onSelectLoco={setSelectedLoco}
        driverLevel={Math.floor(driverProfile.xp / 1000) + 1}
      />

      <RouteSelectorModal
        isOpen={isRouteSelectOpen}
        onClose={() => setIsRouteSelectOpen(false)}
        selectedService={serviceType}
        onSelectService={(srv, customIds) => {
          setServiceType(srv);
          if (customIds) setCustomStationIds(customIds);
        }}
      />

      <WeatherSelector
        isOpen={isWeatherSelectOpen}
        onClose={() => setIsWeatherSelectOpen(false)}
        selectedWeather={weather}
        onSelectWeather={setWeather}
      />

      <TripCompleteModal
        isOpen={!!tripSummary}
        onRestart={handleRestartTrip}
        stats={
          tripSummary || {
            totalTime: 0,
            comfortScore: 100,
            distance: 125,
            earnedXP: 500,
            earnedCoins: 250
          }
        }
      />
    </div>
  );
}

