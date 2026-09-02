import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LocomotiveConfig } from '../../types';

interface ClassM4LocomotiveProps {
  locoConfig?: LocomotiveConfig;
  speedKmh?: number;
  headlightsOn?: boolean;
  headlightOn?: boolean;
  headlightMode?: 'off' | 'dim' | 'bright';
  cabLightOn?: boolean;
  wipersOn?: boolean;
  isCabView?: boolean;
  cameraMode?: string;
  isNight?: boolean;
}

// Authentic Sri Lanka Railways Class M4 (MLW MX-620) Color Palette
const COLOR_OFFWHITE_UPPER = '#DCE1E3'; // Upper hood top & cab roof
const COLOR_CERULEAN_BLUE = '#0083BE';  // Mid-body band & cab sides
const COLOR_YELLOW_STRIPE = '#F8C300';  // Separator pinstripe & front chevron
const COLOR_PRUSSIAN_DARK = '#1C2833';  // Chassis frame & lower side skirt
const COLOR_SIGNAL_RED = '#C0392B';     // Buffer plates & pilot cowcatcher
const COLOR_STEEL_BOGIE = '#17202A';    // Cast steel Co-Co bogie frame
const COLOR_POLISHED_STEEL = '#94A3B8'; // Wheel rims & machined steel axles
const COLOR_BLACK_CABINET = '#11161B';  // Rear electrical cabinet & radiator grilles
const COLOR_CAB_GREEN = '#1D4A34';      // Driver console desk
const COLOR_HANDRAIL_YELLOW = '#FACC15';// Safety stanchions & handrails

// Authentic Co-Co 3-Axle Heavy-Duty Bogie Assembly (6 Axles total for MLW MX-620)
function M4Bogie3D({ position, speedKmh }: { position: [number, number, number]; speedKmh: number }) {
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current && speedKmh !== 0) {
      // Wheel radius ~0.48m (approx 960mm diameter for MLW MX-620)
      const angularVelocity = ((speedKmh * 1000) / 3600) / 0.48;
      wheelsRef.current.rotation.x -= angularVelocity * delta;
    }
  });

  return (
    <group position={position}>
      {/* Heavy Cast Steel 3-Axle Bogie Frame */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.55, 0.28, 3.85]} />
        <meshStandardMaterial color={COLOR_STEEL_BOGIE} roughness={0.7} metalness={0.6} />
      </mesh>

      {/* Side Equalizer Beams & Heavy Suspension Leaf Packs */}
      {[-1.24, 1.24].map((sideX, sIdx) => (
        <group key={sIdx} position={[sideX, 0.35, 0]}>
          {/* Main Longitudinal Equalizer Bar */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.12, 0.16, 3.6]} />
            <meshStandardMaterial color="#0B0E11" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Dual Leaf Spring Clusters */}
          {[-0.68, 0.68].map((springZ, spIdx) => (
            <group key={spIdx} position={[0, -0.05, springZ]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.16, 0.14, 0.48]} />
                <meshStandardMaterial color="#374151" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Coil Spring Auxiliaries */}
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.16, 12]} />
                <meshStandardMaterial color="#1F2937" metalness={0.9} />
              </mesh>
            </group>
          ))}
          {/* Brake Cylinders */}
          {[-1.2, 1.2].map((cylZ, cIdx) => (
            <mesh key={cIdx} position={[0, 0.12, cylZ]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.22, 12]} />
              <meshStandardMaterial color="#111827" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3 Axles & 6 Flanged Steel Wheels (Rotating Wheelset) */}
      <group ref={wheelsRef}>
        {[-1.35, 0, 1.35].map((axleZ, aIdx) => (
          <group key={aIdx} position={[0, 0.38, axleZ]}>
            {/* Left Wheel with Tread & Flange */}
            <mesh position={[-0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.48, 0.48, 0.16, 24]} />
              <meshStandardMaterial color={COLOR_POLISHED_STEEL} metalness={0.92} roughness={0.15} />
            </mesh>
            <mesh position={[-0.99, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 0.03, 24]} />
              <meshStandardMaterial color={COLOR_POLISHED_STEEL} metalness={0.92} roughness={0.15} />
            </mesh>

            {/* Right Wheel with Tread & Flange */}
            <mesh position={[0.92, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.48, 0.48, 0.16, 24]} />
              <meshStandardMaterial color={COLOR_POLISHED_STEEL} metalness={0.92} roughness={0.15} />
            </mesh>
            <mesh position={[0.99, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 0.03, 24]} />
              <meshStandardMaterial color={COLOR_POLISHED_STEEL} metalness={0.92} roughness={0.15} />
            </mesh>

            {/* Heavy Steel Axle Shaft */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 1.95, 16]} />
              <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Roller Bearing Journal End Caps */}
            {[-1.12, 1.12].map((capX, capIdx) => (
              <mesh key={capIdx} position={[capX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.11, 0.11, 0.12, 16]} />
                <meshStandardMaterial color="#030712" metalness={0.9} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* Track Sanding Pipes */}
      {[-1.35, 1.35].map((sandZ, sIdx) => (
        <mesh key={sIdx} position={[-0.88, 0.22, sandZ + (sIdx === 0 ? -0.4 : 0.4)]} rotation={[0.4 * (sIdx === 0 ? -1 : 1), 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Procedural High-Detail Sri Lanka Railways Class M4 (MLW MX-620) Locomotive Body
export function ClassM4Locomotive({
  speedKmh = 0,
  headlightsOn = true,
  headlightOn,
  headlightMode = 'bright',
  cabLightOn = false,
  wipersOn = false,
  isCabView = false,
  cameraMode,
  isNight = false,
}: ClassM4LocomotiveProps) {
  const isDriverCabView = isCabView || cameraMode === 'DRIVER' || cameraMode === '360_CAB';
  const wiperLeftRef = useRef<THREE.Group>(null);
  const wiperRightRef = useRef<THREE.Group>(null);
  const exhaustPuffRef = useRef<THREE.Group>(null);

  // Animated wipers sweep
  useFrame(({ clock }) => {
    if (wipersOn) {
      const sweep = Math.sin(clock.getElapsedTime() * 4.2) * 0.48;
      if (wiperLeftRef.current) wiperLeftRef.current.rotation.z = sweep;
      if (wiperRightRef.current) wiperRightRef.current.rotation.z = sweep;
    } else {
      if (wiperLeftRef.current) wiperLeftRef.current.rotation.z = -0.45;
      if (wiperRightRef.current) wiperRightRef.current.rotation.z = -0.45;
    }

    // Gentle exhaust smoke / heat pulse
    if (exhaustPuffRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 8) * 0.15 + (speedKmh / 120) * 0.3;
      exhaustPuffRef.current.scale.set(scale, scale * 1.2, scale);
    }
  });

  const isLightBright = headlightMode === 'bright';
  const isLightDim = headlightMode === 'dim';
  const isLightActive = headlightOn !== undefined ? headlightOn : (headlightsOn || isLightBright || isLightDim);

  return (
    <group position={[0, 0, 0]}>
      {/* ================= HEAVY STEEL CHASSIS DECK & FRAME ================= */}
      {/* Main Structural I-Beam Bed */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.84, 0.28, 14.6]} />
        <meshStandardMaterial color={COLOR_PRUSSIAN_DARK} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Catwalk Walkway Deck Plate (Anti-Slip Steel) */}
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[2.92, 0.05, 14.6]} />
        <meshStandardMaterial color="#222F3E" roughness={0.85} metalness={0.3} />
      </mesh>

      {/* Lower Chassis Side Skirt Bands (Dark Prussian Blue) */}
      <mesh position={[0, 0.66, 0]}>
        <boxGeometry args={[2.86, 0.16, 14.5]} />
        <meshStandardMaterial color={COLOR_PRUSSIAN_DARK} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* ================= FRONT PILOT & BUFFER BEAM (z = -7.0) ================= */}
      <group position={[0, 0, -7.0]}>
        {/* Signal Red Buffer Plate */}
        <mesh position={[0, 0.6, 0.04]} castShadow>
          <boxGeometry args={[2.9, 0.68, 0.16]} />
          <meshStandardMaterial color={COLOR_SIGNAL_RED} roughness={0.32} metalness={0.2} />
        </mesh>

        {/* Dual Heavy Cast-Iron Buffers */}
        {[-1.05, 1.05].map((bx, bIdx) => (
          <group key={bIdx} position={[bx, 0.6, -0.22]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.16, 0.42, 16]} />
              <meshStandardMaterial color="#2E4053" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Buffer Impact Face Plate */}
            <mesh position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.04, 16]} />
              <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Center Automatic Coupler Assembly */}
        <group position={[0, 0.45, -0.32]}>
          <mesh>
            <boxGeometry args={[0.34, 0.24, 0.52]} />
            <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Coupler Knuckle */}
          <mesh position={[0.06, 0, -0.24]}>
            <boxGeometry args={[0.2, 0.22, 0.18]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} />
          </mesh>
        </group>

        {/* Angled Heavy Steel Cowcatcher (Pilot Plow) */}
        <mesh position={[0, 0.26, -0.1]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[2.7, 0.45, 0.14]} />
          <meshStandardMaterial color={COLOR_SIGNAL_RED} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Dual Vacuum Air Brake Hoses */}
        {[-0.45, 0.45].map((hx, hIdx) => (
          <group key={hIdx} position={[hx, 0.38, -0.16]}>
            <mesh rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#1F2937" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.18, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.08, 8]} />
              <meshStandardMaterial color={COLOR_SIGNAL_RED} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= REAR PILOT & BUFFER BEAM (z = +7.0) ================= */}
      <group position={[0, 0, 7.0]}>
        {/* Signal Red Buffer Plate */}
        <mesh position={[0, 0.6, -0.04]} castShadow>
          <boxGeometry args={[2.9, 0.68, 0.16]} />
          <meshStandardMaterial color={COLOR_SIGNAL_RED} roughness={0.32} metalness={0.2} />
        </mesh>

        {/* Dual Heavy Cast-Iron Buffers */}
        {[-1.05, 1.05].map((bx, bIdx) => (
          <group key={bIdx} position={[bx, 0.6, 0.22]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.16, 0.42, 16]} />
              <meshStandardMaterial color="#2E4053" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.04, 16]} />
              <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Center Automatic Coupler */}
        <group position={[0, 0.45, 0.32]}>
          <mesh>
            <boxGeometry args={[0.34, 0.24, 0.52]} />
            <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.06, 0, 0.24]}>
            <boxGeometry args={[0.2, 0.22, 0.18]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ================= CENTRAL FUEL TANK & AIR RESERVOIRS ================= */}
      <group position={[0, 0.45, 0]}>
        {/* Curved Fuel Tank Belly */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2.5, 0.55, 3.8]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} metalness={0.5} />
        </mesh>
        {/* Fuel Filler & Gauge Glass */}
        <mesh position={[-1.26, 0.05, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.08]} />
          <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.2} />
        </mesh>
        {/* Dual Compressed Air Cylinders */}
        {[-1.15, 1.15].map((cx, cIdx) => (
          <mesh key={cIdx} position={[cx, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 3.4, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ================= FRONT NOSE / SHORT HOOD (MLW MX-620) ================= */}
      {/* Hidden in driver cab view for 100% unobstructed panoramic visibility */}
      {!isDriverCabView && (
        <group position={[0, 0, 0]}>
          {/* Main Short Hood Body (Cerulean Blue) from z = -4.0 to z = -6.4 */}
          <mesh position={[0, 1.62, -5.2]} castShadow receiveShadow>
            <boxGeometry args={[2.42, 1.34, 2.4]} />
            <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.32} metalness={0.35} />
          </mesh>

          {/* Front Nose Chamfer / Taper Slant */}
          <mesh position={[0, 1.62, -6.44]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[2.38, 1.28, 0.28]} />
            <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.32} metalness={0.35} />
          </mesh>

          {/* Top Nose Chamfers (Slanted Side Shoulders of Short Hood) */}
          {[-1.14, 1.14].map((chamferX, chIdx) => (
            <mesh
              key={chIdx}
              position={[chamferX, 2.22, -5.2]}
              rotation={[0, 0, chIdx === 0 ? Math.PI / 6 : -Math.PI / 6]}
            >
              <boxGeometry args={[0.24, 0.24, 2.38]} />
              <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.32} metalness={0.35} />
            </mesh>
          ))}

          {/* Upper Nose Off-White Accent Lid */}
          <mesh position={[0, 2.3, -5.2]}>
            <boxGeometry args={[2.0, 0.06, 2.36]} />
            <meshStandardMaterial color={COLOR_OFFWHITE_UPPER} roughness={0.3} />
          </mesh>

          {/* Front Yellow V-Chevron Accent Band */}
          <mesh position={[0, 1.48, -6.52]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[2.34, 0.12, 0.16]} />
            <meshStandardMaterial
              color={COLOR_YELLOW_STRIPE}
              roughness={0.2}
              emissive={COLOR_YELLOW_STRIPE}
              emissiveIntensity={0.25}
            />
          </mesh>

          {/* Side Yellow Pinstripe on Short Hood */}
          <mesh position={[0, 1.15, -5.2]}>
            <boxGeometry args={[2.46, 0.08, 2.42]} />
            <meshStandardMaterial
              color={COLOR_YELLOW_STRIPE}
              roughness={0.2}
              emissive={COLOR_YELLOW_STRIPE}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Lower Nose Prussian Skirt */}
          <mesh position={[0, 1.02, -5.2]}>
            <boxGeometry args={[2.44, 0.18, 2.4]} />
            <meshStandardMaterial color={COLOR_PRUSSIAN_DARK} roughness={0.5} />
          </mesh>

          {/* Front Cast Number Plate ("745" - MLW MX-620 Ruwanweli) */}
          <group position={[0, 1.95, -6.52]} rotation={[0.18, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.7, 0.24, 0.04]} />
              <meshStandardMaterial color="#0B132B" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Gold Border Trim */}
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.66, 0.2, 0.03]} />
              <meshStandardMaterial color="#FEF08A" metalness={0.8} />
            </mesh>
          </group>

          {/* Dual Sealed-Beam Headlight Housing (MLW MX-620 Center Twin Fixture) */}
          <group position={[0, 1.62, -6.56]} rotation={[0.18, 0, 0]}>
            {/* Cast Heavy Metal Fixture Case */}
            <mesh>
              <boxGeometry args={[0.6, 0.34, 0.16]} />
              <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Left Sealed Beam Lens */}
            <mesh position={[-0.17, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
              <meshStandardMaterial
                color={isLightActive ? '#FFFBEB' : '#64748B'}
                emissive={isLightActive ? '#FEF08A' : '#000000'}
                emissiveIntensity={isLightBright ? 6.0 : isLightDim ? 2.5 : 0}
                roughness={0.1}
              />
            </mesh>
            {/* Right Sealed Beam Lens */}
            <mesh position={[0.17, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
              <meshStandardMaterial
                color={isLightActive ? '#FFFBEB' : '#64748B'}
                emissive={isLightActive ? '#FEF08A' : '#000000'}
                emissiveIntensity={isLightBright ? 6.0 : isLightDim ? 2.5 : 0}
                roughness={0.1}
              />
            </mesh>
          </group>

          {/* Front Pilot Deck Ditch Lights / Marker Lamps */}
          {[-0.98, 0.98].map((dx, dIdx) => (
            <group key={dIdx} position={[dx, 1.02, -6.6]}>
              <mesh>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
                <meshStandardMaterial color="#1F2937" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.03, 12]} />
                <meshStandardMaterial
                  color={isLightActive ? '#FFFBEB' : '#334155'}
                  emissive={isLightActive ? '#FEF08A' : '#000000'}
                  emissiveIntensity={isLightBright ? 3.5 : 0}
                />
              </mesh>
            </group>
          ))}

          {/* Front Nose Handrail Guard */}
          <group position={[0, 1.25, -6.7]}>
            <mesh position={[-1.15, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.95, 8]} />
              <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[1.15, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.95, 8]} />
              <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.44, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 2.3, 8]} />
              <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}

      {/* ================= DRIVER CAB (SLANTED MLW MX-620 ARCHITECTURE) ================= */}
      {/* Positioned from z = -2.2 to z = -4.0 */}
      <group position={[0, 0, 0]}>
        {/* Cab Main Structure - Cerulean Blue Walls */}
        <mesh position={[0, 2.3, -3.1]} castShadow receiveShadow>
          <boxGeometry args={[2.78, 2.7, 1.8]} />
          <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.3} metalness={0.35} />
        </mesh>

        {/* Cab Roof Curve / Off-White Silver Crown */}
        <mesh position={[0, 3.68, -3.1]} castShadow>
          <boxGeometry args={[2.84, 0.16, 1.9]} />
          <meshStandardMaterial color={COLOR_OFFWHITE_UPPER} roughness={0.32} metalness={0.3} />
        </mesh>

        {/* Signature MLW MX-620 Cab Brow / Visor Overhang (Sloping Forward) */}
        <mesh position={[0, 3.65, -4.06]} rotation={[0.22, 0, 0]}>
          <boxGeometry args={[2.82, 0.18, 0.35]} />
          <meshStandardMaterial color={COLOR_OFFWHITE_UPPER} roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Slanted Front Windshield Frame (12.5° Forward Angle = 0.22 rad) */}
        <group position={[0, 2.82, -3.95]} rotation={[0.22, 0, 0]}>
          {/* Outer Frame Mesh */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.72, 0.95, 0.08]} />
            <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.3} />
          </mesh>

          {/* Left Windshield Glass Pane (Driver Side) */}
          <mesh position={[-0.65, 0, 0.02]}>
            <boxGeometry args={[0.96, 0.68, 0.02]} />
            <meshPhysicalMaterial
              color="#E0F2FE"
              transparent
              opacity={0.25}
              roughness={0.05}
              transmission={0.96}
              reflectivity={0.9}
            />
          </mesh>

          {/* Left Windshield Wiper Assembly */}
          <group ref={wiperLeftRef} position={[-0.65, 0.36, 0.04]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.02, 0.44, 0.02]} />
              <meshStandardMaterial color="#000000" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.015, 0.36, 0.015]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>

          {/* Right Windshield Glass Pane (Assistant Driver Side) */}
          <mesh position={[0.65, 0, 0.02]}>
            <boxGeometry args={[0.96, 0.68, 0.02]} />
            <meshPhysicalMaterial
              color="#E0F2FE"
              transparent
              opacity={0.25}
              roughness={0.05}
              transmission={0.96}
              reflectivity={0.9}
            />
          </mesh>

          {/* Right Windshield Wiper Assembly */}
          <group ref={wiperRightRef} position={[0.65, 0.36, 0.04]}>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.02, 0.44, 0.02]} />
              <meshStandardMaterial color="#000000" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.015, 0.36, 0.015]} />
              <meshStandardMaterial color="#1E293B" />
            </mesh>
          </group>

          {/* Center Windshield Divider Pillar */}
          <mesh position={[0, 0, 0.03]}>
            <boxGeometry args={[0.14, 0.82, 0.06]} />
            <meshStandardMaterial color={COLOR_CERULEAN_BLUE} />
          </mesh>
        </group>

        {/* Cab Side Windows & Doors (Left & Right) */}
        {[-1.4, 1.4].map((sideX, sideIdx) => (
          <group key={sideIdx} position={[sideX, 2.5, -3.1]}>
            {/* Sliding Window Frame Cutout (Dark Charcoal) */}
            <mesh position={[0, 0.35, -0.15]}>
              <boxGeometry args={[0.04, 0.72, 0.9]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Tinted Glass Pane */}
            <mesh position={[0, 0.35, -0.15]}>
              <boxGeometry args={[0.02, 0.62, 0.8]} />
              <meshPhysicalMaterial color="#BAE6FD" transparent opacity={0.3} roughness={0.05} transmission={0.9} />
            </mesh>
            {/* Side Cab Access Door Outline */}
            <mesh position={[0, -0.4, 0.45]}>
              <boxGeometry args={[0.04, 1.6, 0.65]} />
              <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.35} />
            </mesh>
            {/* Chrome Door Handle */}
            <mesh position={[sideX > 0 ? 0.03 : -0.03, -0.3, 0.2]}>
              <boxGeometry args={[0.03, 0.12, 0.04]} />
              <meshStandardMaterial color="#F8FAFC" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Roof Air Horn Trumpet Assembly */}
        <group position={[0, 3.82, -3.4]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.42, 12]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.14, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.07, 0.35, 12]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Interior Vintage Emerald Green Desk & Instrument Cluster */}
        <group position={[0, 1.85, -3.45]}>
          {/* Main Control Console Desk */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.4, 0.8, 0.7]} />
            <meshStandardMaterial color={COLOR_CAB_GREEN} roughness={0.4} />
          </mesh>
          {/* Slanted Instrument Dashboard */}
          <mesh position={[0, 0.42, -0.08]} rotation={[-0.45, 0, 0]}>
            <boxGeometry args={[2.3, 0.55, 0.1]} />
            <meshStandardMaterial color="#111827" roughness={0.25} />
          </mesh>
          {/* Speedometer & Vacuum Dials (Glow) */}
          {[-0.5, -0.2, 0.2, 0.5].map((gx, gIdx) => (
            <mesh key={gIdx} position={[gx, 0.55, -0.15]} rotation={[-0.45, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive={isNight ? '#6EE7B7' : '#FFFFFF'}
                emissiveIntensity={isNight ? 0.6 : 0.1}
              />
            </mesh>
          ))}
          {/* Throttle Master Controller Lever */}
          <mesh position={[-0.45, 0.58, 0.15]} rotation={[0.25, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.35, 12]} />
            <meshStandardMaterial color="#DC2626" metalness={0.8} />
          </mesh>
          {/* Train Brake Valve Handle */}
          <mesh position={[0.45, 0.58, 0.15]} rotation={[-0.2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.3, 12]} />
            <meshStandardMaterial color="#EAB308" metalness={0.8} />
          </mesh>
          {/* High-Back Driver Seat */}
          <group position={[-0.65, 0.3, 0.6]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 0.12, 0.5]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.4, 0.2]}>
              <boxGeometry args={[0.48, 0.7, 0.12]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ================= LONG HOOD / ALCO 251 V12 ENGINE COMPARTMENT ================= */}
      {/* Positioned from z = -2.2 back to z = +5.2 (Length = 7.4m) */}
      <group position={[0, 0, 0]}>
        {/* Upper Engine Casing - Off-White / Silver-Grey */}
        <mesh position={[0, 2.65, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[2.46, 0.74, 7.4]} />
          <meshStandardMaterial color={COLOR_OFFWHITE_UPPER} roughness={0.32} metalness={0.3} />
        </mesh>

        {/* Rounded Top Hood Roof */}
        <mesh position={[0, 3.06, 1.5]} castShadow>
          <boxGeometry args={[2.42, 0.12, 7.36]} />
          <meshStandardMaterial color={COLOR_OFFWHITE_UPPER} roughness={0.32} metalness={0.3} />
        </mesh>

        {/* Middle Band - Cerulean / Cyan Blue (#0083BE) */}
        <mesh position={[0, 1.95, 1.5]} castShadow receiveShadow>
          <boxGeometry args={[2.48, 0.72, 7.42]} />
          <meshStandardMaterial color={COLOR_CERULEAN_BLUE} roughness={0.3} metalness={0.35} />
        </mesh>

        {/* Separating Vivid Yellow Pinstripe Band (#F8C300) */}
        <mesh position={[0, 1.54, 1.5]}>
          <boxGeometry args={[2.5, 0.08, 7.44]} />
          <meshStandardMaterial
            color={COLOR_YELLOW_STRIPE}
            roughness={0.2}
            emissive={COLOR_YELLOW_STRIPE}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Lower Prussian Blue / Charcoal Skirt (#1C2833) */}
        <mesh position={[0, 1.22, 1.5]}>
          <boxGeometry args={[2.46, 0.58, 7.4]} />
          <meshStandardMaterial color={COLOR_PRUSSIAN_DARK} roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Turbocharged ALCO 251 V12 Engine Exhaust Stack */}
        <group position={[0, 3.25, -0.4]}>
          <mesh rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.45, 16]} />
            <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.04, 16]} />
            <meshStandardMaterial color="#1F2937" metalness={0.9} />
          </mesh>
          {/* Simulated Exhaust Heat Shimmer / Puff */}
          <group ref={exhaustPuffRef} position={[0, 0.45, 0]}>
            <mesh>
              <sphereGeometry args={[0.24, 8, 8]} />
              <meshStandardMaterial color="#64748B" transparent opacity={0.15} roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* Side Louvered Air Intake Grilles & Dynamic Brake Compartment */}
        {[-1.25, 1.25].map((sideX, sIdx) => (
          <group key={sIdx} position={[sideX, 2.3, 0]}>
            {/* Primary Engine Louver Bank 1 */}
            <mesh position={[0, 0, -0.8]}>
              <boxGeometry args={[0.04, 0.85, 1.8]} />
              <meshStandardMaterial color={COLOR_BLACK_CABINET} metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Louver Slats */}
            {[-0.6, -0.2, 0.2, 0.6].map((lZ, lIdx) => (
              <mesh key={lIdx} position={[sideX > 0 ? 0.02 : -0.02, 0, -0.8 + lZ]}>
                <boxGeometry args={[0.02, 0.78, 0.06]} />
                <meshStandardMaterial color="#374151" metalness={0.9} />
              </mesh>
            ))}

            {/* Radiator Cooling Grilles Bank 2 (Near Rear) */}
            <mesh position={[0, 0.2, 3.4]}>
              <boxGeometry args={[0.04, 0.95, 2.2]} />
              <meshStandardMaterial color={COLOR_BLACK_CABINET} metalness={0.8} roughness={0.3} />
            </mesh>

            {/* "SRI LANKA RAILWAYS" / "SLR" Emblem Plaque */}
            <mesh position={[sideX > 0 ? 0.02 : -0.02, -0.32, 1.2]}>
              <boxGeometry args={[0.02, 0.22, 1.6]} />
              <meshStandardMaterial color="#0B132B" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[sideX > 0 ? 0.03 : -0.03, -0.32, 1.2]}>
              <boxGeometry args={[0.01, 0.16, 1.5]} />
              <meshStandardMaterial color="#FEF08A" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Top Radiator Cooling Fans (Twin Fans near rear of hood) */}
        {[3.0, 4.2].map((fanZ, fIdx) => (
          <group key={fIdx} position={[0, 3.12, fanZ]}>
            {/* Circular Fan Shroud Ring */}
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.54, 0.54, 0.08, 20]} />
              <meshStandardMaterial color="#1F2937" metalness={0.9} />
            </mesh>
            {/* Wire Mesh Fan Grille */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.02, 16]} />
              <meshStandardMaterial color="#0B0E11" metalness={0.9} roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= REAR OPEN PLATFORM & BLACK ELECTRICAL CABINET ================= */}
      {/* Positioned from z = +5.2 to z = +7.0 */}
      <group position={[0, 0, 0]}>
        {/* Rear Electrical / Dynamic Brake Cabinet Enclosure (Prominent Black Box in 4 Views) */}
        <mesh position={[0, 1.9, 5.75]} castShadow receiveShadow>
          <boxGeometry args={[2.34, 1.8, 1.1]} />
          <meshStandardMaterial color={COLOR_BLACK_CABINET} roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Cabinet Louvers & Access Hatches */}
        <mesh position={[0, 2.1, 6.32]}>
          <boxGeometry args={[1.8, 0.7, 0.04]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Rear Twin Sealed-Beam Reverse Headlights */}
        <group position={[0, 2.65, 6.32]}>
          <mesh>
            <boxGeometry args={[0.52, 0.28, 0.1]} />
            <meshStandardMaterial color="#0B0E11" metalness={0.9} />
          </mesh>
          {[-0.14, 0.14].map((rx, rIdx) => (
            <mesh key={rIdx} position={[rx, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
              <meshStandardMaterial
                color={isLightActive ? '#FFFBEB' : '#64748B'}
                emissive={isLightActive ? '#FEF08A' : '#000000'}
                emissiveIntensity={isLightActive ? 2.0 : 0}
              />
            </mesh>
          ))}
        </group>

        {/* Rear Yellow Platform Safety Guardrails (Wrapping around walkway) */}
        <group position={[0, 1.35, 6.8]}>
          {/* Left, Center & Right Vertical Stanchions */}
          {[-1.32, -0.6, 0.6, 1.32].map((px, pIdx) => (
            <mesh key={pIdx} position={[px, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.95, 8]} />
              <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Upper Top Handrail */}
          <mesh position={[0, 0.44, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.024, 0.024, 2.64, 8]} />
            <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Mid Safety Rail */}
          <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 2.64, 8]} />
            <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ================= FULL-LENGTH CATWALK SAFETY HANDRAILS ================= */}
      {[-1.38, 1.38].map((sideX, sIdx) => (
        <group key={sIdx} position={[sideX, 1.35, 0]}>
          {/* Continuous Top Handrail along catwalk */}
          <mesh position={[0, 0.44, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 11.2, 8]} />
            <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Vertical Stanchion Posts */}
          {[-4.6, -3.2, -1.8, -0.4, 1.0, 2.4, 3.8, 5.2, 6.4].map((sZ, postIdx) => (
            <mesh key={postIdx} position={[0, 0, sZ]}>
              <cylinderGeometry args={[0.022, 0.022, 0.92, 8]} />
              <meshStandardMaterial color={COLOR_HANDRAIL_YELLOW} metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ================= DYNAMIC FORWARD SPOTLIGHT SYSTEM ================= */}
      {isLightActive && (
        <>
          {/* Long-Distance Track Illuminator */}
          <spotLight
            position={[0, 1.65, -6.8]}
            target-position={[0, 0, isLightBright ? -170 : -75]}
            angle={isLightBright ? 0.44 : 0.32}
            penumbra={0.4}
            intensity={isLightBright ? 24 : 9}
            distance={isLightBright ? 190 : 90}
            color="#FFFFFA"
            castShadow
          />
          {/* Front Left Flood Lamp */}
          <pointLight
            position={[-0.8, 1.2, -6.8]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 26 : 14}
          />
          {/* Front Right Flood Lamp */}
          <pointLight
            position={[0.8, 1.2, -6.8]}
            color="#FFFFFA"
            intensity={isLightBright ? 4.5 : 1.8}
            distance={isLightBright ? 26 : 14}
          />
        </>
      )}

      {/* Cab Interior Warm Ambient Light */}
      {cabLightOn && (
        <pointLight position={[0, 2.8, -3.1]} color="#FEF3C7" intensity={2.8} distance={7} />
      )}

      {/* ================= FRONT & REAR CO-CO 3-AXLE BOGIES ================= */}
      <M4Bogie3D position={[0, 0, -4.0]} speedKmh={speedKmh} />
      <M4Bogie3D position={[0, 0, 4.0]} speedKmh={speedKmh} />
    </group>
  );
}
