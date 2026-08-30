import React from 'react';
import { StationData, ServiceType } from '../../types';
import { X, Clock, CheckCircle2, AlertCircle, MapPin, ArrowRight } from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: StationData[];
  currentStationIndex: number;
  serviceType: ServiceType;
  tripTimeSeconds: number;
}

export function TimetableModal({
  isOpen,
  onClose,
  stations,
  currentStationIndex,
  serviceType,
  tripTimeSeconds
}: TimetableModalProps) {
  if (!isOpen) return null;

  const formatSecondsToTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] rounded-3xl border border-emerald-500/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                Live Station Timetable & Dispatch
              </h2>
              <p className="text-xs text-gray-400 capitalize">
                Service: <span className="text-[#CCFF00] font-bold">{serviceType} Express</span> • Elapsed Time: {formatSecondsToTime(tripTimeSeconds)}
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

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {stations.map((st, idx) => {
            const isPassed = idx < currentStationIndex;
            const isCurrent = idx === currentStationIndex;
            const isUpcoming = idx > currentStationIndex;

            // Estimated arrival calculations
            const estArrivalTime = idx * 140; // Approx 2.3 min per station
            const estDepartureTime = estArrivalTime + st.dwellTime;

            return (
              <div
                key={st.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-[#CCFF00] bg-[#CCFF00]/10 shadow-lg shadow-[#CCFF00]/10'
                    : isPassed
                    ? 'border-white/5 bg-white/5 opacity-60'
                    : 'border-white/5 bg-black/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPassed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="h-5 w-5 rounded-full border-2 border-[#CCFF00] border-t-transparent animate-spin" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gray-500" />
                  )}

                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>{st.name}</span>
                      {isCurrent && (
                        <span className="rounded bg-[#CCFF00] text-black px-1.5 py-0.5 text-[10px] font-extrabold uppercase animate-pulse">
                          ACTIVE STOP
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {st.nameTamil} • Platform: <span className="text-gray-200 font-semibold">{st.platformSide}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono-tech text-xs font-bold text-white">
                    {formatSecondsToTime(estArrivalTime)} ➔ {formatSecondsToTime(estDepartureTime)}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Dwell: {st.dwellTime}s • Limit: {st.speedLimit} km/h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
