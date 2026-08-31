import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoachInterior3DProps {
  position?: [number, number, number];
  isNight?: boolean;
}

export function CoachInterior3D({ position = [0, 0, 12.8], isNight = false }: CoachInterior3DProps) {
  return (
    <group position={position}>
      {/* Coach Interior Floor Carpet / Rubber Mat */}
      <mesh position={[0, 0.72, 0]} receiveShadow>
        <boxGeometry args={[2.36, 0.04, 11.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.9} />
      </mesh>

      {/* Aisle Runner Carpet (Classic Red) */}
      <mesh position={[0, 0.745, 0]} receiveShadow>
        <boxGeometry args={[0.65, 0.01, 11.6]} />
        <meshStandardMaterial color="#991B1B" roughness={0.8} />
      </mesh>

      {/* Interior Ceiling with Soft Warm Overhead Lights */}
      <mesh position={[0, 3.0, 0]}>
        <boxGeometry args={[2.34, 0.04, 11.8]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.7} />
      </mesh>

      {/* Interior Fluorescent / LED Ceiling Lamp Tubes */}
      {[-4.0, -2.0, 0, 2.0, 4.0].map((z, idx) => (
        <group key={`ceiling-lamp-${idx}`} position={[0, 2.96, z]}>
          <mesh>
            <boxGeometry args={[0.3, 0.04, 0.9]} />
            <meshStandardMaterial
              color="#FFFBEB"
              emissive="#FEF08A"
              emissiveIntensity={isNight ? 1.8 : 0.8}
            />
          </mesh>
          <pointLight
            position={[0, -0.2, 0]}
            intensity={isNight ? 1.5 : 0.6}
            distance={5.5}
            color="#FFFBEB"
          />
        </group>
      ))}

      {/* Side Walls with Warm Wood / Ivory Laminate */}
      <mesh position={[-1.17, 1.85, 0]}>
        <boxGeometry args={[0.04, 2.2, 11.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>
      <mesh position={[1.17, 1.85, 0]}>
        <boxGeometry args={[0.04, 2.2, 11.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>

      {/* End Bulkhead Partitions & Sliding Gangway Doors */}
      {[-5.85, 5.85].map((z, idx) => (
        <group key={`bulkhead-${idx}`} position={[0, 1.85, z]}>
          <mesh>
            <boxGeometry args={[2.34, 2.25, 0.06]} />
            <meshStandardMaterial color="#334155" roughness={0.7} />
          </mesh>
          {/* Center Glass Door */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.7, 1.8, 0.02]} />
            <meshStandardMaterial color="#0284C7" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Rows of Romanian Coach 2+2 Vinyl Passenger Seats */}
      {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((z, rowIdx) => (
        <group key={`seat-row-${rowIdx}`} position={[0, 0, z]}>
          {/* Left Double Seat */}
          <group position={[-0.72, 0.74, 0]}>
            {/* Seat Base Cushion (Sri Lankan Blue Vinyl) */}
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.75, 0.12, 0.52]} />
              <meshStandardMaterial color="#1D4ED8" roughness={0.8} />
            </mesh>
            {/* Seat Backrest */}
            <mesh position={[0, 0.85, -0.22]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.75, 0.75, 0.1]} />
              <meshStandardMaterial color="#1E40AF" roughness={0.8} />
            </mesh>
            {/* Headrest Cover (White Linen) */}
            <mesh position={[0, 1.15, -0.21]}>
              <boxGeometry args={[0.7, 0.2, 0.11]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
            </mesh>
            {/* Chrome Seat Leg */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Right Double Seat (Ocean View) */}
          <group position={[0.72, 0.74, 0]}>
            {/* Base Cushion */}
            <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.75, 0.12, 0.52]} />
              <meshStandardMaterial color="#1D4ED8" roughness={0.8} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.85, -0.22]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.75, 0.75, 0.1]} />
              <meshStandardMaterial color="#1E40AF" roughness={0.8} />
            </mesh>
            {/* Headrest Cover */}
            <mesh position={[0, 1.15, -0.21]}>
              <boxGeometry args={[0.7, 0.2, 0.11]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.9} />
            </mesh>
            {/* Seat Leg */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

          {/* Overhead Luggage Racks & Grab Rail */}
          <mesh position={[-0.85, 2.45, 0]}>
            <boxGeometry args={[0.55, 0.04, 1.1]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.85, 2.45, 0]}>
            <boxGeometry args={[0.55, 0.04, 1.1]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Continuous Stainless Steel Ceiling Handrails along Aisle */}
      <mesh position={[-0.32, 2.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 11.2, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.32, 2.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 11.2, 8]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}
