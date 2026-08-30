import { LocomotiveConfig } from '../types';

export const LOCOMOTIVES: LocomotiveConfig[] = [
  {
    id: 's13_blue_demu',
    name: 'Class S13 Blue DEMU',
    classType: 'Diesel Multiple Unit',
    description: 'Modern CRRC Qingdao Sifang DMU power car operating Sri Lankan express coastal services with aerodynamic streamlined nose and electronic destination display.',
    color: '#0055A5',
    accentColor: '#CCFF00',
    stripeColor: '#FFFFFF',
    roofColor: '#475569',
    maxSpeed: 120,
    powerKW: 1950,
    weightTons: 68,
    hornType: 'dual_tone',
    coachCount: 4,
    coachColor: '#0055A5',
    coachStripe: '#CCFF00',
    unlockedAtLevel: 1,
    iconName: 'TrainTrack'
  },
  {
    id: 'm4_diesel_loco',
    name: 'Class M4 / M8 Classic Diesel',
    classType: 'Diesel-Electric Locomotive',
    description: 'Iconic heavy road switcher locomotive manufactured by Montreal Locomotive Works (MLW), renowned for hauling classic Sri Lankan maroon express coaches.',
    color: '#881337', // Crimson / Maroon
    accentColor: '#0284C7', // Sky Blue band
    stripeColor: '#F59E0B', // Gold stripe
    roofColor: '#334155',
    maxSpeed: 110,
    powerKW: 1750,
    weightTons: 84,
    hornType: 'deep_diesel',
    coachCount: 5,
    coachColor: '#881337',
    coachStripe: '#F59E0B',
    unlockedAtLevel: 2,
    iconName: 'ShieldAlert'
  },
  {
    id: 's11_red_express',
    name: 'Class S11 / S12 Red Express',
    classType: 'Fast Intercity DMU',
    description: 'High-speed CSR Ziyang intercity passenger set in fiery crimson red and graphite livery, built specifically for commuter acceleration and high passenger throughput.',
    color: '#DC2626',
    accentColor: '#FFFFFF',
    stripeColor: '#1E293B',
    roofColor: '#1E293B',
    maxSpeed: 130,
    powerKW: 2200,
    weightTons: 72,
    hornType: 'express_chime',
    coachCount: 4,
    coachColor: '#DC2626',
    coachStripe: '#FFFFFF',
    unlockedAtLevel: 3,
    iconName: 'Zap'
  },
  {
    id: 'm2_heritage_blue',
    name: 'Class M2 Heritage Blue Prince',
    classType: 'Historic Diesel-Electric (GMD GM-EMD)',
    description: 'Legendary Canadian General Motors diesel locomotive operating since 1954 in Sri Lanka with distinctive royal blue & silver streamlining.',
    color: '#1E3A8A',
    accentColor: '#CBD5E1',
    stripeColor: '#E2E8F0',
    roofColor: '#94A3B8',
    maxSpeed: 100,
    powerKW: 1425,
    weightTons: 79,
    hornType: 'deep_diesel',
    coachCount: 4,
    coachColor: '#881337',
    coachStripe: '#E2E8F0',
    unlockedAtLevel: 4,
    iconName: 'Award'
  }
];

export const SERVICE_PRESETS = [
  {
    type: 'commuter' as const,
    name: 'Eastern Commuter Express',
    tag: 'All 19 Stations',
    description: 'Stops at every station and halt from Batticaloa to Pottuvil & Arugam Bay.',
    icon: 'Layers',
    difficulty: 'Normal',
    rewardMultiplier: 1.0,
    speedLimitMax: 85
  },
  {
    type: 'express' as const,
    name: 'Uva-Eastern Coastal Express',
    tag: '9 Major Stations',
    description: 'Skips minor halts. Stops only at Batticaloa, Kattankudy, Kaluwanchikudy, Kalmunai, Ninthavur, Akkaraipattu, Thirukkovil, Pottuvil, Arugam Bay.',
    icon: 'Gauge',
    difficulty: 'High Speed',
    rewardMultiplier: 1.5,
    speedLimitMax: 100
  },
  {
    type: 'intercity' as const,
    name: 'Arugam Bay Super Intercity',
    tag: '4 Hub Terminals',
    description: 'Non-stop high speed express connecting Batticaloa ➔ Kalmunai ➔ Akkaraipattu ➔ Pottuvil / Arugam Bay.',
    icon: 'FastForward',
    difficulty: 'Expert',
    rewardMultiplier: 2.2,
    speedLimitMax: 120
  },
  {
    type: 'custom' as const,
    name: 'Custom Dispatcher Route',
    tag: 'Custom Schedule',
    description: 'Choose your custom departure and destination stations and personalized stopping pattern.',
    icon: 'SlidersHorizontal',
    difficulty: 'Custom',
    rewardMultiplier: 1.2,
    speedLimitMax: 110
  }
];
