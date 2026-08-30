import { useState, useEffect, useCallback, useRef } from 'react';
import { RandomEvent, RandomEventType, WeatherType, SignalAspect } from '../types';
import { trainAudio } from '../utils/audio';

interface UseRandomEventsProps {
  speedKmh: number;
  currentWeather: WeatherType;
  wipersOn: boolean;
  headlightsOn: boolean;
  hornActive: boolean;
  awsAcknowledged: boolean;
  onEventResolved?: (xp: number, coins: number, message: string) => void;
  onSetWeather?: (weather: WeatherType) => void;
}

const EVENT_TEMPLATES: Array<Omit<RandomEvent, 'id' | 'remainingSeconds' | 'active' | 'resolved'>> = [
  {
    type: 'signal_failure',
    title: 'Track Circuit Failure (Red Signal Alert)',
    description: 'Automatic Block Signal dropped to DANGER due to intermittent circuit fault near coastal relay.',
    severity: 'danger',
    durationSeconds: 30,
    forcedSignal: 'red',
    instructions: 'Acknowledge AWS alert (Q/AWS button) and reduce train speed below 15 km/h.',
    actionRequired: 'acknowledge',
    rewardXP: 180,
    rewardCoins: 75
  },
  {
    type: 'weather_shift',
    title: 'Sudden Coastal Monsoon Storm',
    description: 'A sudden squall from the Bay of Bengal has hit the Batticaloa coastal line with heavy rain and poor visibility.',
    severity: 'medium',
    durationSeconds: 45,
    newWeather: 'storm',
    instructions: 'Turn on Windshield Wipers and High-Beam Headlights immediately.',
    actionRequired: 'activate_wipers',
    rewardXP: 140,
    rewardCoins: 50
  },
  {
    type: 'speed_restriction',
    title: 'Temporary Speed Restriction (TSR 25 km/h)',
    description: 'Track maintenance crew working on lagoon culvert bridge. Speed restricted to 25 km/h.',
    severity: 'high',
    durationSeconds: 40,
    targetSpeedLimit: 25,
    instructions: 'Apply service air brakes to reduce speed below 25 km/h before crossing caution zone.',
    actionRequired: 'reduce_speed',
    rewardXP: 160,
    rewardCoins: 60
  },
  {
    type: 'track_obstacle',
    title: 'Wildlife Caution (Livestock near Tracks)',
    description: 'Coastal cattle & wildlife reported crossing railway corridor near lagoon banks.',
    severity: 'high',
    durationSeconds: 25,
    instructions: 'Sound the Dual Horn (H/HORN button) repeatedly and reduce speed under 35 km/h.',
    actionRequired: 'sound_horn',
    rewardXP: 150,
    rewardCoins: 50
  }
];

export function useRandomEvents({
  speedKmh,
  currentWeather,
  wipersOn,
  headlightsOn,
  hornActive,
  awsAcknowledged,
  onEventResolved,
  onSetWeather
}: UseRandomEventsProps) {
  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [eventNotification, setEventNotification] = useState<string | null>(null);
  const [autoEventsEnabled, setAutoEventsEnabled] = useState<boolean>(true);
  const previousWeatherRef = useRef<WeatherType>(currentWeather);
  const speedRef = useRef(speedKmh);
  const hornRef = useRef(hornActive);
  const wipersRef = useRef(wipersOn);
  const headlightsRef = useRef(headlightsOn);
  const awsAckRef = useRef(awsAcknowledged);

  useEffect(() => {
    speedRef.current = speedKmh;
    hornRef.current = hornActive;
    wipersRef.current = wipersOn;
    headlightsRef.current = headlightsOn;
    awsAckRef.current = awsAcknowledged;
  }, [speedKmh, hornActive, wipersOn, headlightsOn, awsAcknowledged]);

  // Manually or dynamically trigger a random scenario
  const triggerEvent = useCallback((preferredType?: RandomEventType) => {
    if (activeEvent && activeEvent.active) return; // Only 1 active event at a time

    let template = preferredType
      ? EVENT_TEMPLATES.find((t) => t.type === preferredType) || EVENT_TEMPLATES[0]
      : EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];

    const newEvt: RandomEvent = {
      ...template,
      id: `event_${Date.now()}`,
      active: true,
      resolved: false,
      remainingSeconds: template.durationSeconds
    };

    if (newEvt.newWeather && onSetWeather) {
      previousWeatherRef.current = currentWeather;
      onSetWeather(newEvt.newWeather);
    }

    if (newEvt.type === 'signal_failure') {
      trainAudio.playVigilanceAlert();
    } else {
      trainAudio.playAwsWarningHorn();
    }

    setActiveEvent(newEvt);
    setEventNotification(`⚠️ INCIDENT: ${newEvt.title}`);
  }, [activeEvent, currentWeather, onSetWeather]);

  // Dismiss / Clear active event
  const resolveCurrentEvent = useCallback((success: boolean) => {
    if (!activeEvent) return;

    if (success && onEventResolved) {
      onEventResolved(
        activeEvent.rewardXP,
        activeEvent.rewardCoins,
        `Resolved: ${activeEvent.title}`
      );
      setEventNotification(`✓ SUCCESS: +${activeEvent.rewardXP} XP / +${activeEvent.rewardCoins} Coins!`);
    } else if (!success) {
      setEventNotification(`⚠️ EVENT EXPIRED: Incident cleared with caution.`);
    }

    // Restore previous weather if it was modified
    if (activeEvent.newWeather && onSetWeather && previousWeatherRef.current) {
      onSetWeather(previousWeatherRef.current);
    }

    setActiveEvent(null);
  }, [activeEvent, onEventResolved, onSetWeather]);

  // Event countdown & resolution condition checker
  useEffect(() => {
    if (!activeEvent || !activeEvent.active) return;

    const timer = setInterval(() => {
      setActiveEvent((prev) => {
        if (!prev || !prev.active) return null;

        const nextSeconds = prev.remainingSeconds - 1;

        // Check success conditions
        let isSuccess = false;
        if (prev.actionRequired === 'activate_wipers') {
          if (wipersRef.current && headlightsRef.current) {
            isSuccess = true;
          }
        } else if (prev.actionRequired === 'sound_horn') {
          if (hornRef.current || speedRef.current <= 35) {
            isSuccess = true;
          }
        } else if (prev.actionRequired === 'reduce_speed') {
          if (speedRef.current <= (prev.targetSpeedLimit || 25)) {
            isSuccess = true;
          }
        } else if (prev.actionRequired === 'acknowledge') {
          if (awsAckRef.current && speedRef.current <= 15) {
            isSuccess = true;
          }
        }

        if (isSuccess && nextSeconds < prev.durationSeconds - 5) {
          // Resolve with bonus
          setTimeout(() => resolveCurrentEvent(true), 100);
          return null;
        }

        if (nextSeconds <= 0) {
          setTimeout(() => resolveCurrentEvent(false), 100);
          return null;
        }

        return {
          ...prev,
          remainingSeconds: nextSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent, resolveCurrentEvent]);

  // Periodic random event spawner (every 75 seconds if enabled)
  useEffect(() => {
    if (!autoEventsEnabled) return;

    const interval = setInterval(() => {
      if (!activeEvent && speedRef.current > 5) {
        const roll = Math.random();
        if (roll < 0.6) { // 60% chance during trip
          triggerEvent();
        }
      }
    }, 75000);

    return () => clearInterval(interval);
  }, [autoEventsEnabled, activeEvent, triggerEvent]);

  return {
    activeEvent,
    eventNotification,
    autoEventsEnabled,
    setAutoEventsEnabled,
    triggerEvent,
    resolveCurrentEvent,
    clearNotification: () => setEventNotification(null)
  };
}
