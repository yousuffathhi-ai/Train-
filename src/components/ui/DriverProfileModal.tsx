import React, { useState } from 'react';
import { DriverProfile, Snapshot } from '../../types';
import { AVATARS, calculateLevelFromXP } from '../../data/career';
import { 
  X, 
  Award, 
  Shield, 
  Zap, 
  UserCheck, 
  Star, 
  Coins, 
  Route, 
  CheckCircle,
  Camera,
  Download,
  Trash2,
  Calendar,
  MapPin,
  Flame,
  AlertTriangle
} from 'lucide-react';

interface DriverProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: DriverProfile;
  onUpdateProfile: (updated: Partial<DriverProfile>) => void;
}

export function DriverProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}: DriverProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'snapshots'>('profile');
  const [driverName, setDriverName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [previewSnapshot, setPreviewSnapshot] = useState<Snapshot | null>(null);

  if (!isOpen) return null;

  const { level, rankTitle, xpForNext, currentLevelBaseXP } = calculateLevelFromXP(profile.xp);
  const currentXPInLevel = profile.xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, (currentXPInLevel / xpForNext) * 100));

  const handleSave = () => {
    onUpdateProfile({
      name: driverName.trim() || 'Eastern Pilot',
      avatar: selectedAvatar
    });
    onClose();
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = (profile.snapshots || []).filter((s) => s.id !== id);
    onUpdateProfile({ snapshots: updated });
    if (previewSnapshot && previewSnapshot.id === id) {
      setPreviewSnapshot(null);
    }
  };

  const handleDownloadSnapshot = (snap: Snapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.download = `TSE_${snap.locationName}_${new Date(snap.timestamp).toISOString().slice(0, 10)}.jpg`;
    link.href = snap.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#CCFF00]/40 bg-[#0B0D0E] p-4 sm:p-6 text-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0055A5] to-[#CCFF00] text-black">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-white">
                Driver Career Dossier & Progression
              </h2>
              <p className="text-[11px] text-gray-400">
                Sri Lanka Railways (SLR) Eastern Coastal Division
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-4 bg-black/50 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#CCFF00] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Driver Dossier & Statistics
          </button>
          <button
            onClick={() => setActiveTab('snapshots')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'snapshots'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Career Snapshots ({profile.snapshots?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content 1: Profile & Career Stats */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {/* Driver Card & Level Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0055A5] text-[#CCFF00] border-2 border-[#CCFF00] shadow-lg">
                <Award className="h-8 w-8" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 font-bold text-sm text-white focus:border-[#CCFF00] focus:outline-none"
                    placeholder="Enter Driver Name"
                  />
                  <span className="rounded-full bg-[#CCFF00] px-2.5 py-0.5 text-xs font-extrabold text-black">
                    LEVEL {level}
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mb-2">{rankTitle}</p>

                {/* XP Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono-tech">
                    <span>XP PROGRESS ({currentXPInLevel} / {xpForNext} XP)</span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-900 overflow-hidden border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#CCFF00]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Currency & Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                  <Coins className="h-3.5 w-3.5" />
                  <span>COINS</span>
                </div>
                <span className="font-mono-tech text-base font-bold text-amber-300">
                  {profile.coins}
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[#CCFF00] text-xs font-bold mb-0.5">
                  <Route className="h-3.5 w-3.5" />
                  <span>DISTANCE</span>
                </div>
                <span className="font-mono-tech text-base font-bold text-white">
                  {profile.totalDistanceKm.toFixed(1)} km
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-0.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>PERFECT STOPS</span>
                </div>
                <span className="font-mono-tech text-base font-bold text-emerald-300">
                  {profile.perfectStops}
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold mb-0.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>INCIDENTS</span>
                </div>
                <span className="font-mono-tech text-base font-bold text-cyan-300">
                  {profile.eventsResolved || 0}
                </span>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Select Official Loco Pilot Uniform / Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white shadow-md'
                          : 'border-white/5 bg-black/40 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center mb-1 text-white"
                        style={{ backgroundColor: av.color }}
                      >
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold">{av.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Career Snapshots Photo Gallery */}
        {activeTab === 'snapshots' && (
          <div className="flex-1 overflow-y-auto pr-1">
            {(!profile.snapshots || profile.snapshots.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                <Camera className="w-12 h-12 text-gray-600 mb-1 stroke-1" />
                <h3 className="text-sm font-bold text-white">No Career Snapshots Yet</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Press the <span className="text-cyan-400 font-bold">PHOTO MODE [P]</span> button during your trip to capture and collect scenic coastal railway moments!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    onClick={() => setPreviewSnapshot(snap)}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 hover:border-[#CCFF00] transition-all cursor-pointer shadow-lg"
                  >
                    <img
                      src={snap.dataUrl}
                      alt={snap.locationName}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#CCFF00] border border-white/10 backdrop-blur-md">
                          {snap.locoName}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDownloadSnapshot(snap, e)}
                            className="p-1 rounded-lg bg-black/60 hover:bg-cyan-500 hover:text-black text-gray-300 backdrop-blur-md transition"
                            title="Download Snapshot"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                            className="p-1 rounded-lg bg-black/60 hover:bg-red-500 hover:text-white text-gray-400 backdrop-blur-md transition"
                            title="Delete Snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white truncate">{snap.locationName}</h4>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                          <span>{new Date(snap.timestamp).toLocaleDateString()}</span>
                          <span className="font-mono text-emerald-400 font-bold">{snap.speedKmh.toFixed(0)} KM/H</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            Close
          </button>
          {activeTab === 'profile' && (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#CCFF00] text-black font-bold text-xs shadow-lg hover:bg-lime-400 transition-all cursor-pointer"
            >
              Save Profile
            </button>
          )}
        </div>

        {/* Snapshot Fullscreen Lightbox Modal */}
        {previewSnapshot && (
          <div 
            onClick={() => setPreviewSnapshot(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[#0B0D0E] rounded-3xl border border-[#CCFF00]/40 overflow-hidden shadow-2xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{previewSnapshot.locationName}</h3>
                  <p className="text-xs text-gray-400">
                    {previewSnapshot.locoName} • {new Date(previewSnapshot.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewSnapshot(null)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={previewSnapshot.dataUrl}
                alt={previewSnapshot.locationName}
                className="w-full h-auto max-h-[65vh] object-contain rounded-2xl border border-white/10"
              />

              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={(e) => handleDownloadSnapshot(previewSnapshot, e)}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Image</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
