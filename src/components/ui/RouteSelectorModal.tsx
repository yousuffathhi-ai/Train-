import React, { useState } from 'react';
import { SERVICE_PRESETS } from '../../data/trains';
import { STATIONS_DATA } from '../../data/stations';
import { ServiceType } from '../../types';
import { X, Layers, Gauge, FastForward, SlidersHorizontal, Check, Sparkles } from 'lucide-react';

interface RouteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceType;
  onSelectService: (service: ServiceType, customStationIds?: number[]) => void;
}

export function RouteSelectorModal({
  isOpen,
  onClose,
  selectedService,
  onSelectService
}: RouteSelectorModalProps) {
  const [customSelectedIds, setCustomSelectedIds] = useState<number[]>([1, 3, 5, 8, 11, 14, 16, 18, 19]);

  if (!isOpen) return null;

  const toggleCustomStation = (id: number) => {
    setCustomSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].sort((a, b) => a - b)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-3xl border border-amber-500/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                Service Types & Station Stopping Schedules
              </h2>
              <p className="text-xs text-gray-400">
                Choose passenger stopping pattern for Batticaloa to Pottuvil Line
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

        {/* Service Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {SERVICE_PRESETS.map((preset) => {
            const isSelected = selectedService === preset.type;
            return (
              <div
                key={preset.type}
                onClick={() => {
                  if (preset.type !== 'custom') {
                    onSelectService(preset.type);
                    onClose();
                  }
                }}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-white/10">
                        {preset.tag}
                      </span>
                      <h3 className="font-display text-base font-bold text-white mt-1">
                        {preset.name}
                      </h3>
                    </div>

                    {isSelected && (
                      <span className="rounded-full bg-amber-400 p-1 text-black font-bold">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/10">
                  <span>Multiplier: <span className="text-[#CCFF00] font-bold">{preset.rewardMultiplier}x XP</span></span>
                  <span className="font-semibold text-white">{preset.difficulty}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Station Picker when in Custom Mode */}
        {selectedService === 'custom' && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 mb-3 flex-1 overflow-y-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
              Select Custom Stopping Stations ({customSelectedIds.length} stations chosen):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {STATIONS_DATA.map((st) => {
                const checked = customSelectedIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => toggleCustomStation(st.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all ${
                      checked
                        ? 'bg-[#CCFF00]/20 border border-[#CCFF00] text-white font-bold'
                        : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className={`h-3 w-3 rounded ${checked ? 'bg-[#CCFF00]' : 'bg-gray-700'}`} />
                    <span className="truncate">{st.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  onSelectService('custom', customSelectedIds);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black font-bold text-xs"
              >
                Apply Custom Service Pattern
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
