import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Coins, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface TripCompleteModalProps {
  isOpen: boolean;
  onRestart: () => void;
  stats: {
    totalTime: number;
    comfortScore: number;
    distance: number;
    earnedXP: number;
    earnedCoins: number;
  };
}

export function TripCompleteModal({ isOpen, onRestart, stats }: TripCompleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSecondsToTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-[#CCFF00]/50 bg-[#0B0D0E] p-6 text-white shadow-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/20 mb-4 animate-bounce">
          <Trophy className="h-10 w-10" />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#CCFF00] tracking-wide uppercase glow-lime">
          Route Terminus Reached!
        </h2>
        <p className="text-sm text-gray-300 mt-1 mb-6">
          Eastern Coastal Line Express Mission Successfully Completed.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              RUN DURATION
            </span>
            <span className="font-mono-tech text-lg font-bold text-white">
              {formatSecondsToTime(stats.totalTime)}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              PASSENGER COMFORT
            </span>
            <span className="font-mono-tech text-lg font-bold text-emerald-400">
              {stats.comfortScore}%
            </span>
          </div>

          <div className="rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 p-3.5">
            <span className="text-[10px] text-[#CCFF00] uppercase font-bold block mb-1">
              XP EARNED
            </span>
            <span className="font-mono-tech text-xl font-extrabold text-[#CCFF00]">
              +{stats.earnedXP} XP
            </span>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3.5">
            <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
              SLR REWARD COINS
            </span>
            <span className="font-mono-tech text-xl font-extrabold text-amber-300">
              +{stats.earnedCoins} Coins
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#CCFF00] py-3.5 text-sm font-extrabold text-black shadow-lg shadow-[#CCFF00]/30 hover:bg-lime-400 transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>START NEW SERVICE MISSION</span>
        </button>
      </div>
    </div>
  );
}
