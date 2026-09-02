import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LocomotiveConfig } from '../../types';
import { CoachInterior3D } from './CoachInterior3D';
import { ClassM2Locomotive } from './ClassM2Locomotive';
import { ClassM4Locomotive } from './ClassM4Locomotive';

interface TrainModel3DProps {
  locoConfig: LocomotiveConfig;
  speedKmh: number;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  doorsOpen: { left: boolean; right: boolean };
  wipersOn: boolean;
  isCabView?: boolean;
  isNight?: boolean;
}

// Single Bogie Wheelset
function Bogie3D({ position, speedKmh }: { position: [number, number, number]; speedKmh: number }) {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current && speedKmh !== 0) {
      const angularVelocity = (speedKmh * 1000 / 3600) / 0.45; // radius ~0.45m
      wheelsRef.current.rotation.x -= angularVelocity * delta;
    }
  });

  return (
    <group position={position}>
      {/* Bogie Cast Steel Frame */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.1, 0.25, 2.4]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Rotating Wheels Group */}
      <group ref={wheelsRef}>
        {[-0.8, 0.8].map((zOffset, zIdx) => (
          <group key={zIdx} position={[0, 0.35, zOffset]}>
            {/* Left Wheel */}
            <mesh position={[-0.835, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.15, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Right Wheel */}
            <mesh position={[0.835, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.15, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Steel Axle */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 1.8, 12]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Authentic Sri Lankan Romanian Passenger Coach (Astra Red with Silver Trim + Full Interior)
function RomanianPassengerCoach({
  position,
  doorsOpen,
  isNight = false
}: {
  position: [number, number, number];
  doorsOpen: { left: boolean; right: boolean };
  isNight?: boolean;
}) {
  const leftDoorOffset = doorsOpen.left ? -0.8 : 0;
  const rightDoorOffset = doorsOpen.right ? 0.8 : 0;

  return (
    <group position={position}>
      {/* 3D Interior Environment (Seats, Lights, Carpet, Aisle) */}
      <CoachInterior3D position={[0, 0, 0]} isNight={isNight} />

      {/* Coach Exterior Shell - Romanian Astra Maroon Red */}
      <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.5, 12.2]} />
        <meshStandardMaterial color="#881337" roughness={0.35} metalness={0.25} />
      </mesh>

      {/* Coach Roof (Arched Dark Slate Grey Roof) */}
      <mesh position={[0, 3.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.28, 1.28, 12.2, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Gold / Cream Waistline Trim Band */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[2.54, 0.28, 12.22]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.2} />
      </mesh>

      {/* Lower Chassis Dark Skirt */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.48, 0.35, 12.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>

      {/* Romanian Coach Silver Windows (5 passenger bays per side) */}
      {[-4.2, -2.1, 0, 2.1, 4.2].map((wZ, idx) => (
        <group key={idx}>
          {/* Left Silver Window Frame */}
          <mesh position={[-1.27, 2.1, wZ]}>
            <boxGeometry args={[0.04, 0.75, 1.3]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Left Clear Tinted Glass */}
          <mesh position={[-1.28, 2.1, wZ]}>
            <boxGeometry args={[0.02, 0.65, 1.2]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.05} transparent opacity={0.35} />
          </mesh>

          {/* Right Silver Window Frame */}
          <mesh position={[1.27, 2.1, wZ]}>
            <boxGeometry args={[0.04, 0.75, 1.3]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Right Clear Tinted Glass (Ocean side) */}
          <mesh position={[1.28, 2.1, wZ]}>
            <boxGeometry args={[0.02, 0.65, 1.2]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.05} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}

      {/* Passenger End Doors (Sliding Door Simulation) */}
      <mesh position={[-1.28 + (doorsOpen.left ? 0.05 : 0), 1.7, -5.2 + leftDoorOffset]}>
        <boxGeometry args={[0.06, 1.8, 0.9]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} />
      </mesh>
      <mesh position={[1.28 - (doorsOpen.right ? 0.05 : 0), 1.7, -5.2 + rightDoorOffset]}>
        <boxGeometry args={[0.06, 1.8, 0.9]} />
        <meshStandardMaterial color="#0F172A" metalness={0.7} />
      </mesh>

      {/* Bogies */}
      <Bogie3D position={[0, 0, -4.2]} speedKmh={0} />
      <Bogie3D position={[0, 0, 4.2]} speedKmh={0} />

      {/* Inter-coach Gangway / Diaphragm Bellows */}
      <mesh position={[0, 1.8, -6.3]}>
        <boxGeometry args={[1.4, 2.2, 0.4]} />
        <meshStandardMaterial color="#0B0D0E" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function TrainModel3D({
  locoConfig,
  speedKmh,
  headlightsOn,
  headlightMode = 'bright',
  cabLightOn,
  doorsOpen,
  wipersOn,
  isCabView = false,
  isNight = false
}: TrainModel3DProps) {
  const isM4 = locoConfig?.id === 'm4_diesel_loco';

  return (
    <group position={[0, 0, 0]}>
      {/* ================= HIGH-FIDELITY SRI LANKA RAILWAYS DIESEL LOCOMOTIVES ================= */}
      {isM4 ? (
        <ClassM4Locomotive
          locoConfig={locoConfig}
          speedKmh={speedKmh}
          headlightsOn={headlightsOn}
          headlightMode={headlightMode}
          cabLightOn={cabLightOn}
          wipersOn={wipersOn}
          isCabView={isCabView}
          isNight={isNight}
        />
      ) : (
        <ClassM2Locomotive
          locoConfig={locoConfig}
          speedKmh={speedKmh}
          headlightsOn={headlightsOn}
          headlightMode={headlightMode}
          cabLightOn={cabLightOn}
          wipersOn={wipersOn}
          isCabView={isCabView}
          isNight={isNight}
        />
      )}

      {/* ================= ICONIC SRI LANKAN ROMANIAN RED COACHES WITH 3D INTERIOR ================= */}
      <RomanianPassengerCoach
        position={[0, 0, 12.8]}
        doorsOpen={doorsOpen}
        isNight={isNight}
      />
      <RomanianPassengerCoach
        position={[0, 0, 25.4]}
        doorsOpen={doorsOpen}
        isNight={isNight}
      />
      <RomanianPassengerCoach
        position={[0, 0, 38.0]}
        doorsOpen={doorsOpen}
        isNight={isNight}
      />
    </group>
  );
}
