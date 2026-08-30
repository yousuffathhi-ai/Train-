import { DriverProfile } from '../types';

const STORAGE_KEY = 'train_sim_eastern_profile_v1';

export const RANK_TITLES = [
  'Assistant Driver (Trainee)',
  'Second Loco Pilot',
  'Senior Express Pilot',
  'Chief Railway Engineer',
  'Master of Eastern Express'
];

export const AVATARS = [
  { id: 'pilot_srilanka_1', name: 'Rohan (Loco Pilot)', icon: 'UserCheck', color: '#0284C7' },
  { id: 'pilot_srilanka_2', name: 'Farwin (Chief Engineer)', icon: 'Award', color: '#10B981' },
  { id: 'pilot_srilanka_3', name: 'Nimal (Express Driver)', icon: 'Shield', color: '#F59E0B' },
  { id: 'pilot_srilanka_4', name: 'Kavitha (Senior Pilot)', icon: 'Zap', color: '#EC4899' }
];

export const INITIAL_PROFILE: DriverProfile = {
  name: 'Eastern Loco Pilot',
  avatar: 'pilot_srilanka_1',
  level: 1,
  xp: 0,
  coins: 500,
  rankTitle: RANK_TITLES[0],
  totalDistanceKm: 0,
  tripsCompleted: 0,
  perfectStops: 0,
  signalViolations: 0,
  unlockedLocos: ['s13_blue_demu'],
  unlockedSkins: ['standard'],
  selectedLocoId: 's13_blue_demu'
};

export const INITIAL_DRIVER_PROFILE = INITIAL_PROFILE;

export function loadDriverProfile(): DriverProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load driver profile:", e);
  }
  return INITIAL_PROFILE;
}

export function saveDriverProfile(profile: DriverProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save driver profile:", e);
  }
}

export function calculateLevelFromXP(xp: number): { level: number; rankTitle: string; xpForNext: number; currentLevelBaseXP: number } {
  // Thresholds: Level 1: 0, Level 2: 1000, Level 3: 2500, Level 4: 5000, Level 5: 10000
  const thresholds = [0, 1000, 2500, 5000, 10000];
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }

  const rankTitle = RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];
  const currentLevelBaseXP = thresholds[level - 1] || 0;
  const xpForNext = (thresholds[level] !== undefined ? thresholds[level] : thresholds[thresholds.length - 1] + 5000) - currentLevelBaseXP;

  return { level, rankTitle, xpForNext, currentLevelBaseXP };
}
