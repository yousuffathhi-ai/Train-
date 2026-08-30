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

// Passenger Coach Model (Placed strictly behind the locomotive engine)
function PassengerCoach({
  position,
  coachColor,
  stripeColor,
  doorsOpen
}: {
  position: [number, number, number];
  coachColor: string;
  stripeColor: string;
  doorsOpen: { left: boolean; right: boolean };
}) {
  const leftDoorOffset = doorsOpen.left ? -0.8 : 0;
  const rightDoorOffset = doorsOpen.right ? 0.8 : 0;

  return (
    <group position={position}>
      {/* Coach Main Body */}
      <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.5, 12]} />
        <meshStandardMaterial color={coachColor} roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Coach Roof (Graphite / Silver curved roof) */}
      <mesh position={[0, 3.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.28, 1.28, 12, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Accent Stripe Band */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[2.54, 0.35, 12.02]} />
        <meshStandardMaterial color={stripeColor} emissive={stripeColor} emissiveIntensity={0.15} />
      </mesh>

      {/* Windows Tinted Glass (Left & Right) */}
      {[-4, -2, 0, 2, 4].map((wZ, idx) => (
        <group key={idx}>
          {/* Left Window */}
          <mesh position={[-1.28, 2.1, wZ]}>
            <boxGeometry args={[0.05, 0.7, 1.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} transparent opacity={0.7} />
          </mesh>
          {/* Right Window */}
          <mesh position={[1.28, 2.1, wZ]}>
            <boxGeometry args={[0.05, 0.7, 1.2]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Passenger Doors (Sliding door simulation) */}
      <mesh position={[-1.28 + (doorsOpen.left ? 0.05 : 0), 1.7, -5 + leftDoorOffset]}>
        <boxGeometry args={[0.06, 1.8, 0.9]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} />
      </mesh>
      <mesh position={[1.28 - (doorsOpen.right ? 0.05 : 0), 1.7, -5 + rightDoorOffset]}>
        <boxGeometry args={[0.06, 1.8, 0.9]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} />
      </mesh>

      {/* Bogies */}
      <Bogie3D position={[0, 0, -4]} speedKmh={0} />
      <Bogie3D position={[0, 0, 4]} speedKmh={0} />

      {/* Inter-coach Gangway / Diaphragm bellows */}
      <mesh position={[0, 1.8, -6.2]}>
        <boxGeometry args={[1.5, 2.2, 0.5]} />
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
      {/* ================= LOCOMOTIVE ENGINE (CLASS S13 / M11 STYLE) ================= */}
      <group position={[0, 0, 0]}>
        
        {/* Rear Engine & Machinery Compartment (From z = -0.2 to z = +5.6) */}
        <mesh position={[0, 1.9, 2.7]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 2.6, 5.8]} />
          <meshStandardMaterial
            color={locoConfig.color}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Outer Shell for External Cameras (Omitted in Cab View so track is 100% clear) */}
        {!isCabView && (
          <group>
            {/* Cab Roof Section */}
            <mesh position={[0, 3.25, -2.2]} castShadow>
              <boxGeometry args={[2.4, 0.3, 4.4]} />
              <meshStandardMaterial color={locoConfig.roofColor} roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Cab Side Panels */}
            <mesh position={[-1.24, 1.8, -2.2]} castShadow>
              <boxGeometry args={[0.08, 2.4, 4.4]} />
              <meshStandardMaterial color={locoConfig.color} roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[1.24, 1.8, -2.2]} castShadow>
              <boxGeometry args={[0.08, 2.4, 4.4]} />
              <meshStandardMaterial color={locoConfig.color} roughness={0.3} metalness={0.5} />
            </mesh>
          </group>
        )}

        {/* Aerodynamic Streamlined Front Hood / Nose (Sloping down for wide track view) */}
        <mesh position={[0, 1.45, -5.2]} rotation={[0.22, 0, 0]} castShadow>
          <boxGeometry args={[2.46, 1.7, 1.8]} />
          <meshStandardMaterial color={locoConfig.color} roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Front Walkway Platform & Handrails */}
        <mesh position={[0, 0.75, -5.8]} receiveShadow>
          <boxGeometry args={[2.4, 0.1, 1.2]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>

        {/* Cowcatcher / Snowplow on Front Underframe */}
        <mesh position={[0, 0.38, -6.5]} rotation={[-0.32, 0, 0]} castShadow>
          <boxGeometry args={[2.3, 0.55, 0.5]} />
          <meshStandardMaterial color="#0B0D0E" metalness={0.9} />
        </mesh>

        {/* Engine Roof Exhaust Stacks */}
        <mesh position={[0, 3.55, 1.8]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.45, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} />
        </mesh>
        <mesh position={[0, 3.55, 3.6]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.35, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} />
        </mesh>

        {/* Neon Livery Accent Stripe */}
        <mesh position={[0, 1.35, 2.7]}>
          <boxGeometry args={[2.54, 0.35, 5.82]} />
          <meshStandardMaterial
            color={locoConfig.accentColor}
            emissive={locoConfig.accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Cab Windshield Wiper Blade on Front Nose */}
        <group ref={wiperRef} position={[0, 2.05, -4.5]}>
          <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.03, 0.5, 0.02]} />
            <meshStandardMaterial color="#111827" metalness={0.9} />
          </mesh>
        </group>

        {/* ================= 3D ACTIVE HEADLIGHTS & SPOTLIGHTS ================= */}
        {isLightActive && (
          <>
            {/* Primary Center High-Beam Track Spotlight */}
            <spotLight
              position={[0, 1.8, -6.5]}
              target-position={[0, 0, isLightBright ? -120 : -55]}
              angle={isLightBright ? 0.45 : 0.35}
              penumbra={0.6}
              intensity={isLightBright ? 16 : 6}
              distance={isLightBright ? 140 : 60}
              color="#FFFFF0"
              castShadow
            />

            {/* Left Beam */}
            <pointLight
              position={[-0.8, 1.3, -6.3]}
              color="#FFFFF0"
              intensity={isLightBright ? 6 : 2}
              distance={isLightBright ? 30 : 15}
            />

            {/* Right Beam */}
            <pointLight
              position={[0.8, 1.3, -6.3]}
              color="#FFFFF0"
              intensity={isLightBright ? 6 : 2}
              distance={isLightBright ? 30 : 15}
            />
          </>
        )}

        {/* Left Headlamp Lens */}
        <mesh position={[-0.8, 1.3, -6.3]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightBright ? 4.5 : isLightDim ? 2.0 : 0}
          />
        </mesh>

        {/* Right Headlamp Lens */}
        <mesh position={[0.8, 1.3, -6.3]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightBright ? 4.5 : isLightDim ? 2.0 : 0}
          />
        </mesh>

        {/* Top Marker Lamp */}
        <mesh position={[0, 2.7, -4.8]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={isLightActive ? "#FFFBEB" : "#475569"}
            emissive={isLightActive ? "#FEF08A" : "#000000"}
            emissiveIntensity={isLightActive ? 3.0 : 0}
          />
        </mesh>

        {/* Cab Interior Light */}
        {cabLightOn && (
          <pointLight position={[0, 2.2, -2.0]} color="#FEF3C7" intensity={2.0} distance={6} />
        )}

        {/* Locomotive Heavy Cast Bogies */}
        <Bogie3D position={[0, 0, -2.8]} speedKmh={speedKmh} />
        <Bogie3D position={[0, 0, 3.4]} speedKmh={speedKmh} />
      </group>

      {/* ================= PASSENGER COACHES (STRICTLY BEHIND LOCOMOTIVE AT +Z) ================= */}
      <PassengerCoach
        position={[0, 0, 12.8]}
        coachColor={locoConfig.coachColor}
        stripeColor={locoConfig.coachStripe}
        doorsOpen={doorsOpen}
      />
      <PassengerCoach
        position={[0, 0, 25.6]}
        coachColor={locoConfig.coachColor}
        stripeColor={locoConfig.coachStripe}
        doorsOpen={doorsOpen}
      />
      <PassengerCoach
        position={[0, 0, 38.4]}
        coachColor={locoConfig.coachColor}
        stripeColor={locoConfig.coachStripe}
        doorsOpen={doorsOpen}
      />
    </group>
  );
}
