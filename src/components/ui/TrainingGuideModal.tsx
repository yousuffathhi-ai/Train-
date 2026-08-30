import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle2, ChevronRight, ChevronLeft, 
  RotateCcw, ShieldAlert, Gauge, Play, X, Compass, Lightbulb, Zap, Info
} from 'lucide-react';
import { LocomotiveConfig, TrainingStep } from '../../types';

interface TrainingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLoco: LocomotiveConfig;
  speedKmh: number;
  throttleNotch: number;
  reverser: number;
  brake: number;
  onApplyControl?: (action: string) => void;
}

const GENERAL_TRAINING_STEPS: TrainingStep[] = [
  {
    id: 'step_reverser',
    title: '1. Direction Reverser Control',
    subTitle: 'Engaging Forward / Reverse Traction',
    category: 'startup',
    instruction: 'Set the direction reverser key to FORWARD (FWD). In Neutral (NEU), the diesel traction alternators are disarmed and throttle commands will not apply motor torque.',
    keyShortcut: 'Press [W] for Forward, [S] for Reverse, [X] for Neutral',
    diagramIcon: 'Compass',
    validationCheck: 'reverser === 1'
  },
  {
    id: 'step_air_brake',
    title: '2. Air Brake Graduated Release',
    subTitle: 'Releasing Train Line Brake Cylinder Pressure',
    category: 'braking',
    instruction: 'Release the automatic train brake from 100% (Emergency/Full Service) down to 0% (Release). Watch the Brake Pipe (BP) pressure gauge rise to 5.0 bar.',
    keyShortcut: 'Press [Down Arrow] / [ ; ] to release air brakes',
    diagramIcon: 'ShieldAlert',
    validationCheck: 'brake < 10'
  },
  {
    id: 'step_headlights',
    title: '3. 3-Stage Headlight Activation',
    subTitle: 'Illuminating Track & Signaling Corridor',
    category: 'startup',
    instruction: 'Switch headlights from OFF to DIM (Yard) or BRIGHT (Mainline Track). High beam spotlights illuminate signals and level crossings up to 150m ahead.',
    keyShortcut: 'Press [H] to toggle Headlights (OFF ➔ DIM ➔ BRIGHT)',
    diagramIcon: 'Lightbulb',
    validationCheck: 'headlightMode !== "off"'
  },
  {
    id: 'step_throttle',
    title: '4. 8-Notch Throttle Management',
    subTitle: 'Applying Smooth Diesel-Electric Acceleration',
    category: 'throttle',
    instruction: 'Advance the throttle lever Notch by Notch (Notch 1 to 4 for gentle departure). Avoid wheel slip by not jumping directly from Idle to Notch 8.',
    keyShortcut: 'Press [Up Arrow] or Notch buttons [1-8] on the HUD',
    diagramIcon: 'Gauge',
    validationCheck: 'throttleNotch >= 1'
  },
  {
    id: 'step_vcs_safety',
    title: '5. Vigilance Control (Deadman System)',
    subTitle: 'Driver Vigilance Safety Timer',
    category: 'safety',
    instruction: 'Sri Lankan Railways uses a 36-second Vigilance Control System (VCS). When the amber alarm flashes and buzzer sounds, acknowledge immediately to prevent automated emergency penalty brake application.',
    keyShortcut: 'Press [Spacebar] or tap the VCS button on the HUD',
    diagramIcon: 'Zap',
    validationCheck: 'vcs_acknowledged'
  },
  {
    id: 'step_station_stop',
    title: '6. Platform Precision Braking',
    subTitle: 'Graduated Station Stopping',
    category: 'station',
    instruction: 'Begin braking approximately 300m before the station board. Reduce speed smoothly to under 15 km/h as the train enters the platform canopy, stopping within ±5m of the marker.',
    keyShortcut: 'Apply 35-50% Service Brake as you approach platform',
    diagramIcon: 'CheckCircle2',
    validationCheck: 'station_stop'
  }
];

export function TrainingGuideModal({
  isOpen,
  onClose,
  currentLoco,
  speedKmh,
  throttleNotch,
  reverser,
  brake
}: TrainingGuideModalProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = GENERAL_TRAINING_STEPS[currentStepIdx];
  const isLastStep = currentStepIdx === GENERAL_TRAINING_STEPS.length - 1;

  // Specific locomotive operational notes
  const getLocoSpecificNotes = () => {
    switch (currentLoco.id) {
      case 'm2_diesel_loco':
        return {
          engine: 'General Motors EMD 12-567C 2-Stroke V12 Roots-blown Diesel Engine (1,425 HP)',
          cabNotes: 'Dual high-visibility side sliding windows with window sill armrests. Features low-nose hood profile for unobstructed track view.',
          brakeSystem: 'Westinghouse 28-LAV-1 Air & Vacuum brake combination for Romanian coaches.',
          topSpeed: '105 km/h maximum operating speed along eastern mainline.'
        };
      case 's13_blue_demu':
        return {
          engine: 'CRRC Sifang MTU 16V 4000 R43L Diesel-Electric Power Car (1,950 kW)',
          cabNotes: 'Dual digital LCD Multi-Function Displays (MFD) with computerized traction diagnostic telemetry and electronic route advisory.',
          brakeSystem: 'Microprocessor-controlled electropneumatic regenerative blending brakes.',
          topSpeed: '120 km/h express speed rating.'
        };
      default:
        return {
          engine: 'Heavy Duty Diesel-Electric Prime Mover with Turbocharged Cylinder Bank',
          cabNotes: 'Standard Sri Lankan Railway console layout with AWS aspect receiver and analog duplex brake dials.',
          brakeSystem: 'Graduated dual-pipe automatic air brake system.',
          topSpeed: `${currentLoco.maxSpeed} km/h`
        };
    }
  };

  const locoNotes = getLocoSpecificNotes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide text-white">Locomotive Training Academy</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {currentLoco.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step master driver certification course</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {GENERAL_TRAINING_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  idx === currentStepIdx
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105'
                    : idx < currentStepIdx
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Step {currentStepIdx + 1} of {GENERAL_TRAINING_STEPS.length}
          </span>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Instruction Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {currentStep.subTitle}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                {currentStep.category.toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {currentStep.title}
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              {currentStep.instruction}
            </p>

            {/* Key shortcut badge */}
            {currentStep.keyShortcut && (
              <div className="flex items-center gap-2 pt-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{currentStep.keyShortcut}</span>
              </div>
            )}
          </div>

          {/* Current Real-Time Telemetry Live Feedback */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Reverser</span>
              <span className={`text-base font-bold font-mono ${reverser === 1 ? 'text-emerald-400' : reverser === -1 ? 'text-rose-400' : 'text-amber-400'}`}>
                {reverser === 1 ? 'FWD' : reverser === -1 ? 'REV' : 'NEU'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Air Brake</span>
              <span className={`text-base font-bold font-mono ${brake > 50 ? 'text-rose-400' : brake > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {Math.round(brake)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Throttle Notch</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {throttleNotch}/8
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] uppercase text-slate-400 block mb-1">Speed</span>
              <span className="text-base font-bold font-mono text-lime-400">
                {speedKmh.toFixed(1)} <span className="text-[10px] text-slate-400">km/h</span>
              </span>
            </div>
          </div>

          {/* Model Specific Specifications */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              {currentLoco.name} Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Prime Mover:</span>
                <span className="font-medium text-slate-200">{locoNotes.engine}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Braking Architecture:</span>
                <span className="font-medium text-slate-200">{locoNotes.brakeSystem}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Cab & Visibility:</span>
                <span className="font-medium text-slate-200">{locoNotes.cabNotes}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Top Service Speed:</span>
                <span className="font-medium text-lime-400">{locoNotes.topSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Close Guide
          </button>

          {isLastStep ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Training
            </button>
          ) : (
            <button
              onClick={() => setCurrentStepIdx((prev) => Math.min(GENERAL_TRAINING_STEPS.length - 1, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-lg shadow-cyan-500/25 transition-all"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
