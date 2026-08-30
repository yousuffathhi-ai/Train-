export type ServiceType = 'commuter' | 'express' | 'intercity' | 'custom';

export type WeatherType = 'sunny' | 'golden_hour' | 'night' | 'rain' | 'storm' | 'foggy';

export type CameraViewMode = 'cab360' | 'driver' | 'cab' | 'chase' | 'coastal' | 'drone' | 'passby' | 'passenger';

export type SignalAspect = 'green' | 'double_yellow' | 'yellow' | 'red';

export interface ScenicPoint {
  id: string;
  name: string;
  nameTamil: string;
  nameSinhala: string;
  position: number; // meters from Batticaloa
  category: 'bridge' | 'lagoon' | 'monument' | 'coastline' | 'temple' | 'harbor' | 'surf_point';
  description: string;
  tagline: string;
  recommendedSpeed: number; // km/h for scenic viewing
  icon: string;
  highlightFact: string;
}

export interface TrainingStep {
  id: string;
  title: string;
  subTitle: string;
  category: 'startup' | 'throttle' | 'braking' | 'safety' | 'station' | 'special';
  instruction: string;
  keyShortcut?: string;
  locoSpecificNote?: string;
  diagramIcon: string;
  validationCheck: string;
}

export interface StationData {
  id: number;
  name: string;
  nameTamil: string;
  nameSinhala: string;
  position: number; // in meters from Batticaloa
  isTerminal?: boolean;
  isMajor?: boolean;
  isHalt?: boolean;
  platformSide: 'LEFT' | 'RIGHT' | 'BOTH';
  dwellTime: number; // in seconds
  stopTolerance: number; // in meters (+/-)
  speedLimit: number; // km/h
  description: string;
  hasBridge?: boolean;
  bridgeName?: string;
}

export interface LocomotiveConfig {
  id: string;
  name: string;
  classType: string;
  description: string;
  color: string;
  accentColor: string;
  stripeColor: string;
  roofColor: string;
  maxSpeed: number; // km/h
  powerKW: number;
  weightTons: number;
  hornType: 'dual_tone' | 'deep_diesel' | 'express_chime';
  coachCount: number;
  coachColor: string;
  coachStripe: string;
  unlockedAtLevel: number;
  iconName: string;
}

export interface Snapshot {
  id: string;
  timestamp: number;
  dataUrl: string;
  locoName: string;
  locationName: string;
  speedKmh: number;
  weather: WeatherType;
  filter?: string;
}

export type RandomEventType = 'signal_failure' | 'weather_shift' | 'speed_restriction' | 'track_obstacle';

export interface RandomEvent {
  id: string;
  type: RandomEventType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'danger';
  durationSeconds: number;
  remainingSeconds: number;
  active: boolean;
  resolved: boolean;
  targetSpeedLimit?: number;
  forcedSignal?: SignalAspect;
  newWeather?: WeatherType;
  instructions: string;
  actionRequired: 'acknowledge' | 'reduce_speed' | 'sound_horn' | 'activate_wipers' | 'wait_signal';
  rewardXP: number;
  rewardCoins: number;
}

export interface DriverProfile {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  rankTitle: string;
  totalDistanceKm: number;
  tripsCompleted: number;
  perfectStops: number;
  signalViolations: number;
  eventsResolved?: number;
  snapshots?: Snapshot[];
  unlockedLocos: string[];
  unlockedSkins: string[];
  selectedLocoId: string;
}

export interface RouteScheduleStop {
  station: StationData;
  scheduledArrival: number; // seconds from start
  scheduledDeparture: number;
  actualArrival?: number;
  actualDeparture?: number;
  status: 'upcoming' | 'approaching' | 'stopped' | 'completed' | 'skipped';
  stopScore?: number;
}

export interface SimulationTelemetry {
  speed: number; // km/h
  speedKmh: number;
  targetSpeedLimit: number;
  throttle: number; // 0 to 100%
  throttleNotch: number; // 0 (Idle) to 8
  brake: number; // 0 to 100%
  brakeMode: 'RELEASE' | 'INITIAL' | 'SERVICE' | 'FULL_SERVICE' | 'EMERGENCY';
  reverser: 1 | 0 | -1; // 1 = Forward, 0 = Neutral, -1 = Reverse
  trainPosition: number; // distance in meters along track
  trackGradient: number; // % grade (-2% to +2%)
  brakePipePressure: number; // bar (0 to 5.0 bar)
  brakeCylinderPressure: number; // bar (0 to 3.8 bar)
  mainReservoirPressure: number; // bar (~8.5 bar)
  equalizingResPressure: number; // bar (0 to 5.0 bar)
  sanderActive: boolean;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  wipersOn: boolean;
  hornActive: boolean;
  deadmanAlarmActive: boolean;
  deadmanCountdown: number; // seconds remaining before emergency brake
  awsAlarmActive: boolean;
  awsAcknowledged: boolean;
  doorsOpen: {
    left: boolean;
    right: boolean;
  };
  tractionLocked: boolean;
  dwellTimer: number;
  passengerComfort: number; // 0 to 100%
  currentSignal: SignalAspect;
  distanceToSignal: number;
  currentStationIndex: number;
  isAtPlatform: boolean;
  tripActive: boolean;
  tripCompleted: boolean;
  tripTimeSeconds: number;
}
