import React, { useEffect, useState } from 'react';
import { StationData } from '../../types';
import { Volume2, MapPin, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { trainAudio } from '../../utils/audio';

interface StationAnnouncementBannerProps {
  station: StationData | null;
  distanceMeters: number;
  speedKmh: number;
  onDismiss?: () => void;
}

export function StationAnnouncementBanner({
  station,
  distanceMeters,
  speedKmh,
  onDismiss
}: StationAnnouncementBannerProps) {
  const [announcedStationId, setAnnouncedStationId] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  // Play audio chime and speak announcement when entering station approach zone (within 280m)
  useEffect(() => {
    if (!station) {
      setVisible(false);
      return;
    }

    if (distanceMeters <= 280 && distanceMeters >= 5 && announcedStationId !== station.id) {
      setAnnouncedStationId(station.id);
      setVisible(true);

      // Play authentic ascending 4-note SLR Station arrival chime
      trainAudio.playStationArrivalChime();

      // Trigger Web Speech synthesis for multilingual Sri Lankan arrival announcement
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const announcementText = `Attention passengers. Train approaching ${station.name}. Platform on ${station.platformSide.toLowerCase()} side. Please mind the platform gap.`;
          const utterance = new SpeechSynthesisUtterance(announcementText);
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          utterance.volume = 0.85;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.warn("Speech synth notification:", e);
      }
    }
  }, [station, distanceMeters, announcedStationId]);

  if (!visible || !station) return null;

  const handleManualReplay = () => {
    trainAudio.playStationArrivalChime();
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const announcementText = `Attention passengers. Train approaching ${station.name}. Platform on ${station.platformSide.toLowerCase()} side.`;
        const utterance = new SpeechSynthesisUtterance(announcementText);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  const handleClose = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-xl w-[92%] sm:w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-950/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/50 text-white relative overflow-hidden">
        {/* Glow Header Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">
                  STATION ARRIVAL NOTICE
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
                  SLR PA SYSTEM
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                {station.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualReplay}
              title="Re-play station audio announcement"
              className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Replay</span>
            </button>
            <button
              onClick={handleClose}
              title="Dismiss announcement"
              className="p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multilingual Station Names */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
          <span className="text-amber-300 font-bold">{station.nameTamil}</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-300 font-bold">{station.nameSinhala}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Platform: <span className="text-white font-bold">{station.platformSide}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Distance: <span className="text-cyan-400 font-bold">{Math.round(distanceMeters)}m</span>
          </span>
        </div>

        {/* Station Description & Scenic highlight */}
        {station.description && (
          <p className="mt-2 text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {station.description}
          </p>
        )}
      </div>
    </div>
  );
}
