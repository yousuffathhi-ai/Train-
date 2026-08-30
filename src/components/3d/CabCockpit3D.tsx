import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface CabCockpit3DProps {
  speedKmh: number;
  throttle: number;
  throttleNotch?: number;
  brake: number;
  reverser?: number;
  awsAlarm: boolean;
  wipersOn: boolean;
  cabLightOn?: boolean;
  speedLimit?: number;
  nextStationName?: string;
  distToStationMeters?: number;
  currentSignal?: string;
  deadmanCountdown?: number;
  tractionLocked?: boolean;
}

export function CabCockpit3D({
  speedKmh,
  throttle,
  throttleNotch = 0,
  brake,
  reverser = 1,
  awsAlarm,
  wipersOn,
  cabLightOn = false,
  speedLimit = 40,
  nextStationName = "Batticaloa Terminal",
  distToStationMeters = 0,
  currentSignal = "green",
  deadmanCountdown = 36,
  tractionLocked = false
}: CabCockpit3DProps) {
  const speedNeedleRef = useRef<THREE.Mesh>(null);
  const brakeNeedleRef = useRef<THREE.Mesh>(null);
  const mainResNeedleRef = useRef<THREE.Mesh>(null);
  const wiperBladeLeftRef = useRef<THREE.Group>(null);
  const wiperBladeRightRef = useRef<THREE.Group>(null);
  const throttleLeverRef = useRef<THREE.Group>(null);
  const brakeLeverRef = useRef<THREE.Group>(null);
  const reverserLeverRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Speedometer needle (0 to 140 km/h: map from -135deg to +135deg)
    if (speedNeedleRef.current) {
      const speedAngle = -Math.PI * 0.75 + (Math.min(speedKmh, 140) / 140) * (Math.PI * 1.5);
      speedNeedleRef.current.rotation.z = -speedAngle;
    }

    // Brake pipe pressure needle (5.0 bar full release, 0 bar emergency)
    if (brakeNeedleRef.current) {
      const brakeAngle = Math.PI * 0.6 - (brake / 100) * (Math.PI * 1.2);
      brakeNeedleRef.current.rotation.z = -brakeAngle;
    }

    // Main Reservoir needle (slight natural oscillation around 8.5 bar)
    if (mainResNeedleRef.current) {
      const resAngle = 0.4 + Math.sin(time * 0.5) * 0.05;
      mainResNeedleRef.current.rotation.z = -resAngle;
    }

    // Dual Windshield Wipers
    if (wipersOn) {
      const sweep = Math.sin(time * 4.5) * 0.65;
      if (wiperBladeLeftRef.current) wiperBladeLeftRef.current.rotation.z = sweep;
      if (wiperBladeRightRef.current) wiperBladeRightRef.current.rotation.z = sweep;
    } else {
      if (wiperBladeLeftRef.current) wiperBladeLeftRef.current.rotation.z = -0.55;
      if (wiperBladeRightRef.current) wiperBladeRightRef.current.rotation.z = -0.55;
    }

    // Throttle Lever Animation
    if (throttleLeverRef.current) {
      const throttleAngle = -(throttleNotch / 8) * 0.65 + 0.32;
      throttleLeverRef.current.rotation.x = throttleAngle;
    }

    // Brake Lever Animation
    if (brakeLeverRef.current) {
      const brakeAngle = (brake / 100) * 0.65 - 0.32;
      brakeLeverRef.current.rotation.x = brakeAngle;
    }

    // Reverser Lever (1 = forward, 0 = neutral, -1 = reverse)
    if (reverserLeverRef.current) {
      reverserLeverRef.current.rotation.x = -reverser * 0.35;
    }
  });

  const reverserText = reverser === 1 ? 'FWD' : reverser === -1 ? 'REV' : 'NEU';
  const reverserColor = reverser === 1 ? '#10B981' : reverser === -1 ? '#EF4444' : '#F59E0B';

  return (
    <group position={[0, 0, 0]}>
      {/* Cab Ambient Interior Lighting */}
      <pointLight
        position={[0, 2.3, -2.0]}
        intensity={cabLightOn ? 2.5 : 0.4}
        distance={6}
        color={cabLightOn ? "#FFF5E1" : "#88CCFF"}
      />

      {/* Desk Spotlight illuminating gauge cluster */}
      <spotLight
        position={[0, 2.2, -1.8]}
        target-position={[0, 1.3, -2.5]}
        angle={0.7}
        penumbra={0.5}
        intensity={1.2}
        color="#CCFF00"
      />

      {/* ============================================================ */}
      {/* 1. CAB STRUCTURE & BULKHEAD ENCLOSURE (Full 360° Shell)     */}
      {/* ============================================================ */}

      {/* Cab Floor */}
      <mesh position={[0, 0.72, -2.2]} receiveShadow>
        <boxGeometry args={[2.32, 0.05, 3.4]} />
        <meshStandardMaterial color="#1E2022" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Cab Ceiling / Roof Panel */}
      <mesh position={[0, 2.62, -2.2]}>
        <boxGeometry args={[2.32, 0.06, 3.4]} />
        <meshStandardMaterial color="#181A1C" roughness={0.8} />
      </mesh>

      {/* Rear Bulkhead Wall & Door */}
      <group position={[0, 1.65, -0.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.32, 1.9, 0.08]} />
          <meshStandardMaterial color="#23272A" roughness={0.7} />
        </mesh>
        {/* Cab Access Door with Window */}
        <mesh position={[0, 0, 0.045]}>
          <boxGeometry args={[0.75, 1.7, 0.02]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
        {/* Door Window Glass */}
        <mesh position={[0, 0.4, 0.055]}>
          <boxGeometry args={[0.4, 0.5, 0.01]} />
          <meshStandardMaterial color="#38BDF8" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Door Chrome Handle */}
        <mesh position={[0.3, 0, 0.07]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Left Wall & Side Driver Window */}
      <group position={[-1.16, 1.65, -2.2]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.06, 1.9, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Side Sliding Window Frame */}
        <mesh position={[0.035, 0.25, -0.4]}>
          <boxGeometry args={[0.02, 0.75, 1.2]} />
          <meshStandardMaterial color="#0B0D0E" />
        </mesh>
        {/* Side Window Glass */}
        <mesh position={[0.035, 0.25, -0.4]}>
          <boxGeometry args={[0.01, 0.7, 1.15]} />
          <meshStandardMaterial color="#7DD3FC" transparent opacity={0.35} roughness={0.1} metalness={0.1} />
        </mesh>
      </group>

      {/* Right Wall & Side Co-Driver Window */}
      <group position={[1.16, 1.65, -2.2]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.06, 1.9, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Side Window Frame */}
        <mesh position={[-0.035, 0.25, -0.4]}>
          <boxGeometry args={[0.02, 0.75, 1.2]} />
          <meshStandardMaterial color="#0B0D0E" />
        </mesh>
        {/* Side Window Glass */}
        <mesh position={[-0.035, 0.25, -0.4]}>
          <boxGeometry args={[0.01, 0.7, 1.15]} />
          <meshStandardMaterial color="#7DD3FC" transparent opacity={0.35} roughness={0.1} metalness={0.1} />
        </mesh>
      </group>

      {/* Front Windshield Frame & Pillars */}
      <group position={[0, 1.95, -3.85]}>
        {/* Center Windshield Pillar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        {/* Top Header Rail */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.3, 0.1, 0.08]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        {/* Left Windshield Glass */}
        <mesh position={[-0.56, 0, 0]}>
          <boxGeometry args={[1.04, 1.0, 0.02]} />
          <meshStandardMaterial color="#E0F2FE" transparent opacity={0.12} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Right Windshield Glass */}
        <mesh position={[0.56, 0, 0]}>
          <boxGeometry args={[1.04, 1.0, 0.02]} />
          <meshStandardMaterial color="#E0F2FE" transparent opacity={0.12} roughness={0.05} metalness={0.1} />
        </mesh>

        {/* Sun Visor Shade */}
        <mesh position={[0.45, 0.42, 0.08]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.9, 0.25, 0.02]} />
          <meshStandardMaterial color="#1E293B" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Dual Windshield Wiper Assemblies */}
      <group ref={wiperBladeLeftRef} position={[-0.56, 1.5, -3.88]}>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.015, 0.65, 0.01]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0.01]}>
          <boxGeometry args={[0.02, 0.55, 0.005]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>
      <group ref={wiperBladeRightRef} position={[0.56, 1.5, -3.88]}>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.015, 0.65, 0.01]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0.01]}>
          <boxGeometry args={[0.02, 0.55, 0.005]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. ERGONOMIC DRIVER DESK CONSOLE & INSTRUMENT PANEL         */}
      {/* ============================================================ */}

      {/* Main Beveled Control Desk */}
      <group position={[0, 1.15, -3.2]}>
        {/* Lower Base Cabinet */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.7, 1.1]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Slanted Control Surface (Obsidian Tech Desk) */}
        <mesh position={[0, 0.22, 0]} rotation={[0.32, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.22, 0.12, 1.15]} />
          <meshStandardMaterial color="#0B0D0E" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* ============================================================ */}
        {/* DUAL DIGITAL MFD SCREENS (SRI LANKAN S13 COCKPIT DISPLAY)   */}
        {/* ============================================================ */}

        {/* Screen 1: Primary Locomotive Diagnostics MFD (Center Left) */}
        <group position={[0.22, 0.38, -0.32]} rotation={[-0.18, 0, 0]}>
          {/* Bezel */}
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.3, 0.03]} />
            <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* LCD Screen Display Glass */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.38, 0.26]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          {/* Screen Content */}
          <Text position={[-0.14, 0.09, 0.022]} fontSize={0.018} color="#38BDF8" anchorX="left">
            SPEED [KM/H]
          </Text>
          <Text position={[-0.14, 0.03, 0.022]} fontSize={0.042} color="#CCFF00" anchorX="left">
            {speedKmh.toFixed(1)}
          </Text>
          <Text position={[-0.14, -0.04, 0.022]} fontSize={0.018} color="#94A3B8" anchorX="left">
            NOTCH: {throttleNotch}/8
          </Text>
          <Text position={[0.08, -0.04, 0.022]} fontSize={0.018} color={reverserColor} anchorX="center">
            {reverserText}
          </Text>
          <Text position={[-0.14, -0.09, 0.022]} fontSize={0.016} color={tractionLocked ? "#EF4444" : "#10B981"} anchorX="left">
            {tractionLocked ? "TRACTION CUT" : "TRACTION ARMED"}
          </Text>
          <Text position={[0.1, 0.09, 0.022]} fontSize={0.016} color="#FACC15" anchorX="right">
            VCS: {Math.ceil(deadmanCountdown)}s
          </Text>
        </group>

        {/* Screen 2: Route & Signaling MFD (Center Right) */}
        <group position={[0.68, 0.38, -0.32]} rotation={[-0.18, 0, 0]}>
          {/* Bezel */}
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.3, 0.03]} />
            <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* LCD Screen Display Glass */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.38, 0.26]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          {/* Route Screen Content */}
          <Text position={[-0.16, 0.09, 0.022]} fontSize={0.016} color="#A78BFA" anchorX="left">
            NEXT STATION
          </Text>
          <Text position={[-0.16, 0.04, 0.022]} fontSize={0.022} color="#FFFFFF" anchorX="left">
            {nextStationName.substring(0, 16)}
          </Text>
          <Text position={[-0.16, -0.02, 0.022]} fontSize={0.018} color="#38BDF8" anchorX="left">
            DIST: {distToStationMeters >= 1000 ? `${(distToStationMeters / 1000).toFixed(2)} km` : `${Math.round(distToStationMeters)} m`}
          </Text>
          <Text position={[-0.16, -0.07, 0.022]} fontSize={0.018} color="#EF4444" anchorX="left">
            LIMIT: {speedLimit} KM/H
          </Text>
          <Text position={[0.14, -0.07, 0.022]} fontSize={0.016} color={currentSignal === 'green' ? '#10B981' : '#F59E0B'} anchorX="right">
            SIG: {currentSignal.toUpperCase()}
          </Text>
        </group>

        {/* ----------------- ANALOG GAUGES ON LEFT DESK PANEL ----------------- */}

        {/* 1. BRAKE PIPE GAUGE (BP) */}
        <group position={[-0.25, 0.38, -0.28]} rotation={[-0.18, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 24]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <circleGeometry args={[0.068, 24]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <ringGeometry args={[0.05, 0.065, 24]} />
            <meshBasicMaterial color="#38BDF8" />
          </mesh>
          <mesh ref={brakeNeedleRef} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.008, 0.055, 0.003]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
          <Text position={[0, -0.03, 0.02]} fontSize={0.018} color="#38BDF8">
            BP (BAR)
          </Text>
        </group>

        {/* 2. MAIN RESERVOIR GAUGE (MR) */}
        <group position={[-0.45, 0.38, -0.28]} rotation={[-0.18, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 24]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <circleGeometry args={[0.068, 24]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <ringGeometry args={[0.06, 0.065, 24]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <mesh ref={mainResNeedleRef} position={[0, 0, 0.02]}>
            <boxGeometry args={[0.006, 0.05, 0.003]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <Text position={[0, -0.03, 0.02]} fontSize={0.018} color="#10B981">
            MR (BAR)
          </Text>
        </group>

        {/* ----------------- AWS SUNFLOWER UNIT ----------------- */}
        <group position={[0.45, 0.18, -0.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.025, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <circleGeometry args={[0.048, 16]} />
            <meshBasicMaterial color={awsAlarm ? "#FACC15" : "#0F172A"} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.018} color={awsAlarm ? "#000000" : "#64748B"}>
            AWS
          </Text>
        </group>

        {/* ----------------- THROTTLE CONTROL LEVER (Left of Driver) ----------------- */}
        <group position={[-0.05, 0.28, 0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.35]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <Text position={[-0.07, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={0.022} color="#CCFF00">
            NOTCH [0-8]
          </Text>
          <group ref={throttleLeverRef} position={[0, 0.02, 0]}>
            <mesh position={[0, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.016, 0.28, 12]} />
              <meshStandardMaterial color="#CCFF00" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial color="#CCFF00" roughness={0.3} emissive="#CCFF00" emissiveIntensity={0.3} />
            </mesh>
          </group>
        </group>

        {/* ----------------- AIR BRAKE CONTROL LEVER (Right of Driver) ----------------- */}
        <group position={[0.96, 0.28, 0.15]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.35]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <Text position={[0.07, 0.03, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} fontSize={0.022} color="#EF4444">
            AIR BRAKE
          </Text>
          <group ref={brakeLeverRef} position={[0, 0.02, 0]}>
            <mesh position={[0, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.016, 0.28, 12]} />
              <meshStandardMaterial color="#EF4444" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial color="#EF4444" roughness={0.3} emissive="#EF4444" emissiveIntensity={0.3} />
            </mesh>
          </group>
        </group>

        {/* ----------------- REVERSER LEVER KEY ----------------- */}
        <group position={[0.45, 0.28, 0.25]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <group ref={reverserLeverRef} position={[0, 0.02, 0]}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 8]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.04, 0.025, 0.025]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
          </group>
        </group>

        {/* ----------------- HORN PUSH BUTTON ----------------- */}
        <group position={[0.26, 0.26, 0.28]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#EAB308" roughness={0.3} />
          </mesh>
          <Text position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.016} color="#000000">
            HORN
          </Text>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 3. DELUXE DRIVER SEAT & CO-DRIVER SEAT                      */}
      {/* ============================================================ */}

      {/* Driver Seat (Right/Center side behind control desk) */}
      <group position={[0.48, 0.72, -1.8]}>
        {/* Steel Pedestal Base */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.16, 0.5, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Seat Cushion Base */}
        <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.12, 0.52]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
        {/* Ergonomic Backrest */}
        <mesh position={[0, 0.88, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.65, 0.1]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
        {/* Headrest */}
        <mesh position={[0, 1.25, 0.26]} castShadow>
          <boxGeometry args={[0.28, 0.18, 0.08]} />
          <meshStandardMaterial color="#27272A" roughness={0.9} />
        </mesh>
        {/* Left & Right Armrests */}
        <mesh position={[-0.28, 0.7, 0.05]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.32]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        <mesh position={[0.28, 0.7, 0.05]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.32]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* Assistant Driver Seat (Left side) */}
      <group position={[-0.6, 0.72, -1.8]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.16, 0.5, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.12, 0.48]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.88, 0.2]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.65, 0.1]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
      </group>

      {/* Overhead Radio handset & Circuit Breakers */}
      <group position={[0, 2.5, -2.4]}>
        <mesh>
          <boxGeometry args={[1.2, 0.15, 0.4]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
        <mesh position={[-0.3, -0.06, 0]}>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#10B981" />
        </mesh>
        <mesh position={[0.3, -0.06, 0]}>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#EF4444" />
        </mesh>
      </group>
    </group>
  );
}
