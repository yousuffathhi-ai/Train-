import React, { useState } from 'react';
import { STATIONS_DATA } from '../../data/stations';
import { StationData } from '../../types';
import { X, MapPin, Compass, Navigation, Waves, Landmark, TrainTrack } from 'lucide-react';

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainPosition: number;
}

export function RouteMapModal({ isOpen, onClose, trainPosition }: RouteMapModalProps) {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(STATIONS_DATA[0]);

  if (!isOpen) return null;

  const totalLength = STATIONS_DATA[STATIONS_DATA.length - 1].position;
  const trainProgress = Math.min(100, Math.max(0, (trainPosition / totalLength) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#CCFF00]/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0055A5] to-emerald-500 text-black">
              <Navigation className="h-5 w-5 text-[#CCFF00]" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-[#CCFF00]">
                Batticaloa – Pottuvil Coastal Rail Corridor
              </h2>
              <p className="text-xs text-gray-400">
                19 Stations & Halts • 125 km Coastal Line • Eastern Province, Sri Lanka
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

        {/* Live Track Line Diagram */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>START: Batticaloa Terminal (km 0)</span>
            <span className="text-[#CCFF00] font-bold">
              GPS Position: {(trainPosition / 1000).toFixed(2)} km ({trainProgress.toFixed(1)}%)
            </span>
            <span>END: Arugam Bay (km 125)</span>
          </div>

          {/* Progress Track Line with Train Marker */}
          <div className="relative h-6 w-full rounded-full bg-gray-900 border border-white/10 flex items-center px-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#0055A5] via-emerald-500 to-[#CCFF00]"
              style={{ width: `${trainProgress}%` }}
            />
            {/* Live GPS Train Pulse Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-[#CCFF00] text-black font-bold shadow-lg shadow-[#CCFF00]/50"
              style={{ left: `${trainProgress}%` }}
            >
              🚆
            </div>
          </div>
        </div>

        {/* Two-Column Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Station List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Station Sequence & Stopping Tolerance
            </h3>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-2">
              {STATIONS_DATA.map((station) => {
                const isSelected = selectedStation?.id === station.id;
                const stationKm = (station.position / 1000).toFixed(1);
                const isPassed = trainPosition >= station.position;

                return (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                        : 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          station.isTerminal
                            ? 'bg-amber-400'
                            : station.isMajor
                            ? 'bg-emerald-400'
                            : 'bg-blue-400'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{station.name}</span>
                          {station.isTerminal && (
                            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 rounded font-mono">
                              TERMINAL
                            </span>
                          )}
                          {station.hasBridge && (
                            <Waves className="h-3 w-3 text-cyan-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {station.nameTamil} • {station.nameSinhala}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono-tech text-xs font-bold text-[#CCFF00]">
                        {stationKm} km
                      </div>
                      <div className="text-[9px] text-gray-400">
                        Plat: {station.platformSide}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Station Geographic & Architectural Inspector */}
          {selectedStation && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Landmark className="h-4 w-4" />
                  <span>STATION GEOGRAPHY & INFRASTRUCTURE</span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-0.5">
                  {selectedStation.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {selectedStation.nameTamil} • {selectedStation.nameSinhala}
                </p>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {selectedStation.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                    <span className="text-gray-400 text-[10px]">DISTANCE FROM BATTICALOA:</span>
                    <p className="font-mono-tech font-bold text-[#CCFF00]">
                      {(selectedStation.position / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                    <span className="text-gray-400 text-[10px]">SPEED LIMIT ZONE:</span>
                    <p className="font-mono-tech font-bold text-red-400">
                      {selectedStation.speedLimit} km/h
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                    <span className="text-gray-400 text-[10px]">PLATFORM SIDE:</span>
                    <p className="font-mono-tech font-bold text-blue-400">
                      {selectedStation.platformSide}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                    <span className="text-gray-400 text-[10px]">STOP TOLERANCE:</span>
                    <p className="font-mono-tech font-bold text-amber-400">
                      ±{selectedStation.stopTolerance} meters
                    </p>
                  </div>
                </div>

                {selectedStation.hasBridge && (
                  <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-xs flex items-center gap-2">
                    <Waves className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-cyan-300">Coastal Viaduct / Bridge: </span>
                      <span className="text-gray-300">{selectedStation.bridgeName}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                <span>Dwell Time: {selectedStation.dwellTime}s</span>
                <span className="text-emerald-400 font-bold">PGV Eastern Railway Network</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
