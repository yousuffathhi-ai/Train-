import { LocomotiveConfig } from '../types';

export const LOCOMOTIVES: LocomotiveConfig[] = [
  {
    id: 'm2_diesel_loco',
    name: 'Class M2 Heritage Diesel-Electric',
    classType: 'General Motors EMD G12 Road Switcher',
    description: 'Iconic Sri Lankan Railways diesel locomotive operating in the historic Blue & Turquoise livery with silver trim, hauling classic maroon Romanian passenger coaches.',
    color: '#006699', // Classic Sri Lankan Railways Teal-Blue
    accentColor: '#F59E0B', // Gold lining stripe
    stripeColor: '#E2E8F0', // Silver / White band
    roofColor: '#475569',
    maxSpeed: 105,
    powerKW: 1425,
    weightTons: 79,
    hornType: 'deep_diesel',
    coachCount: 4,
    coachColor: '#881337', // Iconic Red Romanian Passenger Coaches (moulded maroon red)
    coachStripe: '#FEF08A', // Cream / Gold window trim
    unlockedAtLevel: 1,
    iconName: 'TrainTrack'
  },
  {
    id: 's13_blue_demu',
    name: 'Class S13 Coastal DEMU',
    classType: 'Diesel Multiple Unit Express',
    description: 'CRRC Qingdao Sifang DMU power car operating Sri Lankan express coastal services with aerodynamic streamlined nose and electronic destination display.',
    color: '#0055A5',
    accentColor: '#CCFF00',
    stripeColor: '#FFFFFF',
    roofColor: '#334155',
    maxSpeed: 120,
    powerKW: 1950,
    weightTons: 68,
    hornType: 'dual_tone',
    coachCount: 4,
    coachColor: '#881337', // Red Romanian Coaches
    coachStripe: '#FEF08A',
    unlockedAtLevel: 2,
    iconName: 'Zap'
  },
  {
    id: 'm4_diesel_loco',
    name: 'Class M4 (MLW MX-620) Heavy Diesel',
    classType: 'Montreal Locomotive Works Heavy Road Switcher',
    description: 'Iconic ALCO 251 V12 turbocharged diesel-electric road switcher with angled cab windshield, Cerulean Blue & Off-White livery, and Co-Co 6-axle bogies.',
    color: '#0083BE', // Cerulean Blue
    accentColor: '#F8C300', // Vivid Yellow stripe
    stripeColor: '#DCE1E3', // Off-White upper hood
    roofColor: '#DCE1E3',
    maxSpeed: 105,
    powerKW: 1790,
    weightTons: 94.5,
    hornType: 'dual_tone',
    coachCount: 4,
    coachColor: '#881337', // Red Romanian Coaches
    coachStripe: '#FEF08A',
    unlockedAtLevel: 1,
    iconName: 'ShieldAlert'
  },
  {
    id: 's11_red_express',
    name: 'Class S11 Fast Intercity DMU',
    classType: 'High-Speed Commuter DMU',
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
    coachColor: '#881337', // Red Romanian Coaches
    coachStripe: '#FFFFFF',
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
