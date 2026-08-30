import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { OceanWater } from './OceanWater';
import { CoastalLandscape } from './CoastalLandscape';
import { RailwayTrack } from './RailwayTrack';
import { Station3D } from './Station3D';
import { Signaling3D } from './Signaling3D';
import { TrainModel3D } from './TrainModel3D';
import { CabCockpit3D } from './CabCockpit3D';
import { WeatherSystem3D } from './WeatherSystem3D';
import { CameraController } from './CameraController';
import { STATIONS_DATA } from '../../data/stations';
import { LocomotiveConfig, WeatherType, CameraViewMode, SignalAspect } from '../../types';

interface TrainSimulatorSceneProps {
  trainPosition: number;
  speedKmh: number;
  throttle: number;
  throttleNotch?: number;
  brake: number;
  reverser?: number;
  weather: WeatherType;
  cameraMode: CameraViewMode;
  locoConfig: LocomotiveConfig;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  doorsOpen: { left: boolean; right: boolean };
  wipersOn: boolean;
  awsAlarm: boolean;
  currentSignal: SignalAspect;
  speedLimit?: number;
  nextStationName?: string;
  distToStationMeters?: number;
  deadmanCountdown?: number;
  tractionLocked?: boolean;
}

export function TrainSimulatorScene({
  trainPosition,
  speedKmh,
  throttle,
  throttleNotch = 0,
  brake,
  reverser = 1,
  weather,
  cameraMode,
  locoConfig,
  headlightsOn,
  headlightMode = 'bright',
  cabLightOn,
  doorsOpen,
  wipersOn,
  awsAlarm,
  currentSignal,
  speedLimit = 40,
  nextStationName = "Batticaloa Terminal",
  distToStationMeters = 0,
  deadmanCountdown = 36,
  tractionLocked = false
}: TrainSimulatorSceneProps) {
  const trainZ = -trainPosition;
  const isNight = weather === 'night';

  // Signals along the route
  const signals = useMemo(() => {
    const list: { posZ: number; aspect: SignalAspect }[] = [];
    STATIONS_DATA.forEach((st, idx) => {
      if (st.position > 200) {
        list.push({
          posZ: -(st.position - 450),
          aspect: idx % 3 === 0 ? 'yellow' : 'green'
        });
      }
    });
    return list;
  }, []);

  const isCabView = cameraMode === 'cab360' || cameraMode === 'driver' || cameraMode === 'cab';

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.6 }}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={
            isCabView
              ? [0.48, 1.85, trainZ - 2.2]
              : [0, 5, trainZ + 16]
          }
          fov={isCabView ? 72 : 58}
          near={0.05}
          far={1400}
        />

        {/* Dynamic Weather & Skybox Lighting */}
        <WeatherSystem3D weather={weather} trainZ={trainZ} />

        {/* Camera Controller with 360° Free Look Orbit */}
        <CameraController cameraMode={cameraMode} trainZ={trainZ} speedKmh={speedKmh} />

        {/* Realistic Indian Ocean with Wave Shaders */}
        <OceanWater weather={weather} trainZ={trainZ} />

        {/* Golden Beach, Dunes, Instanced Palms & Eastern Landmarks */}
        <CoastalLandscape trainZ={trainZ} weather={weather} />

        {/* High-Density Railway Ballast, Steel Rails, Bridges */}
        <RailwayTrack trainZ={trainZ} />

        {/* 19 Sri Lankan Railway Stations with Curved Canopies */}
        {STATIONS_DATA.map((station) => (
          <Station3D key={station.id} station={station} isNight={isNight} />
        ))}

        {/* 4-Aspect Signals & AWS Track Magnets */}
        {signals.map((sig, idx) => (
          <Signaling3D key={idx} positionZ={sig.posZ} aspect={sig.aspect} />
        ))}

        {/* Moving Train Power Car & Passenger Coaches */}
        <group position={[0, 0, trainZ]}>
          <TrainModel3D
            locoConfig={locoConfig}
            speedKmh={speedKmh}
            headlightsOn={headlightsOn}
            headlightMode={headlightMode}
            cabLightOn={cabLightOn}
            doorsOpen={doorsOpen}
            wipersOn={wipersOn}
            isCabView={isCabView}
          />

          {/* 360° Interactive Cockpit Interior */}
          {isCabView && (
            <CabCockpit3D
              speedKmh={speedKmh}
              throttle={throttle}
              throttleNotch={throttleNotch}
              brake={brake}
              reverser={reverser}
              awsAlarm={awsAlarm}
              wipersOn={wipersOn}
              cabLightOn={cabLightOn}
              speedLimit={speedLimit}
              nextStationName={nextStationName}
              distToStationMeters={distToStationMeters}
              currentSignal={currentSignal}
              deadmanCountdown={deadmanCountdown}
              tractionLocked={tractionLocked}
            />
          )}
        </group>
      </Canvas>
    </div>
  );
}
