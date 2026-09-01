import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { LocomotiveConfig } from '../../types';

interface ClassM2LocomotiveProps {
  locoConfig?: LocomotiveConfig;
  speedKmh: number;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  wipersOn: boolean;
  isCabView?: boolean;
  isNight?: boolean;
}

// 6-Wheel (3-Axle Co-Co / A1A) EMD Heavy Truck / Bogie
function M2Bogie3D({ position, speedKmh }: { position: [number, number, number]; speedKmh: number }) {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current && speedKmh !== 0) {
      const angularVelocity = (speedKmh * 1000 / 3600) / 0.45; // radius ~0.45m
      wheelsRef.current.rotation.x -= angularVelocity * delta;
    }
  });

  return (
    <group position={position}>
      {/* Heavy Cast Steel Truck Frame */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[2.2, 0.28, 3.8]} />
        <meshStandardMaterial color="#1A202C" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Side Equalizer Bars & Suspension Springs */}
      {[-1.12, 1.12].map((sideX, sideIdx) => (
        <group key={sideIdx} position={[sideX, 0.38, 0]}>
          {/* Main Equalizer Beam */}
          <mesh>
            <boxGeometry args={[0.08, 0.16, 3.6]} />
            <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Coil Springs over Axles */}
          {[-1.2, 0, 1.2].map((zPos, sIdx) => (
            <mesh key={sIdx} position={[0, 0.12, zPos]}>
              <cylinderGeometry args={[0.09, 0.09, 0.24, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.2} />
            </mesh>
          ))}
          {/* Axle Bearing Journals / Journal Boxes */}
          {[-1.2, 0, 1.2].map((zPos, jIdx) => (
            <mesh key={jIdx} position={[sideX > 0 ? 0.06 : -0.06, -0.04, zPos]}>
              <boxGeometry args={[0.12, 0.2, 0.22]} />
              <meshStandardMaterial color="#0F172A" metalness={0.9} />
            </mesh>
          ))}
          {/* Brake Cylinders */}
          <mesh position={[0, 0.15, -0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.15, 0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Rotating 3-Axle Wheelset */}
      <group ref={wheelsRef}>
        {[-1.2, 0, 1.2].map((zOffset, zIdx) => (
          <group key={zIdx} position={[0, 0.35, zOffset]}>
            {/* Left Wheel Rim & Flange */}
            <mesh position={[-0.835, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.14, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
            </mesh>
            {/* Left Wheel Flange Lip */}
            <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.49, 0.49, 0.03, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Right Wheel Rim & Flange */}
            <mesh position={[0.835, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.14, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.2} />
            </mesh>
            {/* Right Wheel Flange Lip */}
            <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.49, 0.49, 0.03, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
            </mesh>

            {/* Solid Steel Axle */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.085, 0.085, 1.76, 16]} />
              <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Procedural High-Detail Sri Lanka Railways Class M2 EMD G12 Locomotive Body
function ProceduralClassM2Body({
  speedKmh,
  headlightsOn,
  headlightMode = 'bright',
  cabLightOn,
  wipersOn,
  isCabView = false,
}: ClassM2LocomotiveProps) {
  const wiperLeftRef = useRef<THREE.Group>(null);
  const wiperRightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wipersOn) {
      const angle = Math.sin(state.clock.getElapsedTime() * 5.2) * 0.48;
      if (wiperLeftRef.current) wiperLeftRef.current.rotation.z = angle;
      if (wiperRightRef.current) wiperRightRef.current.rotation.z = angle;
    }
  });

  const isLightBright = headlightMode === 'bright';
  const isLightDim = headlightMode === 'dim';
  const isLightActive = headlightsOn || isLightBright || isLightDim;

  // Sri Lanka Railways Class M2 Livery Color Palette
  const COLOR_UPPER_ICE_WHITE = '#DCE1E3'; // Upper hood & roof ice white / light grey
  const COLOR_CYAN_BLUE = '#0083BE';      // Cerulean Blue waistline band & V-nose accent
  const COLOR_YELLOW_PINSTRIPE = '#F8C300';// Golden yellow separation pinstripe
  const COLOR_PRUSSIAN_SLATE = '#1C2833';  // Dark slate / Prussian blue underframe & sills
  const COLOR_SIGNAL_RED = '#C0392B';      // Buffer beam & cowcatcher signal red
  const COLOR_STEEL_SILVER = '#CBD5E1';    // Buffers, horn, metallic fittings
  const COLOR_CAB_INTERIOR = '#2D3748';    // Driver cab inner console & bulkhead

  return (
    <group position={[0, 0, 0]}>
      {/* ================= HEAVY MAIN UNDERFRAME / CHASSIS ================= */}
      {/* Heavy Steel Center Sill Deck */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.55, 0.32, 13.8]} />
        <meshStandardMaterial color={COLOR_PRUSSIAN_SLATE} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Side Sill Lower Steps & Walkways */}
      <mesh position={[-1.24, 0.76, 0]} receiveShadow>
        <boxGeometry args={[0.18, 0.08, 13.7]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.6} />
      </mesh>
      <mesh position={[1.24, 0.76, 0]} receiveShadow>
        <boxGeometry args={[0.18, 0.08, 13.7]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.6} />
      </mesh>

      {/* Fuel Tank & Air Reservoirs (Underframe belly) */}
      <mesh position={[0, 0.38, 0.3]} castShadow>
        <boxGeometry args={[2.2, 0.52, 4.2]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.5} />
      </mesh>
      {/* Dual Twin Cylindrical Compressed Air Tanks */}
      <mesh position={[-0.95, 0.36, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 3.8, 16]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0.95, 0.36, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 3.8, 16]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* ================= FRONT BUFFER BEAM & COWCATCHER (Z = -6.9) ================= */}
      {/* Signal Red Front Buffer Beam */}
      <mesh position={[0, 0.62, -6.9]} castShadow>
        <boxGeometry args={[2.58, 0.44, 0.22]} />
        <meshStandardMaterial color={COLOR_SIGNAL_RED} roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Left Buffer Head */}
      <mesh position={[-0.82, 0.62, -7.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
        <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right Buffer Head */}
      <mesh position={[0.82, 0.62, -7.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
        <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Sri Lanka Heavy Duty V-Plow Cowcatcher (Signal Red with steel bracing) */}
      <group position={[0, 0.3, -7.05]}>
        <mesh rotation={[-0.42, 0, 0]} castShadow>
          <boxGeometry args={[2.5, 0.48, 0.16]} />
          <meshStandardMaterial color={COLOR_SIGNAL_RED} metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Center Wedge Stanchion */}
        <mesh position={[0, -0.05, -0.1]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.14, 0.45, 0.25]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
        {/* Cowcatcher Grate Bars */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((barX, bIdx) => (
          <mesh key={bIdx} position={[barX, 0, 0]} rotation={[-0.42, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.48, 8]} />
            <meshStandardMaterial color="#F8C300" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Center Janney / Screw Coupling */}
      <mesh position={[0, 0.58, -7.16]}>
        <boxGeometry args={[0.16, 0.18, 0.3]} />
        <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* ================= REAR BUFFER BEAM & COWCATCHER (Z = +6.9) ================= */}
      <mesh position={[0, 0.62, 6.9]} castShadow>
        <boxGeometry args={[2.58, 0.44, 0.22]} />
        <meshStandardMaterial color={COLOR_SIGNAL_RED} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[-0.82, 0.62, 7.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
        <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.82, 0.62, 7.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.28, 16]} />
        <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ================= SAFETY HANDRAILS & WALKWAY STANCHIONS ================= */}
      {/* Front Nose Handrail Guard (Hidden in cab view for clear forward sightlines) */}
      {!isCabView && (
        <group position={[0, 1.15, -6.65]}>
          <mesh position={[-1.15, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.9, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[1.15, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.9, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 2.3, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* Long Walkway Handrails along both sides of Long Hood */}
      {[-1.18, 1.18].map((railX, rIdx) => (
        <group key={rIdx} position={[railX, 1.25, 3.4]}>
          {/* Top Horizontal Rail */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 6.2, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} />
          </mesh>
          {/* Mid Safety Rail */}
          <mesh position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 6.2, 8]} />
            <meshStandardMaterial color="#FACC15" metalness={0.8} />
          </mesh>
          {/* Vertical Stanchions */}
          {[-2.8, -1.4, 0, 1.4, 2.8].map((stanchZ, sIdx) => (
            <mesh key={sIdx} position={[0, -0.22, stanchZ]}>
              <cylinderGeometry args={[0.02, 0.02, 0.85, 8]} />
              <meshStandardMaterial color="#FACC15" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ================= SHORT HOOD / NOSE (EMD G12 FRONT NOSE) ================= */}
      {/* Front Nose Low Profile Hood (z = -3.8 to z = -6.2).
          HIDDEN in cab view to guarantee an unobstructed 100% clear view through the front windshield! */}
      {!isCabView && (
        <group position={[0, 0, 0]}>
          {/* Main Nose Body - Ice White Upper */}
          <mesh position={[0, 1.48, -5.0]} castShadow receiveShadow>
            <boxGeometry args={[2.18, 1.16, 2.4]} />
            <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.32} metalness={0.35} />
          </mesh>

          {/* Nose Front Bevel / Taper */}
          <mesh position={[0, 1.48, -6.25]} rotation={[0.22, 0, 0]} castShadow>
            <boxGeometry args={[2.14, 1.1, 0.35]} />
            <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.32} metalness={0.35} />
          </mesh>

          {/* Iconic Canadian M2 V-Shaped Blue Front Livery Chevron */}
          <mesh position={[0, 1.32, -6.36]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[1.9, 0.44, 0.16]} />
            <meshStandardMaterial color={COLOR_CYAN_BLUE} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.05, -6.32]} rotation={[0.22, 0, 0]}>
            <boxGeometry args={[1.92, 0.08, 0.17]} />
            <meshStandardMaterial color={COLOR_YELLOW_PINSTRIPE} roughness={0.2} emissive={COLOR_YELLOW_PINSTRIPE} emissiveIntensity={0.15} />
          </mesh>

          {/* Nose Side Blue Band & Yellow Pinstripe */}
          <mesh position={[0, 1.25, -5.0]}>
            <boxGeometry args={[2.22, 0.42, 2.42]} />
            <meshStandardMaterial color={COLOR_CYAN_BLUE} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.0, -5.0]}>
            <boxGeometry args={[2.23, 0.08, 2.42]} />
            <meshStandardMaterial color={COLOR_YELLOW_PINSTRIPE} roughness={0.2} emissive={COLOR_YELLOW_PINSTRIPE} emissiveIntensity={0.15} />
          </mesh>

          {/* Lower Nose Slate Sill */}
          <mesh position={[0, 0.88, -5.0]}>
            <boxGeometry args={[2.2, 0.16, 2.4]} />
            <meshStandardMaterial color={COLOR_PRUSSIAN_SLATE} roughness={0.5} />
          </mesh>

          {/* Front Number Plate "595" / "591" */}
          <group position={[0, 1.78, -6.36]} rotation={[0.22, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.65, 0.22, 0.04]} />
              <meshStandardMaterial color="#0B132B" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Plate Golden Border */}
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.62, 0.19, 0.03]} />
              <meshStandardMaterial color="#FEF08A" metalness={0.8} />
            </mesh>
          </group>

          {/* Class M2 Twin Headlight Fixture in Center Nose */}
          <group position={[0, 1.48, -6.42]} rotation={[0.22, 0, 0]}>
            {/* Cast Chrome Dual Housing */}
            <mesh>
              <boxGeometry args={[0.55, 0.32, 0.14]} />
              <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Left Sealed Beam Lens */}
            <mesh position={[-0.16, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.05, 16]} />
              <meshStandardMaterial
                color={isLightActive ? '#FFFBEB' : '#64748B'}
                emissive={isLightActive ? '#FEF08A' : '#000000'}
                emissiveIntensity={isLightBright ? 5.5 : isLightDim ? 2.2 : 0}
                roughness={0.1}
              />
            </mesh>
            {/* Right Sealed Beam Lens */}
            <mesh position={[0.16, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.11, 0.11, 0.05, 16]} />
              <meshStandardMaterial
                color={isLightActive ? '#FFFBEB' : '#64748B'}
                emissive={isLightActive ? '#FEF08A' : '#000000'}
                emissiveIntensity={isLightBright ? 5.5 : isLightDim ? 2.2 : 0}
                roughness={0.1}
              />
            </mesh>
          </group>

          {/* Front Ditch Lights / Marker Lamps on Deck */}
          <mesh position={[-0.92, 0.95, -6.5]}>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial
              color={isLightActive ? '#FFFBEB' : '#334155'}
              emissive={isLightActive ? '#FEF08A' : '#000000'}
              emissiveIntensity={isLightBright ? 3.0 : 0}
            />
          </mesh>
          <mesh position={[0.92, 0.95, -6.5]}>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial
              color={isLightActive ? '#FFFBEB' : '#334155'}
              emissive={isLightActive ? '#FEF08A' : '#000000'}
              emissiveIntensity={isLightBright ? 3.0 : 0}
            />
          </mesh>
        </group>
      )}

      {/* ================= RAISED DRIVER CAB (OFFSET CAB BETWEEN HOODS) ================= */}
      {/* Positioned from z = -3.7 to z = -1.1 */}
      {!isCabView && (
        <group position={[0, 0, 0]}>
          {/* Main Cab Outer Body (Ice White) */}
          <mesh position={[0, 2.38, -2.4]} castShadow receiveShadow>
            <boxGeometry args={[2.52, 2.05, 2.5]} />
            <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.3} metalness={0.35} />
          </mesh>

          {/* Arched Cab Roof Cap */}
          <mesh position={[0, 3.44, -2.4]} castShadow>
            <boxGeometry args={[2.58, 0.16, 2.62]} />
            <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.4} metalness={0.35} />
          </mesh>

          {/* Roof Forward Eaves / Visor Shielding Windshields */}
          <mesh position={[0, 3.48, -3.72]} rotation={[0.2, 0, 0]} castShadow>
            <boxGeometry args={[2.56, 0.12, 0.32]} />
            <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.35} />
          </mesh>

          {/* Cab Livery Bands (Cyan Blue + Yellow Pinstripe) */}
          <mesh position={[0, 1.48, -2.4]}>
            <boxGeometry args={[2.54, 0.46, 2.52]} />
            <meshStandardMaterial color={COLOR_CYAN_BLUE} roughness={0.3} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.2, -2.4]}>
            <boxGeometry args={[2.55, 0.08, 2.52]} />
            <meshStandardMaterial color={COLOR_YELLOW_PINSTRIPE} roughness={0.2} emissive={COLOR_YELLOW_PINSTRIPE} emissiveIntensity={0.15} />
          </mesh>

          {/* Forward Windshield Frames & High-Clarity Glass (Dual Cab Windows) */}
          {/* Left Windshield */}
          <mesh position={[-0.62, 2.58, -3.67]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[0.82, 0.72, 0.05]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.62, 2.58, -3.69]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[0.74, 0.64, 0.02]} />
            <meshStandardMaterial color="#7DD3FC" roughness={0.05} metalness={0.1} transparent opacity={0.35} />
          </mesh>

          {/* Right Windshield */}
          <mesh position={[0.62, 2.58, -3.67]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[0.82, 0.72, 0.05]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.62, 2.58, -3.69]} rotation={[-0.05, 0, 0]}>
            <boxGeometry args={[0.74, 0.64, 0.02]} />
            <meshStandardMaterial color="#7DD3FC" roughness={0.05} metalness={0.1} transparent opacity={0.35} />
          </mesh>

          {/* Front Dual Windshield Wipers */}
          <group ref={wiperLeftRef} position={[-0.62, 2.88, -3.72]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.025, 0.44, 0.02]} />
              <meshStandardMaterial color="#0B0D0E" metalness={0.9} />
            </mesh>
          </group>
          <group ref={wiperRightRef} position={[0.62, 2.88, -3.72]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.025, 0.44, 0.02]} />
              <meshStandardMaterial color="#0B0D0E" metalness={0.9} />
            </mesh>
          </group>

          {/* Cab Side Sliding Windows */}
          {/* Left Cab Side Window */}
          <mesh position={[-1.27, 2.58, -2.4]}>
            <boxGeometry args={[0.04, 0.68, 1.1]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          <mesh position={[-1.28, 2.58, -2.4]}>
            <boxGeometry args={[0.02, 0.6, 1.0]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.05} transparent opacity={0.4} />
          </mesh>

          {/* Right Cab Side Window */}
          <mesh position={[1.27, 2.58, -2.4]}>
            <boxGeometry args={[0.04, 0.68, 1.1]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          <mesh position={[1.28, 2.58, -2.4]}>
            <boxGeometry args={[0.02, 0.6, 1.0]} />
            <meshStandardMaterial color="#BAE6FD" roughness={0.05} transparent opacity={0.4} />
          </mesh>

          {/* Sri Lanka Railways M2 Number "595" on Cab Side Panel */}
          <group position={[-1.275, 1.95, -2.4]}>
            <mesh>
              <boxGeometry args={[0.02, 0.28, 0.7]} />
              <meshStandardMaterial color={COLOR_CYAN_BLUE} metalness={0.4} />
            </mesh>
          </group>
          <group position={[1.275, 1.95, -2.4]}>
            <mesh>
              <boxGeometry args={[0.02, 0.28, 0.7]} />
              <meshStandardMaterial color={COLOR_CYAN_BLUE} metalness={0.4} />
            </mesh>
          </group>

          {/* Leslie/Nathan 3-Chime Air Horn on Cab Roof */}
          <group position={[0.45, 3.65, -3.2]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.07, 0.35, 12]} />
              <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[-0.1, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.06, 0.28, 12]} />
              <meshStandardMaterial color={COLOR_STEEL_SILVER} metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        </group>
      )}

      {/* ================= LONG HOOD (EMD 12-567C DIESEL ENGINE COMPARTMENT) ================= */}
      {/* Extends from z = -1.1 to z = +6.4 */}
      <group position={[0, 0, 0]}>
        {/* Main Long Hood Engine Body (Ice White Upper) */}
        <mesh position={[0, 2.15, 2.65]} castShadow receiveShadow>
          <boxGeometry args={[2.22, 2.3, 7.5]} />
          <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.35} metalness={0.35} />
        </mesh>

        {/* Long Hood Arched Roof Profile */}
        <mesh position={[0, 3.32, 2.65]} castShadow>
          <boxGeometry args={[2.24, 0.12, 7.5]} />
          <meshStandardMaterial color={COLOR_UPPER_ICE_WHITE} roughness={0.4} metalness={0.35} />
        </mesh>

        {/* Long Hood Waistline Cyan Band & Yellow Pinstripe */}
        <mesh position={[0, 1.48, 2.65]}>
          <boxGeometry args={[2.24, 0.46, 7.52]} />
          <meshStandardMaterial color={COLOR_CYAN_BLUE} roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 2.65]}>
          <boxGeometry args={[2.25, 0.08, 7.52]} />
          <meshStandardMaterial color={COLOR_YELLOW_PINSTRIPE} roughness={0.2} emissive={COLOR_YELLOW_PINSTRIPE} emissiveIntensity={0.15} />
        </mesh>

        {/* Lower Slate Sill on Long Hood */}
        <mesh position={[0, 0.9, 2.65]}>
          <boxGeometry args={[2.24, 0.22, 7.5]} />
          <meshStandardMaterial color={COLOR_PRUSSIAN_SLATE} roughness={0.6} />
        </mesh>

        {/* Side Engine Louver Ventilation Grilles */}
        {[-1.125, 1.125].map((sideX, sideIdx) => (
          <group key={sideIdx} position={[sideX, 2.45, 2.8]}>
            {[-2.2, -0.9, 0.4, 1.7, 2.8].map((louverZ, lIdx) => (
              <mesh key={lIdx} position={[0, 0, louverZ]}>
                <boxGeometry args={[0.02, 0.85, 0.95]} />
                <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.4} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Engine Maintenance Access Seam Doors (Black outline grooving) */}
        {[-1.125, 1.125].map((sideX, sideIdx) => (
          <group key={sideIdx} position={[sideX, 1.7, 2.65]}>
            {[-2.6, -1.3, 0.0, 1.3, 2.6].map((doorZ, dIdx) => (
              <mesh key={dIdx} position={[0, 0, doorZ]}>
                <boxGeometry args={[0.015, 0.72, 0.04]} />
                <meshStandardMaterial color="#0B132B" metalness={0.9} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Iconic Canadian GM "NEWFOUNDLAND" / "CANADA" Cast Brass Builder's Nameplate */}
        <group position={[-1.13, 2.1, 0.4]}>
          <mesh>
            <boxGeometry args={[0.02, 0.22, 1.1]} />
            <meshStandardMaterial color="#B45309" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[-0.01, 0, 0]}>
            <boxGeometry args={[0.01, 0.16, 0.98]} />
            <meshStandardMaterial color="#FEF08A" metalness={0.9} />
          </mesh>
        </group>
        <group position={[1.13, 2.1, 0.4]}>
          <mesh>
            <boxGeometry args={[0.02, 0.22, 1.1]} />
            <meshStandardMaterial color="#B45309" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.01, 0.16, 0.98]} />
            <meshStandardMaterial color="#FEF08A" metalness={0.9} />
          </mesh>
        </group>

        {/* Roof Dynamic Brake & Radiator Cooling Fans */}
        <mesh position={[0, 3.42, 4.8]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.58, 0.18, 24]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.42, 5.8]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.58, 0.18, 24]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Dual EMD 12-567 Exhaust Stacks with Rain Caps */}
        <group position={[0, 3.52, 0.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.42, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Interior exhaust port hole */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#000000" roughness={1.0} />
          </mesh>
        </group>
        <group position={[0, 3.52, 2.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.25, 0.42, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <meshStandardMaterial color="#000000" roughness={1.0} />
          </mesh>
        </group>
      </group>

      {/* ================= LIGHTING SYSTEMS ================= */}
      {/* Forward Headlight Spotlight Cones */}
      {isLightActive && (
        <>
          <spotLight
            position={[0, 1.5, -6.6]}
            target-position={[0, 0, isLightBright ? -160 : -70]}
            angle={isLightBright ? 0.46 : 0.35}
            penumbra={0.45}
            intensity={isLightBright ? 22 : 8}
            distance={isLightBright ? 180 : 85}
            color="#FFFFFA"
            castShadow
          />
          <pointLight
            position={[-0.8, 1.2, -6.6]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 25 : 12}
          />
          <pointLight
            position={[0.8, 1.2, -6.6]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 25 : 12}
          />
        </>
      )}

      {/* Cab Interior Light */}
      {cabLightOn && (
        <pointLight position={[0, 2.5, -2.4]} color="#FEF3C7" intensity={2.8} distance={7} />
      )}

      {/* Walkway Step Ground Lighting */}
      {isLightActive && (
        <>
          <pointLight position={[-1.3, 0.8, -6.0]} color="#FEF08A" intensity={0.6} distance={3} />
          <pointLight position={[1.3, 0.8, -6.0]} color="#FEF08A" intensity={0.6} distance={3} />
        </>
      )}

      {/* ================= HEAVY EMD 6-WHEEL BOGIES (CO-CO TRUCKS) ================= */}
      {/* Front 3-Axle Truck */}
      <M2Bogie3D position={[0, 0, -3.8]} speedKmh={speedKmh} />
      {/* Rear 3-Axle Truck */}
      <M2Bogie3D position={[0, 0, 3.8]} speedKmh={speedKmh} />
    </group>
  );
}

// GLTF-Loaded Class M2 Locomotive with Dynamic Mesh Toggling
function GLTFClassM2Model({
  modelUrl,
  speedKmh,
  headlightsOn,
  headlightMode = 'bright',
  cabLightOn,
  wipersOn,
  isCabView = false,
}: {
  modelUrl: string;
  speedKmh: number;
  headlightsOn: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn: boolean;
  wipersOn: boolean;
  isCabView?: boolean;
}) {
  const gltf = useGLTF(modelUrl);
  const clonedScene = React.useMemo(() => {
    if (!gltf || !gltf.scene) return null;
    const scene = gltf.scene.clone(true);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return scene;
  }, [gltf]);

  // Adjust visibility of cab and front hood meshes when in Cab View to ensure 100% unobstructed visibility
  React.useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      if (
        isCabView &&
        (name.includes('hood') ||
          name.includes('nose') ||
          name.includes('cab_outer') ||
          name.includes('windshield_outer') ||
          name.includes('handrail_front'))
      ) {
        child.visible = false;
      } else {
        child.visible = true;
      }
    });
  }, [clonedScene, isCabView]);

  const isLightBright = headlightMode === 'bright';
  const isLightDim = headlightMode === 'dim';
  const isLightActive = headlightsOn || isLightBright || isLightDim;

  if (!clonedScene) {
    return (
      <ProceduralClassM2Body
        speedKmh={speedKmh}
        headlightsOn={headlightsOn}
        headlightMode={headlightMode}
        cabLightOn={cabLightOn}
        wipersOn={wipersOn}
        isCabView={isCabView}
      />
    );
  }

  return (
    <group position={[0, 0, 0]}>
      <primitive object={clonedScene} />

      {/* Dynamic Lighting System attached to GLTF model */}
      {isLightActive && (
        <>
          <spotLight
            position={[0, 1.5, -6.6]}
            target-position={[0, 0, isLightBright ? -160 : -70]}
            angle={isLightBright ? 0.46 : 0.35}
            penumbra={0.45}
            intensity={isLightBright ? 22 : 8}
            distance={isLightBright ? 180 : 85}
            color="#FFFFFA"
            castShadow
          />
          <pointLight
            position={[-0.8, 1.2, -6.6]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 25 : 12}
          />
          <pointLight
            position={[0.8, 1.2, -6.6]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 25 : 12}
          />
        </>
      )}

      {cabLightOn && (
        <pointLight position={[0, 2.5, -2.4]} color="#FEF3C7" intensity={2.8} distance={7} />
      )}

      {/* Front & Rear 3-Axle Co-Co Bogies */}
      <M2Bogie3D position={[0, 0, -3.8]} speedKmh={speedKmh} />
      <M2Bogie3D position={[0, 0, 3.8]} speedKmh={speedKmh} />
    </group>
  );
}

// Error boundary to gracefully catch GLTF asset loading errors and fall back to procedural
class GLTFErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.info('Falling back to procedural Class M2 model:', error?.message || 'GLTF not loaded');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ClassM2Locomotive({
  locoConfig,
  speedKmh,
  headlightsOn,
  headlightMode = 'bright',
  cabLightOn,
  wipersOn,
  isCabView = false,
  isNight = false,
}: ClassM2LocomotiveProps) {
  const modelUrl = (locoConfig as any)?.modelUrl;

  const fallbackBody = (
    <ProceduralClassM2Body
      speedKmh={speedKmh}
      headlightsOn={headlightsOn}
      headlightMode={headlightMode}
      cabLightOn={cabLightOn}
      wipersOn={wipersOn}
      isCabView={isCabView}
      isNight={isNight}
    />
  );

  if (modelUrl) {
    return (
      <GLTFErrorBoundary fallback={fallbackBody}>
        <Suspense fallback={fallbackBody}>
          <GLTFClassM2Model
            modelUrl={modelUrl}
            speedKmh={speedKmh}
            headlightsOn={headlightsOn}
            headlightMode={headlightMode}
            cabLightOn={cabLightOn}
            wipersOn={wipersOn}
            isCabView={isCabView}
          />
        </Suspense>
      </GLTFErrorBoundary>
    );
  }

  return fallbackBody;
}

