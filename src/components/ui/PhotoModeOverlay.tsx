import React, { useState, useRef } from 'react';
import { CameraViewMode, WeatherType, LocomotiveConfig, Snapshot } from '../../types';
import { 
  Camera, 
  X, 
  Download, 
  Sparkles, 
  Grid, 
  Share2, 
  Check, 
  RotateCw, 
  Sliders, 
  Layers,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';
import { trainAudio } from '../../utils/audio';

interface PhotoModeOverlayProps {
  isActive: boolean;
  onExit: () => void;
  cameraMode: CameraViewMode;
  onSetCamera: (mode: CameraViewMode) => void;
  speedKmh: number;
  locoConfig: LocomotiveConfig;
  stationName: string;
  weather: WeatherType;
  onSaveSnapshot: (snapshot: Snapshot) => void;
}

export const PHOTO_FILTERS = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'golden', name: 'Lagoon Sunset', css: 'sepia(0.35) saturate(1.4) contrast(1.1) hue-rotate(-10deg)' },
  { id: 'monsoon', name: 'Monsoon Drama', css: 'contrast(1.3) saturate(1.2) brightness(0.9) hue-rotate(15deg)' },
  { id: 'emerald', name: 'Emerald Coast', css: 'saturate(1.5) contrast(1.15) hue-rotate(-5deg)' },
  { id: 'noir', name: 'Vintage Rail Noir', css: 'grayscale(1) contrast(1.3) brightness(0.95)' }
];

export function PhotoModeOverlay({
  isActive,
  onExit,
  cameraMode,
  onSetCamera,
  speedKmh,
  locoConfig,
  stationName,
  weather,
  onSaveSnapshot
}: PhotoModeOverlayProps) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showGrid, setShowGrid] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [capturedSnapshot, setCapturedSnapshot] = useState<Snapshot | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isActive) return null;

  // Shutter Capture Logic
  const handleCapturePhoto = () => {
    // 1. Trigger Flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    // 2. Play Shutter audio
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}

    // 3. Extract 3D Canvas Stream
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    let dataUrl = '';

    if (canvas) {
      try {
        // Create an offscreen canvas to apply selected filters & watermark
        const offCanvas = document.createElement('canvas');
        offCanvas.width = canvas.width;
        offCanvas.height = canvas.height;
        const ctx = offCanvas.getContext('2d');

        if (ctx) {
          const filterObj = PHOTO_FILTERS.find((f) => f.id === selectedFilter);
          if (filterObj && filterObj.css !== 'none') {
            ctx.filter = filterObj.css;
          }
          ctx.drawImage(canvas, 0, 0);

          if (showWatermark) {
            ctx.filter = 'none';
            // Watermark stamp in bottom right
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(offCanvas.width - 340, offCanvas.height - 60, 320, 48);

            ctx.fillStyle = '#CCFF00';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('TRAIN SIMULATOR EASTERN', offCanvas.width - 325, offCanvas.height - 35);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.fillText(`${stationName} • ${locoConfig.name} • ${speedKmh.toFixed(0)} KM/H`, offCanvas.width - 325, offCanvas.height - 18);
          }

          dataUrl = offCanvas.toDataURL('image/jpeg', 0.92);
        } else {
          dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        }
      } catch (err) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    if (!dataUrl) {
      // Fallback placeholder
      dataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="%230284C7" width="800" height="450"/><text fill="%23ffffff" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="sans-serif">Sri Lanka Eastern Railways Snapshot</text></svg>';
    }

    const newSnapshot: Snapshot = {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      dataUrl,
      locoName: locoConfig.name,
      locationName: stationName || 'Batticaloa - Pottuvil Line',
      speedKmh,
      weather,
      filter: selectedFilter
    };

    setCapturedSnapshot(newSnapshot);
    onSaveSnapshot(newSnapshot);
  };

  const handleDownload = () => {
    if (!capturedSnapshot) return;
    const link = document.createElement('a');
    link.download = `TSE_Snapshot_${new Date(capturedSnapshot.timestamp).toISOString().slice(0, 19).replace(/[:T]/g, '_')}.jpg`;
    link.href = capturedSnapshot.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Shutter Flash FX */}
      <div 
        className={`absolute inset-0 bg-white transition-opacity duration-200 pointer-events-none ${
          flashActive ? 'opacity-90' : 'opacity-0'
        }`} 
      />

      {/* Rule of Thirds Viewfinder Grid */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>
        </div>
      )}

      {/* TOP PHOTO BAR */}
      <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-[#CCFF00]/40 shadow-2xl text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CCFF00] text-black font-extrabold">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wider text-[#CCFF00] uppercase">
              PHOTO MODE & SCENIC SNAPSHOT
            </div>
            <div className="text-[11px] text-gray-300">
              {stationName} • {locoConfig.name} • {weather.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Grid */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2.5 rounded-xl border backdrop-blur-xl transition-all cursor-pointer ${
              showGrid 
                ? 'bg-[#CCFF00] text-black border-[#CCFF00]' 
                : 'bg-black/70 text-gray-300 border-white/20 hover:text-white'
            }`}
            title="Toggle Rule-of-Thirds Grid"
          >
            <Grid className="h-4 w-4" />
          </button>

          {/* Toggle Watermark Stamp */}
          <button
            onClick={() => setShowWatermark(!showWatermark)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border backdrop-blur-xl transition-all cursor-pointer ${
              showWatermark 
                ? 'bg-emerald-500 text-black border-emerald-400' 
                : 'bg-black/70 text-gray-300 border-white/20 hover:text-white'
            }`}
          >
            Stamp: {showWatermark ? 'ON' : 'OFF'}
          </button>

          {/* Exit Photo Mode */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-red-500 shadow-xl transition-all active:scale-95 cursor-pointer backdrop-blur-xl"
          >
            <X className="h-4 w-4" />
            <span>EXIT PHOTO MODE</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CAMERA & FILTER CONTROLS */}
      <div className="absolute bottom-4 inset-x-4 flex flex-col items-center gap-3 pointer-events-auto">
        
        {/* Camera Angles Strip */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 shadow-2xl">
          {[
            { id: 'chase', label: '🎥 Outside Chase' },
            { id: 'coastal', label: '🌊 Coastal Vista' },
            { id: 'drone', label: '🚁 Drone Aerial' },
            { id: 'passenger', label: '🪟 Passenger Window' },
            { id: 'driver', label: '👁️ Driver Cab' },
            { id: 'cab360', label: '🔄 360° Cockpit' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => onSetCamera(c.id as CameraViewMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cameraMode === c.id || (c.id === 'cab360' && cameraMode === 'cab')
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filters Strip & Primary Capture Button */}
        <div className="flex items-center gap-4 bg-slate-950/90 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-[#CCFF00]/40 shadow-2xl">
          {/* Filter Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#CCFF00]" /> FILTER:
            </span>
            {PHOTO_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-[#CCFF00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20" />

          {/* Large Shutter Button */}
          <button
            onClick={handleCapturePhoto}
            className="flex items-center gap-2 bg-gradient-to-r from-[#CCFF00] to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-black font-black text-sm px-6 py-2.5 rounded-2xl shadow-xl shadow-[#CCFF00]/30 active:scale-90 transition-all cursor-pointer glow-lime"
          >
            <Camera className="h-5 w-5 fill-black" />
            <span>CAPTURE PHOTO</span>
          </button>
        </div>
      </div>

      {/* CAPTURE PREVIEW MODAL */}
      {capturedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pointer-events-auto">
          <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-[#CCFF00]/50 bg-[#0B0D0E] p-4 text-white shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Snapshot Saved to Career Dossier!</h3>
                  <p className="text-[11px] text-gray-400">Captured at {new Date(capturedSnapshot.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Photo Preview Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-inner mb-3">
              <img
                src={capturedSnapshot.dataUrl}
                alt="Captured Snapshot"
                className="w-full h-auto object-cover max-h-[50vh]"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-gray-300 font-mono flex items-center gap-2 border border-white/10">
                <span className="text-[#CCFF00] font-bold">{capturedSnapshot.locoName}</span>
                <span>•</span>
                <span>{capturedSnapshot.locationName}</span>
                <span>•</span>
                <span>{capturedSnapshot.speedKmh.toFixed(0)} KM/H</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>DOWNLOAD JPG</span>
              </button>

              <button
                onClick={() => setCapturedSnapshot(null)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#CCFF00] hover:bg-lime-400 text-black font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span>CONTINUE SIMULATION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
