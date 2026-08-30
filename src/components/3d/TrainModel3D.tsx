import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LocomotiveConfig } from '../../types';

interface TrainModel3DProps {
  locoConfig: LocomotiveConfig;
  speedKmh: number;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  doorsOpen: { left: boolean; right: boolean };
  wipersOn: boolean;
  isCabView?: boolean;
}

// Single Bogie Wheelset
function Bogie3D({ position, speedKmh }: { position: [number, number, number]; speedKmh: number }) {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current && speedKmh !== 0) {
      // Rotate wheelset around X axis proportional to speed
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

// Authentic Sri Lankan Romanian Passenger Coach (Moulded Maroon Red with Silver Trim)
function RomanianPassengerCoach({
  position,
  doorsOpen
}: {
  position: [number, number, number];
  doorsOpen: { left: boolean; right: boolean };
}) {
  const leftDoorOffset = doorsOpen.left ? -0.8 : 0;
  const rightDoorOffset = doorsOpen.right ? 0.8 : 0;

  return (
    <group position={position}>
      {/* Coach Main Body - Authentic Romanian Astra Maroon Red */}
      <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.5, 12.2]} />
        <meshStandardMaterial color="#881337" roughness={0.35} metalness={0.25} />
      </mesh>

      {/* Coach Roof (Arched Dark Slate Grey Roof) */}
      <mesh position={[0, 3.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.28, 1.28, 12.2, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Authentic Gold / Cream Waistline Trim Band */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[2.54, 0.28, 12.22]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.2} />
      </mesh>

      {/* Lower Chassis Dark Skirt */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.48, 0.35, 12.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>

      {/* Authentic Romanian Coach Silver Windows (5 passenger bays per side) */}
      {[-4.2, -2.1, 0, 2.1, 4.2].map((wZ, idx) => (
        <group key={idx}>
          {/* Left Silver Window Frame */}
          <mesh position={[-1.27, 2.1, wZ]}>
            <boxGeometry args={[0.04, 0.75, 1.3]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Left Tinted Glass */}
          <mesh position={[-1.28, 2.1, wZ]}>
            <boxGeometry args={[0.02, 0.65, 1.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} transparent opacity={0.7} />
          </mesh>

          {/* Right Silver Window Frame */}
          <mesh position={[1.27, 2.1, wZ]}>
            <boxGeometry args={[0.04, 0.75, 1.3]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Right Tinted Glass */}
          <mesh position={[1.28, 2.1, wZ]}>
            <boxGeometry args={[0.02, 0.65, 1.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Passenger End Doors (Sliding door simulation) */}
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
  isCabView = false
}: TrainModel3DProps) {
  const wiperRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wiperRef.current && wipersOn) {
      wiperRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 5) * 0.45;
    }
  });

  const isLightBright = headlightMode === 'bright';
  const isLightDim = headlightMode === 'dim';
  const isLightActive = headlightsOn || isLightBright || isLightDim;

  return (
    <group position={[0, 0, 0]}>
      {/* ================= LOCOMOTIVE ENGINE (CLASS M2 / GM G12 DIESEL) ================= */}
      <group position={[0, 0, 0]}>
        
        {/* Long Rear Engine Hood (From z = 0.5 to z = +6.0) */}
        <mesh position={[0, 1.85, 3.2]} castShadow receiveShadow>
          <boxGeometry args={[2.35, 2.4, 5.6]} />
          <meshStandardMaterial
            color={locoConfig.color}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>

        {/* Outer Cab Shell for External Cameras (Omitted in Cab View so track is 100% clear) */}
        {!isCabView && (
          <group>
            {/* Elevated Cab Roof Section */}
            <mesh position={[0, 3.2, -1.8]} castShadow>
              <boxGeometry args={[2.45, 0.3, 3.6]} />
              <meshStandardMaterial color={locoConfig.roofColor} roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Cab Side Panels */}
            <mesh position={[-1.22, 2.0, -1.8]} castShadow>
              <boxGeometry args={[0.08, 2.2, 3.6]} />
              <meshStandardMaterial color={locoConfig.color} roughness={0.35} metalness={0.4} />
            </mesh>
            <mesh position={[1.22, 2.0, -1.8]} castShadow>
              <boxGeometry args={[0.08, 2.2, 3.6]} />
              <meshStandardMaterial color={locoConfig.color} roughness={0.35} metalness={0.4} />
            </mesh>
          </group>
        )}

        {/* Low Short Hood / Front Nose (Low-profile GM M2 style at y = 0.85 - 0.95 so driver sees over it clearly!) */}
        <mesh position={[0, 0.92, -4.8]} castShadow>
          <boxGeometry args={[2.2, 0.72, 2.2]} />
          <meshStandardMaterial color={locoConfig.color} roughness={0.35} metalness={0.4} />
        </mesh>

        {/* Front Walkway Platform & Pilot Deck */}
        <mesh position={[0, 0.58, -5.9]} receiveShadow>
          <boxGeometry args={[2.4, 0.12, 1.4]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Front Safety Handrails (White / Yellow) */}
        <group position={[0, 1.05, -6.4]}>
          <mesh position={[-1.1, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.85, 8]} />
            <meshStandardMaterial color="#FEF08A" metalness={0.6} />
          </mesh>
          <mesh position={[1.1, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.85, 8]} />
            <meshStandardMaterial color="#FEF08A" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
            <meshStandardMaterial color="#FEF08A" metalness={0.6} />
          </mesh>
        </group>

        {/* Heavy Sri Lankan Railway Cowcatcher / Pilot on Front Buffer Beam */}
        <mesh position={[0, 0.32, -6.55]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[2.3, 0.55, 0.4]} />
          <meshStandardMaterial color="#0B0D0E" metalness={0.9} />
        </mesh>

        {/* Engine Roof Exhaust Stacks */}
        <mesh position={[0, 3.4, 2.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.45, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} />
        </mesh>
        <mesh position={[0, 3.4, 4.2]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.35, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} />
        </mesh>

        {/* Classic Gold Accent Stripe */}
        <mesh position={[0, 1.25, 3.2]}>
          <boxGeometry args={[2.42, 0.25, 5.62]} />
          <meshStandardMaterial
            color={locoConfig.accentColor}
            emissive={locoConfig.accentColor}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Front Nose Wiper Blade */}
        {!isCabView && (
          <group ref={wiperRef} position={[0, 2.05, -3.8]}>
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[0.03, 0.5, 0.02]} />
              <meshStandardMaterial color="#111827" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* ================= 3D ACTIVE HEADLIGHTS & SPOTLIGHTS ================= */}
        {isLightActive && (
          <>
            {/* Primary High-Power Track Spotlight Beam */}
            <spotLight
              position={[0, 1.6, -6.6]}
              target-position={[0, 0, isLightBright ? -140 : -65]}
              angle={isLightBright ? 0.48 : 0.38}
              penumbra={0.5}
              intensity={isLightBright ? 18 : 7}
              distance={isLightBright ? 160 : 75}
              color="#FFFFF0"
              castShadow
            />

            {/* Left Beam */}
            <pointLight
              position={[-0.8, 1.2, -6.4]}
              color="#FFFFF0"
              intensity={isLightBright ? 5 : 2}
              distance={isLightBright ? 30 : 15}
            />

            {/* Right Beam */}
            <pointLight
              position={[0.8, 1.2, -6.4]}
              color="#FFFFF0"
              intensity={isLightBright ? 5 : 2}
              distance={isLightBright ? 30 : 15}
            />
          </>
        )}

        {/* Left Headlamp Housing */}
        <mesh position={[-0.75, 1.25, -6.4]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightBright ? 4.5 : isLightDim ? 2.0 : 0}
          />
        </mesh>

        {/* Right Headlamp Housing */}
        <mesh position={[0.75, 1.25, -6.4]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightBright ? 4.5 : isLightDim ? 2.0 : 0}
          />
        </mesh>

        {/* Top Center Golden Marker Lamp */}
        <mesh position={[0, 1.9, -5.9]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightActive ? 3.0 : 0}
          />
        </mesh>

        {/* Cab Interior Light */}
        {cabLightOn && (
          <pointLight position={[0, 2.2, -2.0]} color="#FEF3C7" intensity={2.2} distance={6} />
        )}

        {/* Locomotive Heavy GM 6-Wheel Bogies */}
        <Bogie3D position={[0, 0, -2.6]} speedKmh={speedKmh} />
        <Bogie3D position={[0, 0, 3.8]} speedKmh={speedKmh} />
      </group>

      {/* ================= ICONIC SRI LANKAN ROMANIAN RED COACHES (STRICTLY BEHIND LOCO) ================= */}
      <RomanianPassengerCoach
        position={[0, 0, 12.8]}
        doorsOpen={doorsOpen}
      />
      <RomanianPassengerCoach
        position={[0, 0, 25.4]}
        doorsOpen={doorsOpen}
      />
      <RomanianPassengerCoach
        position={[0, 0, 38.0]}
        doorsOpen={doorsOpen}
      />
    </group>
  );
}
