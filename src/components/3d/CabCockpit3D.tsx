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

    // Analog Speedometer Needle (0 to 140 km/h)
    if (speedNeedleRef.current) {
      const speedRatio = Math.min(speedKmh, 140) / 140;
      const speedAngle = -Math.PI * 0.75 + speedRatio * (Math.PI * 1.5);
      speedNeedleRef.current.rotation.z = -speedAngle;
    }

    // Brake Pipe Pressure Needle (5.0 bar full release, 0 bar emergency)
    if (brakeNeedleRef.current) {
      const brakeRatio = brake / 100;
      const brakeAngle = Math.PI * 0.6 - brakeRatio * (Math.PI * 1.2);
      brakeNeedleRef.current.rotation.z = -brakeAngle;
    }

    // Main Reservoir Needle (Oscillating around 8.5 bar)
    if (mainResNeedleRef.current) {
      const resAngle = 0.4 + Math.sin(time * 0.5) * 0.03;
      mainResNeedleRef.current.rotation.z = -resAngle;
    }

    // Dual Windshield Wipers Animation
    if (wipersOn) {
      const sweep = Math.sin(time * 5.0) * 0.55;
      if (wiperBladeLeftRef.current) wiperBladeLeftRef.current.rotation.z = sweep;
      if (wiperBladeRightRef.current) wiperBladeRightRef.current.rotation.z = sweep;
    } else {
      if (wiperBladeLeftRef.current) wiperBladeLeftRef.current.rotation.z = -0.58;
      if (wiperBladeRightRef.current) wiperBladeRightRef.current.rotation.z = -0.58;
    }

    // Throttle Lever Movement (0 to 8 notches)
    if (throttleLeverRef.current) {
      const throttleAngle = -(throttleNotch / 8) * 0.62 + 0.31;
      throttleLeverRef.current.rotation.x = throttleAngle;
    }

    // Air Brake Handle Movement
    if (brakeLeverRef.current) {
      const brakeAngle = (brake / 100) * 0.62 - 0.31;
      brakeLeverRef.current.rotation.x = brakeAngle;
    }

    // Reverser Key (1 = forward, 0 = neutral, -1 = reverse)
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
        color={cabLightOn ? "#FFF5E1" : "#94A3B8"}
      />

      {/* Desk Illumination Spotlight */}
      <spotLight
        position={[0, 2.3, -1.8]}
        target-position={[0, 1.25, -2.8]}
        angle={0.7}
        penumbra={0.5}
        intensity={cabLightOn ? 1.6 : 0.8}
        color="#CCFF00"
      />

      {/* ============================================================ */}
      {/* 1. CAB STRUCTURE & BULKHEAD ENCLOSURE (Full 360° Interior)  */}
      {/* ============================================================ */}

      {/* Cab Floor Plate */}
      <mesh position={[0, 0.72, -2.2]} receiveShadow>
        <boxGeometry args={[2.34, 0.05, 3.4]} />
        <meshStandardMaterial color="#1E2022" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Cab Roof Ceiling */}
      <mesh position={[0, 2.62, -2.2]}>
        <boxGeometry args={[2.34, 0.06, 3.4]} />
        <meshStandardMaterial color="#181A1C" roughness={0.8} />
      </mesh>

      {/* Rear Bulkhead Wall & Door */}
      <group position={[0, 1.65, -0.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.34, 1.9, 0.08]} />
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
          <meshStandardMaterial color="#38BDF8" transparent opacity={0.25} roughness={0.1} />
        </mesh>
        {/* Door Chrome Handle */}
        <mesh position={[0.3, 0, 0.07]}>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* LEFT WALL & SIDE SLIDING DRIVER WINDOW (Image 1 & 2 Cab)    */}
      {/* ============================================================ */}
      <group position={[-1.17, 1.65, -2.2]}>
        {/* Lower Solid Wall (below window sill) */}
        <mesh position={[0, -0.45, 0]} receiveShadow>
          <boxGeometry args={[0.06, 1.0, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Upper Solid Wall Header (above window) */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[0.06, 0.45, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Rear Side Pillar */}
        <mesh position={[0, 0.15, 1.1]}>
          <boxGeometry args={[0.06, 0.7, 1.2]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Front Side Pillar */}
        <mesh position={[0, 0.15, -1.2]}>
          <boxGeometry args={[0.06, 0.7, 1.0]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>

        {/* Sliding Window Outer Frame */}
        <mesh position={[0.01, 0.15, -0.2]}>
          <boxGeometry args={[0.04, 0.68, 1.4]} />
          <meshStandardMaterial color="#0B0D0E" metalness={0.8} />
        </mesh>
        {/* Left Side Window Clear Glass */}
        <mesh position={[0.01, 0.15, -0.2]}>
          <boxGeometry args={[0.01, 0.62, 1.34]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.15} roughness={0.05} metalness={0.2} />
        </mesh>
        {/* Driver Padded Leather Armrest on Window Sill */}
        <mesh position={[0.04, -0.02, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.06, 0.65]} />
          <meshStandardMaterial color="#27272A" roughness={0.9} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* RIGHT WALL & SIDE SLIDING CO-DRIVER WINDOW                   */}
      {/* ============================================================ */}
      <group position={[1.17, 1.65, -2.2]}>
        {/* Lower Solid Wall */}
        <mesh position={[0, -0.45, 0]} receiveShadow>
          <boxGeometry args={[0.06, 1.0, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Upper Solid Wall */}
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[0.06, 0.45, 3.4]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Rear Pillar */}
        <mesh position={[0, 0.15, 1.1]}>
          <boxGeometry args={[0.06, 0.7, 1.2]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>
        {/* Front Pillar */}
        <mesh position={[0, 0.15, -1.2]}>
          <boxGeometry args={[0.06, 0.7, 1.0]} />
          <meshStandardMaterial color="#1E2022" roughness={0.7} />
        </mesh>

        {/* Sliding Window Frame */}
        <mesh position={[-0.01, 0.15, -0.2]}>
          <boxGeometry args={[0.04, 0.68, 1.4]} />
          <meshStandardMaterial color="#0B0D0E" metalness={0.8} />
        </mesh>
        {/* Right Side Window Glass */}
        <mesh position={[-0.01, 0.15, -0.2]}>
          <boxGeometry args={[0.01, 0.62, 1.34]} />
          <meshStandardMaterial color="#BAE6FD" transparent opacity={0.15} roughness={0.05} metalness={0.2} />
        </mesh>
        {/* Co-Driver Armrest */}
        <mesh position={[-0.04, -0.02, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.08, 0.06, 0.65]} />
          <meshStandardMaterial color="#27272A" roughness={0.9} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* FRONT WINDSHIELD APERTURE & ULTRA-CLEAR GLASS (100% VISIBLE) */}
      {/* ============================================================ */}
      <group position={[0, 2.05, -3.8]}>
        {/* Center Windshield Pillar (Narrow vertical post) */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.06, 1.05, 0.08]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        {/* Top Header Rail */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[2.3, 0.08, 0.08]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        {/* Left Outer Pillar */}
        <mesh position={[-1.15, 0, 0]}>
          <boxGeometry args={[0.06, 1.05, 0.08]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        {/* Right Outer Pillar */}
        <mesh position={[1.15, 0, 0]}>
          <boxGeometry args={[0.06, 1.05, 0.08]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>

        {/* Left Windshield Glass (Ultra-clear high transmission) */}
        <mesh position={[-0.58, 0, 0]}>
          <boxGeometry args={[1.08, 0.98, 0.01]} />
          <meshStandardMaterial color="#E0F2FE" transparent opacity={0.04} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Right Windshield Glass (Ultra-clear) */}
        <mesh position={[0.58, 0, 0]}>
          <boxGeometry args={[1.08, 0.98, 0.01]} />
          <meshStandardMaterial color="#E0F2FE" transparent opacity={0.04} roughness={0.05} metalness={0.1} />
        </mesh>

        {/* Left Driver Sun Visor */}
        <mesh position={[-0.58, 0.38, 0.06]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.92, 0.22, 0.015]} />
          <meshStandardMaterial color="#0F172A" transparent opacity={0.8} />
        </mesh>
        {/* Right Co-Driver Sun Visor */}
        <mesh position={[0.58, 0.38, 0.06]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.92, 0.22, 0.015]} />
          <meshStandardMaterial color="#0F172A" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Dual Windshield Wipers (Bottom-mounted, sweeps cleanly across glass) */}
      <group ref={wiperBladeLeftRef} position={[-0.58, 1.55, -3.76]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.015, 0.58, 0.01]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0.008]}>
          <boxGeometry args={[0.02, 0.5, 0.004]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>
      <group ref={wiperBladeRightRef} position={[0.58, 1.55, -3.76]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.015, 0.58, 0.01]} />
          <meshStandardMaterial color="#0F172A" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0.008]}>
          <boxGeometry args={[0.02, 0.5, 0.004]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. DRIVER CONSOLE DESK & INSTRUMENT PANEL (Images 1 & 2)    */}
      {/* ============================================================ */}
      <group position={[0, 1.15, -3.1]}>
        {/* Base Lower Pedestal */}
        <mesh position={[0, -0.22, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.65, 1.0]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Slanted Matte Obsidian Control Tabletop */}
        <mesh position={[0, 0.18, 0]} rotation={[0.28, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.22, 0.1, 1.05]} />
          <meshStandardMaterial color="#0B0D0E" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* ============================================================ */}
        {/* DUAL DIGITAL MFD SCREENS & ANALOG GAUGES                    */}
        {/* ============================================================ */}

        {/* Diagnostics MFD Screen (Center-Left) */}
        <group position={[0.22, 0.35, -0.28]} rotation={[-0.16, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.28, 0.03]} />
            <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          {/* Screen Readouts */}
          <Text position={[-0.14, 0.08, 0.022]} fontSize={0.018} color="#38BDF8" anchorX="left">
            SPEED [KM/H]
          </Text>
          <Text position={[-0.14, 0.02, 0.022]} fontSize={0.042} color="#CCFF00" anchorX="left">
            {speedKmh.toFixed(1)}
          </Text>
          <Text position={[-0.14, -0.04, 0.022]} fontSize={0.018} color="#94A3B8" anchorX="left">
            NOTCH: {throttleNotch}/8
          </Text>
          <Text position={[0.08, -0.04, 0.022]} fontSize={0.018} color={reverserColor} anchorX="center">
            {reverserText}
          </Text>
          <Text position={[-0.14, -0.08, 0.022]} fontSize={0.016} color={tractionLocked ? "#EF4444" : "#10B981"} anchorX="left">
            {tractionLocked ? "TRACTION CUT" : "TRACTION ARMED"}
          </Text>
          <Text position={[0.1, 0.08, 0.022]} fontSize={0.016} color="#FACC15" anchorX="right">
            VCS: {Math.ceil(deadmanCountdown)}s
          </Text>
        </group>

        {/* Route MFD Screen (Center-Right) */}
        <group position={[0.68, 0.35, -0.28]} rotation={[-0.16, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.28, 0.03]} />
            <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          <Text position={[-0.16, 0.08, 0.022]} fontSize={0.016} color="#A78BFA" anchorX="left">
            NEXT STATION
          </Text>
          <Text position={[-0.16, 0.03, 0.022]} fontSize={0.02} color="#FFFFFF" anchorX="left">
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

        {/* Brake Pipe Pressure Gauge */}
        <group position={[-0.25, 0.35, -0.24]} rotation={[-0.16, 0, 0]}>
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

        {/* Main Reservoir Pressure Gauge */}
        <group position={[-0.45, 0.35, -0.24]} rotation={[-0.16, 0, 0]}>
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

        {/* AWS Aspect Indicator */}
        <group position={[0.45, 0.16, -0.12]}>
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
        <group position={[-0.05, 0.25, 0.15]}>
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
        <group position={[0.96, 0.25, 0.15]}>
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
        <group position={[0.45, 0.25, 0.22]}>
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
        <group position={[0.26, 0.24, 0.26]}>
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
      {/* 3. DRIVER SEAT & CO-DRIVER SEAT                             */}
      {/* ============================================================ */}
      <group position={[0.48, 0.72, -1.8]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.16, 0.5, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.12, 0.52]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.88, 0.22]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.52, 0.65, 0.1]} />
          <meshStandardMaterial color="#1E2022" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.25, 0.26]} castShadow>
          <boxGeometry args={[0.28, 0.18, 0.08]} />
          <meshStandardMaterial color="#27272A" roughness={0.9} />
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
    </group>
  );
}
