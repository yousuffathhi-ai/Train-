import React from 'react';
import { LOCOMOTIVES } from '../../data/trains';
import { LocomotiveConfig } from '../../types';
import { X, Zap, Gauge, Shield, Award, Check } from 'lucide-react';

interface TrainSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoco: LocomotiveConfig;
  onSelectLoco: (loco: LocomotiveConfig) => void;
  driverLevel: number;
}

export function TrainSelectorModal({
  isOpen,
  onClose,
  selectedLoco,
  onSelectLoco,
  driverLevel
}: TrainSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl border border-[#CCFF00]/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0055A5] text-[#CCFF00]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                Sri Lanka Railways Locomotive Fleet
              </h2>
              <p className="text-xs text-gray-400">
                Select your power car or locomotive for the Eastern Coastal Line
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {LOCOMOTIVES.map((loco) => {
            const isSelected = selectedLoco.id === loco.id;
            const isUnlocked = driverLevel >= loco.unlockedAtLevel;

            return (
              <div
                key={loco.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLoco(loco);
                    onClose();
                  }
                }}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-xl shadow-[#CCFF00]/10'
                    : isUnlocked
                    ? 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 cursor-pointer'
                    : 'border-white/5 bg-black/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-white/10">
                        {loco.classType}
                      </span>
                      <h3 className="font-display text-base font-bold text-white mt-1">
                        {loco.name}
                      </h3>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#CCFF00] px-2.5 py-1 text-xs font-extrabold text-black">
                        <Check className="h-3.5 w-3.5" /> ACTIVE
                      </span>
                    ) : !isUnlocked ? (
                      <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold">
                        UNLOCKS AT LVL {loco.unlockedAtLevel}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    {loco.description}
                  </p>

                  {/* 3D Livery Color Swatch Preview */}
                  <div className="flex items-center gap-2 mb-4 p-2 rounded-xl bg-black/50 border border-white/5">
                    <div className="h-6 w-12 rounded-md shadow-inner" style={{ backgroundColor: loco.color }} />
                    <div className="h-6 w-6 rounded-md shadow-inner" style={{ backgroundColor: loco.accentColor }} />
                    <div className="h-6 w-12 rounded-md shadow-inner" style={{ backgroundColor: loco.coachColor }} />
                    <span className="text-[10px] text-gray-400 ml-auto">Official Livery</span>
                  </div>

                  {/* Locomotive Performance Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">TOP SPEED</span>
                      <span className="font-mono-tech font-bold text-[#CCFF00]">
                        {loco.maxSpeed} km/h
                      </span>
                    </div>
                    <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">ENGINE POWER</span>
                      <span className="font-mono-tech font-bold text-white">
                        {loco.powerKW} kW
                      </span>
                    </div>
                    <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                      <span className="text-[9px] text-gray-400 block">TRAIN WEIGHT</span>
                      <span className="font-mono-tech font-bold text-gray-300">
                        {loco.weightTons} T
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Composition: Power Car + {loco.coachCount} Coaches</span>
                  <span className="font-bold text-[#CCFF00] capitalize">Horn: {loco.hornType.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
