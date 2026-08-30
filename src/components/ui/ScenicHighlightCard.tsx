import React from 'react';
import { 
  Waves, Moon, Trees, Anchor, Compass, Building, 
  Sun, Clock, Sparkles, Flame, X, MapPin, Gauge 
} from 'lucide-react';
import { ScenicPoint } from '../../types';

interface ScenicHighlightCardProps {
  scenicPoint: ScenicPoint | null;
  distanceMeters: number;
  onDismiss: () => void;
}

export function ScenicHighlightCard({
  scenicPoint,
  distanceMeters,
  onDismiss
}: ScenicHighlightCardProps) {
  if (!scenicPoint) return null;

  const renderIcon = () => {
    switch (scenicPoint.icon) {
      case 'Waves':
        return <Waves className="w-6 h-6 text-cyan-400" />;
      case 'Moon':
        return <Moon className="w-6 h-6 text-amber-400" />;
      case 'Trees':
        return <Trees className="w-6 h-6 text-emerald-400" />;
      case 'Anchor':
        return <Anchor className="w-6 h-6 text-blue-400" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-sky-400" />;
      case 'Building':
        return <Building className="w-6 h-6 text-indigo-400" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-orange-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-rose-400" />;
      default:
        return <MapPin className="w-6 h-6 text-cyan-400" />;
    }
  };

  const isAtPoint = Math.abs(distanceMeters) <= 30;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl p-4 text-slate-100 flex gap-4">
        {/* Glow corner accent */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Emblem */}
        <div className="shrink-0 flex flex-col items-center justify-start pt-1">
          <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-md">
            {renderIcon()}
          </div>
          <span className="text-[10px] font-bold font-mono text-amber-400 mt-2 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
            {isAtPoint ? 'NOW PASSING' : `${Math.abs(Math.round(distanceMeters))}m AHEAD`}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Scenic Heritage Landmark
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                {scenicPoint.name}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {scenicPoint.nameTamil} | {scenicPoint.nameSinhala}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              title="Dismiss highlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {scenicPoint.description}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="italic text-amber-200/90 truncate mr-2">
              "{scenicPoint.tagline}"
            </span>
            <div className="flex items-center gap-1 shrink-0 text-cyan-300 font-mono text-[10px]">
              <Gauge className="w-3 h-3" />
              <span>REC: {scenicPoint.recommendedSpeed} KM/H</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
