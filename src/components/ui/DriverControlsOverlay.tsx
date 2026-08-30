import React, { useEffect } from 'react';
import { SimulationTelemetry, StationData } from '../../types';
import {
  Volume2,
  ShieldAlert,
  DoorOpen,
  DoorClosed,
  Sun,
  Lightbulb,
  CloudRain,
  Activity,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface DriverControlsOverlayProps {
  telemetry: SimulationTelemetry;
  targetStation?: StationData;
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
  onToggleCabLight: () => void;
  onToggleWipers: () => void;
}

export function DriverControlsOverlay({
  telemetry,
  targetStation,
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
  onToggleCabLight,
  onToggleWipers
}: DriverControlsOverlayProps) {
  // Global Keyboard Shortcuts for Pro Locomotive Driving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (key === 'w') {
        // Increase throttle
        onSetThrottle(Math.min(100, telemetry.throttle + 12.5));
      } else if (key === 's') {
        // Decrease throttle
        onSetThrottle(Math.max(0, telemetry.throttle - 12.5));
      } else if (key === 'd' || key === ' ') {
        // Increase brake
        onSetBrake(Math.min(100, telemetry.brake + 20));
      } else if (key === 'a') {
        // Release brake
        onSetBrake(Math.max(0, telemetry.brake - 20));
      } else if (key === 'h') {
        // Horn
        onTriggerHorn();
      } else if (key === 'q') {
        // AWS Acknowledge
        onAcknowledgeAws();
      } else if (key === 'v') {
        // Deadman / Vigilance reset
        onResetDeadman();
      } else if (key === 'x') {
        // Sander
        onToggleSander();
      } else if (key === 'l') {
        // Headlights
        onToggleHeadlights();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    telemetry.throttle,
    telemetry.brake,
    onSetThrottle,
    onSetBrake,
    onTriggerHorn,
    onAcknowledgeAws,
    onResetDeadman,
    onToggleSander,
    onToggleHeadlights
  ]);

  const areDoorsOpen = telemetry.doorsOpen.left || telemetry.doorsOpen.right;

  return (
    <div className="pointer-events-none absolute bottom-0 inset-x-0 z-20 flex justify-center p-2 sm:p-4">
      {/* Main Ergonomic Obsidian Console */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 sm:gap-6 rounded-3xl border border-[#CCFF00]/30 bg-black/65 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md max-w-4xl w-full">
        {/* Reverser & Reversing Switch */}
        <div className="flex flex-col items-center gap-1.5 border-r border-white/10 pr-2 sm:pr-4">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            REVERSER
          </span>
          <div className="flex flex-col gap-1 rounded-xl bg-black/60 p-1 border border-white/5">
            <button
              onClick={() => onSetReverser(1)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                telemetry.reverser === 1
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FWD [F]
            </button>
            <button
              onClick={() => onSetReverser(0)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                telemetry.reverser === 0
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              NEU [N]
            </button>
            <button
              onClick={() => onSetReverser(-1)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                telemetry.reverser === -1
                  ? 'bg-red-500 text-black shadow-md shadow-red-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              REV [R]
            </button>
          </div>
        </div>

        {/* Throttle Controller Lever */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-[#CCFF00] tracking-wider">
              THROTTLE
            </span>
            <span className="font-mono-tech text-xs font-bold text-white">
              {Math.round(telemetry.throttle)}%
            </span>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={telemetry.throttle}
              disabled={telemetry.tractionLocked}
              onChange={(e) => onSetThrottle(Number(e.target.value))}
              className="vertical-slider h-24 sm:h-28 accent-[#CCFF00] cursor-pointer"
            />
          </div>

          <span className="font-mono-tech text-[10px] text-gray-400">
            {telemetry.tractionLocked ? (
              <span className="text-red-400 font-bold">LOCKED</span>
            ) : (
              `NOTCH ${telemetry.throttleNotch}`
            )}
          </span>
        </div>

        {/* Air Brake Controller Lever */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-red-400 tracking-wider">
              AIR BRAKE
            </span>
            <span className="font-mono-tech text-xs font-bold text-white">
              {Math.round(telemetry.brake)}%
            </span>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={telemetry.brake}
              onChange={(e) => onSetBrake(Number(e.target.value))}
              className="vertical-slider h-24 sm:h-28 accent-red-500 cursor-pointer"
            />
          </div>

          <span className="font-mono-tech text-[10px] text-red-300">
            {telemetry.brakeMode}
          </span>
        </div>

        {/* Dual Horn & AWS Button Hub */}
        <div className="flex flex-col gap-2 border-x border-white/10 px-2 sm:px-4">
          {/* Dual Horn Lever */}
          <button
            onClick={onTriggerHorn}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 font-display text-xs sm:text-sm font-extrabold text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Volume2 className="h-4 w-4 text-black animate-pulse" />
            <span>DUAL HORN [H]</span>
          </button>

          {/* AWS Acknowledge Button */}
          <button
            onClick={onAcknowledgeAws}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.awsAlarmActive
                ? 'border-yellow-400 bg-yellow-400 text-black shadow-lg shadow-yellow-400/60 animate-bounce'
                : 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>AWS ACK [Q]</span>
          </button>
        </div>

        {/* Station Doors & Interlock Control */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            STATION DOORS
          </span>

          {areDoorsOpen ? (
            <button
              onClick={onCloseDoors}
              className="flex items-center gap-1.5 rounded-xl border border-red-500 bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/40 transition-all hover:bg-red-500 active:scale-95 cursor-pointer"
            >
              <DoorClosed className="h-4 w-4" />
              <span>CLOSE DOORS</span>
            </button>
          ) : (
            <button
              onClick={onOpenDoors}
              disabled={telemetry.speedKmh > 0.2 || !telemetry.isAtPlatform}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                telemetry.isAtPlatform && telemetry.speedKmh <= 0.2
                  ? 'border-emerald-400 bg-emerald-500 text-black shadow-lg shadow-emerald-500/50 animate-pulse'
                  : 'border-white/10 bg-black/40 text-gray-500 cursor-not-allowed'
              }`}
            >
              <DoorOpen className="h-4 w-4" />
              <span>OPEN DOORS</span>
            </button>
          )}

          {telemetry.dwellTimer > 0 && (
            <span className="font-mono-tech text-[10px] font-bold text-emerald-400">
              BOARDING: {Math.ceil(telemetry.dwellTimer)}s
            </span>
          )}
        </div>

        {/* Auxiliary Controls (Sander, Lights, Wipers, Vigilance) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Sander Button */}
          <button
            onClick={onToggleSander}
            title="Track Sanders (Improves wet track adhesion)"
            className={`rounded-xl border p-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.sanderActive
                ? 'border-[#CCFF00] bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/40'
                : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Headlights Toggle */}
          <button
            onClick={onToggleHeadlights}
            title="Locomotive Headlights"
            className={`rounded-xl border p-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.headlightsOn
                ? 'border-yellow-400 bg-yellow-400 text-black shadow-md shadow-yellow-400/40'
                : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
            }`}
          >
            <Sun className="h-4 w-4" />
          </button>

          {/* Cab Interior Light */}
          <button
            onClick={onToggleCabLight}
            title="Cab Interior Dome Light"
            className={`rounded-xl border p-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.cabLightOn
                ? 'border-amber-400 bg-amber-400 text-black shadow-md shadow-amber-400/40'
                : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
          </button>

          {/* Windshield Wipers */}
          <button
            onClick={onToggleWipers}
            title="Windshield Wipers"
            className={`rounded-xl border p-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.wipersOn
                ? 'border-blue-400 bg-blue-400 text-black shadow-md shadow-blue-400/40'
                : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
            }`}
          >
            <CloudRain className="h-4 w-4" />
          </button>

          {/* Deadman / Vigilance Reset Pedal */}
          <button
            onClick={onResetDeadman}
            title="Vigilance Safety Reset"
            className={`flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              telemetry.deadmanAlarmActive
                ? 'border-red-500 bg-red-600 text-white animate-ping'
                : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>VIGILANCE [{Math.ceil(telemetry.deadmanCountdown)}s]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
