import React from 'react';
import { WeatherType } from '../../types';
import { X, Sun, Sunset, Moon, CloudRain, CloudLightning, CloudFog, Check } from 'lucide-react';

interface WeatherSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeather: WeatherType;
  onSelectWeather: (weather: WeatherType) => void;
}

const WEATHERS: { id: WeatherType; name: string; desc: string; icon: any; color: string }[] = [
  {
    id: 'sunny',
    name: 'Coastal Sunshine (Noon)',
    desc: 'Clear tropical blue skies, bright sun glints on ocean waters and turquoise surf.',
    icon: Sun,
    color: '#FACC15'
  },
  {
    id: 'golden_hour',
    name: 'Sunset Golden Hour',
    desc: 'Warm orange dusk glow across Batticaloa lagoon, long palm shadows and amber waves.',
    icon: Sunset,
    color: '#F97316'
  },
  {
    id: 'night',
    name: 'Tropical Starlit Night',
    desc: 'Deep moonlit ocean, starry skybox, illuminated cab gauges, and high-beam spotlights on the tracks.',
    icon: Moon,
    color: '#38BDF8'
  },
  {
    id: 'rain',
    name: 'Monsoon Rain Shower',
    desc: 'Coastal rain droplets, wet rail reflections, windshield wipers swinging, reduced track adhesion.',
    icon: CloudRain,
    color: '#60A5FA'
  },
  {
    id: 'storm',
    name: 'Severe Coastal Thunderstorm',
    desc: 'Heavy torrential downpour, dramatic lightning flashes illuminating the coastline, choppy sea waves.',
    icon: CloudLightning,
    color: '#A855F7'
  },
  {
    id: 'foggy',
    name: 'Morning Coastal Mist & Fog',
    desc: 'Atmospheric morning sea fog requiring signal vigilance and acoustic horn alerts at crossings.',
    icon: CloudFog,
    color: '#94A3B8'
  }
];

export function WeatherSelector({
  isOpen,
  onClose,
  selectedWeather,
  onSelectWeather
}: WeatherSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-purple-500/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-black">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                Dynamic Skybox & Weather System
              </h2>
              <p className="text-xs text-gray-400">
                Atmospheric lighting and precipitation along Eastern Sri Lanka
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

        {/* Weather Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WEATHERS.map((w) => {
            const Icon = w.icon;
            const isSelected = selectedWeather === w.id;

            return (
              <div
                key={w.id}
                onClick={() => {
                  onSelectWeather(w.id);
                  onClose();
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/60 border border-white/10"
                  style={{ color: w.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{w.name}</h3>
                    {isSelected && (
                      <span className="rounded-full bg-purple-400 p-0.5 text-black">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
