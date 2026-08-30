import React, { useEffect, useState } from 'react';
import { 
  SimulationTelemetry, 
  StationData, 
  CameraViewMode, 
  WeatherType, 
  RandomEvent 
} from '../../types';
import {
  Gauge,
  MapPin,
  Navigation,
  Volume2,
  ShieldAlert,
  Sun,
  Moon,
  CloudRain,
  Lightbulb,
  DoorOpen,
  DoorClosed,
  Clock,
  Zap,
  Sparkles,
  Eye,
  Camera,
  AlertTriangle,
  Compass,
  Maximize,
  Minimize,
  Flame,
  BookOpen
} from 'lucide-react';

interface LandscapeHUDProps {
  telemetry: SimulationTelemetry;
  targetStation?: StationData;
  cameraMode: CameraViewMode;
  onSetCamera: (mode: CameraViewMode) => void;
  weather: WeatherType;
  onSetWeather?: (weather: WeatherType) => void;
  // Modals
  onOpenMap: () => void;
  onOpenTimetable: () => void;
  onOpenProfile: () => void;
  onOpenTrainSelect: () => void;
  onOpenRouteSelect: () => void;
  onOpenWeatherSelect: () => void;
  onOpenTrainingGuide?: () => void;
  onEnterPhotoMode: () => void;
  // Controls
  onSetThrottle: (val: number) => void;
  onSetBrake: (val: number) => void;
  onSetReverser: (rev: 1 | 0 | -1) => void;
  onTriggerHorn: () => void;
  onToggleSander: () => void;
  onOpenDoors: () => void;
  onCloseDoors: () => void;
  onResetDeadman: () => void;
  onAcknowledgeAws: () => void;
  onToggleHeadlights: () => void;
  onCycleHeadlights?: () => void;
  onToggleCabLight: () => void;
  onToggleWipers: () => void;
  // Random Events
  activeEvent: RandomEvent | null;
  onTriggerRandomEvent: () => void;
}

export function LandscapeHUD({
  telemetry,
  targetStation,
  cameraMode,
  onSetCamera,
  weather,
  onSetWeather,
  onOpenMap,
  onOpenTimetable,
  onOpenProfile,
  onOpenTrainSelect,
  onOpenRouteSelect,
  onOpenWeatherSelect,
  onOpenTrainingGuide,
  onEnterPhotoMode,
  onSetThrottle,
  onSetBrake,
  onSetReverser,
  onTriggerHorn,
  onToggleSander,
  onOpenDoors,
  onCloseDoors,
  onResetDeadman,
  onAcknowledgeAws,
  onToggleHeadlights,
  onCycleHeadlights,
  onToggleCabLight,
  onToggleWipers,
  activeEvent,
  onTriggerRandomEvent
}: LandscapeHUDProps) {

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Pro Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      // Throttle (W/S or 0-8)
      if (key === 'w' || key === 'arrowup') {
        const nextNotch = Math.min(8, telemetry.throttleNotch + 1);
        onSetThrottle((nextNotch / 8) * 100);
      } else if (key === 's' || key === 'arrowdown') {
        const nextNotch = Math.max(0, telemetry.throttleNotch - 1);
        onSetThrottle((nextNotch / 8) * 100);
      } else if (['0','1','2','3','4','5','6','7','8'].includes(key)) {
        const notch = parseInt(key, 10);
        onSetThrottle((notch / 8) * 100);
      }

      // Air Brakes (A/D)
      if (key === 'd') {
        onSetBrake(Math.min(100, telemetry.brake + 12.5));
      } else if (key === 'a') {
        onSetBrake(Math.max(0, telemetry.brake - 12.5));
      }

      // Reverser (F / N / R)
      if (key === 'f') onSetReverser(1);
      if (key === 'n') onSetReverser(0);
      if (key === 'r') onSetReverser(-1);

      // Horn (H or Space)
      if (key === 'h' || key === ' ') {
        e.preventDefault();
        onTriggerHorn();
      }

      // Doors (O)
      if (key === 'o') {
        if (telemetry.doorsOpen.left || telemetry.doorsOpen.right) {
          onCloseDoors();
        } else {
          onOpenDoors();
        }
      }

      // Vigilance / Deadman (V or Enter)
      if (key === 'v' || key === 'enter') {
        onResetDeadman();
        onAcknowledgeAws();
      }

      // Headlights (L)
      if (key === 'l') {
        if (onCycleHeadlights) onCycleHeadlights();
        else onToggleHeadlights();
      }

      // Photo Mode (P)
      if (key === 'p') {
        onEnterPhotoMode();
      }

      // Map (M)
      if (key === 'm') {
        onOpenMap();
      }

      // Timetable (T)
      if (key === 't') {
        onOpenTimetable();
      }

      // Sander (X)
      if (key === 'x') {
        onToggleSander();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    telemetry.throttleNotch,
    telemetry.brake,
    telemetry.doorsOpen,
    onSetThrottle,
    onSetBrake,
    onSetReverser,
    onTriggerHorn,
    onOpenDoors,
    onCloseDoors,
    onResetDeadman,
    onAcknowledgeAws,
    onToggleHeadlights,
    onCycleHeadlights,
    onToggleSander,
    onEnterPhotoMode,
    onOpenMap,
    onOpenTimetable
  ]);

  const areDoorsOpen = telemetry.doorsOpen.left || telemetry.doorsOpen.right;
  const distMeters = targetStation ? Math.max(0, targetStation.position - telemetry.trainPosition) : 0;
  const formattedDist = distMeters > 1000 
    ? `${(distMeters / 1000).toFixed(1)} km` 
    : `${Math.round(distMeters)} m`;

  const headlightModeText = telemetry.headlightMode === 'bright' ? 'BRIGHT' : telemetry.headlightMode === 'dim' ? 'DIM' : 'OFF';

  const handleHeadlightClick = () => {
    if (onCycleHeadlights) {
      onCycleHeadlights();
    } else {
      onToggleHeadlights();
    }
  };

  const handleQuickWeatherToggle = () => {
    if (!onSetWeather) return;
    if (weather === 'night') {
      onSetWeather('sunny');
    } else if (weather === 'sunny') {
      onSetWeather('golden_hour');
    } else if (weather === 'golden_hour') {
      onSetWeather('night');
    } else {
      onSetWeather('sunny');
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4 overflow-hidden select-none font-sans">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & CAMERA SELECTOR BAR                          */}
      {/* ============================================================ */}
      <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 text-white shadow-xl max-w-full">
        {/* Brand & Route Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase">
            <span>PWA v1.0</span>
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold tracking-wide text-cyan-300 flex items-center gap-1.5">
              TRAIN SIMULATOR EASTERN
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              PGV Creation (Batticaloa ➔ Pottuvil Line)
            </p>
          </div>
        </div>

        {/* Quick Menu Modals */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
          <button
            onClick={onOpenMap}
            title="Route Map (M)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Map</span>
          </button>

          <button
            onClick={onOpenTimetable}
            title="Timetable (T)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Schedule</span>
          </button>

          <button
            onClick={onOpenTrainSelect}
            title="Locomotive Fleet"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden md:inline">Fleet</span>
          </button>

          <button
            onClick={onOpenRouteSelect}
            title="Service Mode"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Service</span>
          </button>

          <button
            onClick={onOpenWeatherSelect}
            title="Atmosphere & Weather"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Atmosphere</span>
          </button>

          <button
            onClick={onOpenTrainingGuide}
            title="Locomotive Training Guide (G)"
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl border border-cyan-500/40 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Training</span>
          </button>

          <button
            onClick={onTriggerRandomEvent}
            title="Trigger Random Incident Scenario"
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl border border-amber-500/30 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Scenario</span>
          </button>

          <button
            onClick={onOpenProfile}
            title="Driver Dossier"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-white/10 text-[11px] font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Career</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-white/10 transition active:scale-95 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Camera Selector & Photo Mode */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-xl border border-white/10">
            {[
              { id: 'cab360', label: '🔄 360° Cab' },
              { id: 'driver', label: '👁️ Driver' },
              { id: 'chase', label: '🎥 Chase' },
              { id: 'coastal', label: '🌊 Coastal' },
              { id: 'drone', label: '🚁 Drone' },
              { id: 'passenger', label: '🪟 Passenger' }
            ].map((cam) => {
              const isActive = cameraMode === cam.id;
              return (
                <button
                  key={cam.id}
                  onClick={() => onSetCamera(cam.id as CameraViewMode)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={onEnterPhotoMode}
            title="Photo Mode (P)"
            className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Photo</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP-LEFT: FLOATING SPEEDOMETER BADGE                      */}
      {/* ============================================================ */}
      <div className="absolute top-16 sm:top-20 left-3 sm:left-4 z-10 pointer-events-auto">
        <div className="bg-slate-950/75 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl min-w-[155px]">
          {/* Speed & Limit Row */}
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1 font-bold text-[11px]">
              <Gauge className="w-3.5 h-3.5 text-lime-400" /> SPEED
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
              telemetry.speedKmh > telemetry.targetSpeedLimit
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-red-500/10 text-red-300 border-red-500/30'
            }`}>
              LIMIT: {telemetry.targetSpeedLimit}
            </span>
          </div>

          {/* Big Bold Numerals */}
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl sm:text-4xl font-black tracking-tight font-mono leading-none ${
              telemetry.speedKmh > telemetry.targetSpeedLimit
                ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                : 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,0.4)]'
            }`}>
              {telemetry.speedKmh.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">KM/H</span>
          </div>

          {/* Speed Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden my-1.5">
            <div
              className={`h-full transition-all duration-150 ${
                telemetry.speedKmh > telemetry.targetSpeedLimit ? 'bg-red-500' : 'bg-lime-400'
              }`}
              style={{ width: `${Math.min(100, (telemetry.speedKmh / (telemetry.targetSpeedLimit * 1.3)) * 100)}%` }}
            />
          </div>

          {/* Notch & Brake Status */}
          <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-900/90 p-1.5 rounded-lg text-slate-300 text-center font-semibold">
            <div>NOTCH: <span className="font-bold text-lime-400">{telemetry.throttleNotch}/8</span></div>
            <div>BRAKE: <span className="font-bold text-red-400">{Math.round(telemetry.brake)}%</span></div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. TOP-RIGHT: FLOATING LOCATION BADGE                        */}
      {/* ============================================================ */}
      <div className="absolute top-16 sm:top-20 right-3 sm:right-4 z-10 pointer-events-auto">
        <div className="bg-slate-950/75 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl min-w-[170px] text-right">
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium mb-1">
            <span className="text-emerald-400 font-mono text-xs font-black">
              {formattedDist}
            </span>
            <span className="flex items-center gap-1 font-bold text-[11px]">
              LOCATION <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>

          <h2 className="text-xs sm:text-sm font-black text-white tracking-wide truncate max-w-[200px]">
            {targetStation?.name || "Batticaloa Terminal"}
          </h2>
          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
            {targetStation ? `${targetStation.nameTamil} • ${targetStation.nameSinhala}` : "மட்டக்களப்பு • මඩකලපුව"}
          </p>

          <div className="mt-1.5 flex justify-between items-center text-[10px] bg-slate-900/90 px-2 py-1 rounded-lg text-slate-300">
            <span className="text-slate-400">Platform:</span>
            <span className="text-emerald-400 font-bold">
              {targetStation?.platformSide || "BOTH"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ACTIVE INCIDENT FLOATING ALERT BANNER (IF ACTIVE)         */}
      {/* ============================================================ */}
      {activeEvent && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-lg w-full px-4">
          <div className="bg-amber-950/90 border border-amber-500/60 p-2.5 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-300">{activeEvent.title}</div>
                <div className="text-[10px] text-amber-200/80">{activeEvent.instructions}</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/40">
                {activeEvent.remainingSeconds}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. BOTTOM BAR: FLOATING CORNER CONTROLS (NON-BLOCKING)       */}
      {/* ============================================================ */}

      {/* BOTTOM-LEFT: Reverser Pill & Quick Lights / Weather Toggles */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10 pointer-events-auto flex flex-col gap-2">
        {/* Reverser Switch Row */}
        <div className="bg-slate-950/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 px-2">REV</span>
          {[
            { code: 1, label: 'FWD (F)' },
            { code: 0, label: 'NEU (N)' },
            { code: -1, label: 'REV (R)' }
          ].map((m) => {
            const active = telemetry.reverser === m.code;
            return (
              <button
                key={m.code}
                onClick={() => onSetReverser(m.code as 1 | 0 | -1)}
                className={`py-1 px-2 rounded-xl transition text-center text-[10px] font-bold cursor-pointer active:scale-95 ${
                  active 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md' 
                    : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Quick Toggles: Headlights, Night/Day, Wipers, Sander */}
        <div className="bg-slate-950/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5">
          {/* Headlights 3-way toggle (OFF / DIM / BRIGHT) */}
          <button
            onClick={handleHeadlightClick}
            title="Headlight Mode (L): OFF / DIM / BRIGHT"
            className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 active:scale-95 ${
              telemetry.headlightsOn
                ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>{headlightModeText}</span>
          </button>

          {/* Quick Day / Night Switch */}
          <button
            onClick={handleQuickWeatherToggle}
            title="Quick Day / Night Switch"
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center active:scale-95 ${
              weather === 'night'
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md'
                : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {weather === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Interior Cab Light */}
          <button
            onClick={onToggleCabLight}
            title="Interior Cab Light"
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center active:scale-95 ${
              telemetry.cabLightOn
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-md'
                : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>

          {/* Windshield Wipers */}
          <button
            onClick={onToggleWipers}
            title="Windshield Wipers"
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center active:scale-95 ${
              telemetry.wipersOn
                ? 'bg-blue-400 text-black border-blue-300 shadow-md'
                : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>

          {/* Track Sander */}
          <button
            onClick={onToggleSander}
            title="Track Sander (X)"
            className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex items-center justify-center active:scale-95 ${
              telemetry.sanderActive
                ? 'bg-orange-500 text-white border-orange-400 shadow-md'
                : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BOTTOM-CENTER: Floating Action Buttons (Dual Horn, Doors, VCS) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto flex items-center gap-2">
        {/* Dual Horn Button */}
        <button 
          onClick={onTriggerHorn}
          className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs py-2.5 px-3.5 sm:px-4 rounded-2xl flex items-center gap-1.5 shadow-2xl transition cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>DUAL HORN [H]</span>
        </button>

        {/* Doors Control Button */}
        <button 
          onClick={areDoorsOpen ? onCloseDoors : onOpenDoors}
          className={`font-bold text-xs py-2.5 px-3.5 sm:px-4 rounded-2xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xl ${
            areDoorsOpen 
              ? 'bg-red-500 text-white shadow-red-500/40' 
              : 'bg-slate-950/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20'
          }`}
        >
          {areDoorsOpen ? <DoorClosed className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
          <span>{areDoorsOpen ? 'CLOSE DOORS [O]' : 'OPEN DOORS [O]'}</span>
        </button>

        {/* Vigilance / Deadman Reset Button */}
        <button 
          onClick={onResetDeadman}
          className={`font-bold text-xs py-2.5 px-3.5 sm:px-4 rounded-2xl flex items-center gap-1.5 border transition cursor-pointer active:scale-95 shadow-2xl ${
            telemetry.deadmanCountdown <= 10
              ? 'bg-red-500/30 border-red-500 text-red-200 animate-pulse'
              : 'bg-slate-950/80 hover:bg-slate-900 text-cyan-300 border-white/10'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>VCS ({Math.ceil(telemetry.deadmanCountdown)}s) [V]</span>
        </button>
      </div>

      {/* BOTTOM-RIGHT: Compact Vertical Throttle & Air Brake Sliders */}
      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 pointer-events-auto flex items-center gap-3 bg-slate-950/75 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl border border-white/10 shadow-2xl text-white">
        {/* Throttle Vertical Slider */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-lime-400 uppercase tracking-wider">
            THROTTLE
          </span>
          <div className="relative flex items-center justify-center h-28 sm:h-32 w-10">
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={telemetry.throttleNotch}
              disabled={telemetry.tractionLocked}
              onChange={(e) => onSetThrottle(Number(e.target.value) * 12.5)}
              className="w-24 sm:w-28 -rotate-90 origin-center bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-400"
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-lime-300">
            {telemetry.tractionLocked ? 'LOCKED' : `N${telemetry.throttleNotch}`}
          </span>
        </div>

        <div className="w-[1px] h-28 sm:h-32 bg-white/10" />

        {/* Air Brake Vertical Slider */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
            BRAKE
          </span>
          <div className="relative flex items-center justify-center h-28 sm:h-32 w-10">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={telemetry.brake}
              onChange={(e) => onSetBrake(Number(e.target.value))}
              className="w-24 sm:w-28 -rotate-90 origin-center bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-red-300">
            {Math.round(telemetry.brake)}%
          </span>
        </div>
      </div>

    </div>
  );
}
