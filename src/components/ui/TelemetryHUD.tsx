import React from 'react';
import { SimulationTelemetry, StationData, CameraViewMode, WeatherType } from '../../types';
import {
  Gauge,
  Navigation,
  ShieldAlert,
  Clock,
  Compass,
  Zap,
  Eye,
  Radio,
  Sparkles,
  MapPin,
  Volume2
} from 'lucide-react';

interface TelemetryHUDProps {
  telemetry: SimulationTelemetry;
  targetStation?: StationData;
  cameraMode: CameraViewMode;
  onSetCamera: (mode: CameraViewMode) => void;
  onOpenMap: () => void;
  onOpenTimetable: () => void;
  onOpenProfile: () => void;
  onOpenTrainSelect: () => void;
  onOpenRouteSelect: () => void;
  onOpenWeatherSelect: () => void;
  weather: WeatherType;
}

export function TelemetryHUD({
  telemetry,
  targetStation,
  cameraMode,
  onSetCamera,
  onOpenMap,
  onOpenTimetable,
  onOpenProfile,
  onOpenTrainSelect,
  onOpenRouteSelect,
  onOpenWeatherSelect,
  weather
}: TelemetryHUDProps) {
  const distToNextStation = targetStation
    ? Math.max(0, targetStation.position - telemetry.trainPosition)
    : 0;

  // Signal color classes
  let signalClass = "bg-emerald-500 shadow-emerald-500/50";
  let signalLabel = "LINE CLEAR (GREEN)";
  if (telemetry.currentSignal === 'yellow') {
    signalClass = "bg-amber-400 shadow-amber-400/50";
    signalLabel = "CAUTION (YELLOW)";
  } else if (telemetry.currentSignal === 'double_yellow') {
    signalClass = "bg-amber-500 shadow-amber-500/50";
    signalLabel = "PRE-CAUTION (2-YELLOW)";
  } else if (telemetry.currentSignal === 'red') {
    signalClass = "bg-red-500 shadow-red-500/50";
    signalLabel = "DANGER / STOP (RED)";
  }

  // Format distance
  const formattedDist =
    distToNextStation >= 1000
      ? `${(distToNextStation / 1000).toFixed(2)} km`
      : `${Math.round(distToNextStation)} m`;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Brand & Route Info Widget */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#CCFF00]/30 bg-obsidian-glass p-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0055A5] to-[#0284C7] shadow-lg border border-[#CCFF00]/40">
            <Radio className="h-6 w-6 text-[#CCFF00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-wider text-[#CCFF00] uppercase glow-lime">
                Train Simulator Eastern
              </h1>
              <span className="rounded bg-[#CCFF00]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#CCFF00] border border-[#CCFF00]/40">
                PWA v1.0
              </span>
            </div>
            <p className="text-xs text-gray-300 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">PGV Creation</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300">Batticaloa ➔ Pottuvil Line (125 km)</span>
            </p>
          </div>
        </div>

        {/* Top Quick Actions Menu */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* Route Map Button */}
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B0D0E]/80 px-3 py-2 text-xs font-semibold text-white hover:border-[#CCFF00] hover:bg-[#CCFF00]/10 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Navigation className="h-4 w-4 text-[#CCFF00]" />
            <span className="hidden sm:inline">Line Map</span>
          </button>

          {/* Timetable Button */}
          <button
            onClick={onOpenTimetable}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B0D0E]/80 px-3 py-2 text-xs font-semibold text-white hover:border-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Clock className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Schedule</span>
          </button>

          {/* Train Fleet Selector */}
          <button
            onClick={onOpenTrainSelect}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B0D0E]/80 px-3 py-2 text-xs font-semibold text-white hover:border-blue-400 hover:bg-blue-500/10 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">Fleet</span>
          </button>

          {/* Service Mode Selector */}
          <button
            onClick={onOpenRouteSelect}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B0D0E]/80 px-3 py-2 text-xs font-semibold text-white hover:border-amber-400 hover:bg-amber-500/10 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Service</span>
          </button>

          {/* Weather & Sky Selector */}
          <button
            onClick={onOpenWeatherSelect}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B0D0E]/80 px-3 py-2 text-xs font-semibold text-white hover:border-purple-400 hover:bg-purple-500/10 transition-all active:scale-95 cursor-pointer shadow-lg capitalize"
          >
            <Eye className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">{weather.replace('_', ' ')}</span>
          </button>

          {/* Driver Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 rounded-xl border border-[#CCFF00]/40 bg-gradient-to-r from-[#0055A5] to-[#0284C7] px-3 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Compass className="h-4 w-4 text-[#CCFF00]" />
            <span>Driver Dossier</span>
          </button>
        </div>
      </div>

      {/* Center Left / Telemetry Panels */}
      <div className="flex flex-col gap-3 max-w-xs sm:max-w-sm mt-2">
        {/* Primary Digital Speedometer Card */}
        <div className="pointer-events-auto rounded-2xl border border-[#CCFF00]/40 bg-obsidian-glass p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-[#CCFF00]" />
              LOCOMOTIVE SPEED
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">LIMIT:</span>
              <span className="rounded bg-red-600/30 border border-red-500/50 px-2 py-0.5 font-mono-tech text-xs font-bold text-red-400">
                {telemetry.targetSpeedLimit} km/h
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span
                className={`font-mono-tech text-4xl sm:text-5xl font-extrabold tracking-tight ${
                  telemetry.speedKmh > telemetry.targetSpeedLimit
                    ? 'text-red-500 glow-red animate-pulse'
                    : 'text-[#CCFF00] glow-lime'
                }`}
              >
                {telemetry.speedKmh.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase">KM/H</span>
            </div>

            <div className="text-right font-mono-tech text-xs">
              <div className="text-gray-400">NOTCH: <span className="text-white font-bold">{telemetry.throttleNotch}/8</span></div>
              <div className="text-gray-400">BRAKE: <span className="text-red-400 font-bold">{telemetry.brake}%</span></div>
            </div>
          </div>

          {/* Linear Speed Limit Bar */}
          <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full bg-gray-900 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                telemetry.speedKmh > telemetry.targetSpeedLimit
                  ? 'bg-red-500 shadow-[0_0_12px_#EF4444]'
                  : 'bg-[#CCFF00] shadow-[0_0_12px_#CCFF00]'
              }`}
              style={{ width: `${Math.min(100, (telemetry.speedKmh / 130) * 100)}%` }}
            />
          </div>
        </div>

        {/* Next Station Distance & Approach Card */}
        {targetStation && (
          <div className="pointer-events-auto rounded-2xl border border-emerald-500/30 bg-obsidian-glass p-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                  NEXT STATION CALL
                </span>
              </div>
              <span className="font-mono-tech text-xs font-bold text-emerald-300">
                {formattedDist}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">
                  {targetStation.name}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {targetStation.nameTamil} • {targetStation.nameSinhala}
                </p>
              </div>

              <div className="text-right text-[11px]">
                <span className="text-gray-400">Platform: </span>
                <span className="font-bold text-[#CCFF00]">{targetStation.platformSide}</span>
              </div>
            </div>

            {/* Platform Stop Alignment Guide when approaching */}
            {distToNextStation < 150 && (
              <div className="mt-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-center text-xs">
                {telemetry.isAtPlatform ? (
                  <span className="font-bold text-emerald-400 animate-pulse">
                    ✓ TRAIN ALIGNED AT PLATFORM — OPEN DOORS
                  </span>
                ) : (
                  <span className="font-bold text-amber-300">
                    APPROACHING PLATFORM (TOLERANCE ±{targetStation.stopTolerance}m)
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Track Signaling & AWS Warning Card */}
        <div className="pointer-events-auto flex items-center justify-between rounded-xl border border-white/10 bg-obsidian-glass px-3 py-2 text-xs backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className={`h-3.5 w-3.5 rounded-full shadow-lg ${signalClass}`} />
            <span className="font-bold text-white font-mono-tech text-[11px]">
              {signalLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono-tech text-[11px] text-gray-400">
            <ShieldAlert className="h-3.5 w-3.5 text-gray-400" />
            <span>AWS: {telemetry.awsAlarmActive ? 'WARNING' : 'CLEAR'}</span>
          </div>
        </div>
      </div>

      {/* Camera Mode Selector Strip (Bottom Right) */}
      <div className="pointer-events-auto self-end mb-2 sm:mb-4 flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#CCFF00]/30 bg-black/70 p-1.5 shadow-2xl backdrop-blur-xl">
        {[
          { id: 'cab360', label: '🔄 360° Cab Look' },
          { id: 'driver', label: '👁️ Driver Eye' },
          { id: 'chase', label: '🎥 Outside Chase' },
          { id: 'coastal', label: '🌊 Coastal View' },
          { id: 'drone', label: '🚁 Drone Heli' },
          { id: 'passenger', label: '🪟 Passenger' }
        ].map((cam) => {
          const isActive = cameraMode === cam.id || (cam.id === 'cab360' && cameraMode === 'cab');
          return (
            <button
              key={cam.id}
              onClick={() => onSetCamera(cam.id as CameraViewMode)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/40'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cam.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
