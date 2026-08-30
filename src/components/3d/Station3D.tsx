import React from 'react';
import { StationData } from '../../types';
import { Text } from '@react-three/drei';

interface Station3DProps {
  station: StationData;
  isNight: boolean;
}

// 3D Passenger Figure
function Passenger3D({ position, color = "#3B82F6" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.9, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#FDBA74" roughness={0.6} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <mesh position={[0.08, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
    </group>
  );
}

// Station Platform Bench
function PlatformBench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Wooden Slats */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.45]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.8, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.4, 0.06]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      {/* Cast Iron Legs */}
      <mesh position={[-0.6, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.4]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} />
      </mesh>
      <mesh position={[0.6, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.4]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} />
      </mesh>
    </group>
  );
}

export function Station3D({ station, isNight }: Station3DProps) {
  const stationZ = -station.position;
  const isLeft = station.platformSide === 'LEFT' || station.platformSide === 'BOTH';
  const isRight = station.platformSide === 'RIGHT' || station.platformSide === 'BOTH';

  return (
    <group position={[0, 0, stationZ]}>
      {/* Left Platform */}
      {isLeft && (
        <group position={[-2.8, 0, 0]}>
          {/* Concrete Platform Deck */}
          <mesh position={[-0.9, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 0.78, 70]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
          </mesh>

          {/* Platform Tactile Yellow Safety Warning Edge Tile */}
          <mesh position={[0.45, 0.78, 0]}>
            <boxGeometry args={[0.22, 0.02, 70]} />
            <meshStandardMaterial color="#FACC15" roughness={0.4} />
          </mesh>

          {/* Modern Curved Tubular Canopy (from Reference Images 3 & 7) */}
          <group position={[-1.2, 0, 0]}>
            {/* Arched Curved White Roof Canopy */}
            <mesh position={[0, 4.0, 0]} castShadow>
              <boxGeometry args={[3.8, 0.2, 45]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Tubular White Supporting Columns */}
            {[-18, -6, 6, 18].map((pillarZ, idx) => (
              <mesh key={idx} position={[0, 2.1, pillarZ]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 3.8, 12]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.3} />
              </mesh>
            ))}
            {/* Platform Number 1 Sign */}
            <group position={[0, 3.4, 0]}>
              <mesh>
                <boxGeometry args={[0.05, 0.45, 0.45]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <Text position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.28} color="#DC2626">
                1
              </Text>
            </group>
          </group>

          {/* Authentic Sri Lankan Railway Station Board (Yellow Board with Black Bold Letters) */}
          <group position={[-1.2, 2.6, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.1, 1.8, 4.6]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 1.25, 4.4]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.3} />
            </mesh>
            {/* English Station Text */}
            <Text
              position={[0.05, 0.22, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.32}
              color="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {station.name.toUpperCase()}
            </Text>
            {/* Tamil & Sinhala Subtitles */}
            <Text
              position={[0.05, -0.22, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.24}
              color="#1E293B"
              anchorX="center"
              anchorY="middle"
            >
              {`${station.nameTamil} | ${station.nameSinhala}`}
            </Text>
          </group>

          {/* Platform Station Building */}
          <mesh position={[-3.8, 1.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 3.8, 24]} />
            <meshStandardMaterial color={station.isTerminal ? "#FDE68A" : "#F8FAFC"} roughness={0.6} />
          </mesh>

          {/* Terracotta Red Tile Roof */}
          <mesh position={[-3.8, 4.0, 0]} castShadow>
            <boxGeometry args={[3.6, 0.65, 25]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.6} />
          </mesh>

          {/* Platform Benches */}
          <PlatformBench position={[-1.2, 0.78, -12]} rotationY={0} />
          <PlatformBench position={[-1.2, 0.78, 12]} rotationY={0} />

          {/* Waiting Passengers */}
          <Passenger3D position={[-0.4, 0.78, -8]} color="#2563EB" />
          <Passenger3D position={[-0.6, 0.78, -5]} color="#DC2626" />
          <Passenger3D position={[-0.3, 0.78, 4]} color="#16A34A" />
          <Passenger3D position={[-0.8, 0.78, 10]} color="#D97706" />

          {/* Platform Night Lighting */}
          {isNight && (
            <pointLight position={[-1.2, 3.8, 0]} intensity={3.5} distance={28} color="#FEF3C7" castShadow />
          )}
        </group>
      )}

      {/* Right Platform */}
      {isRight && (
        <group position={[2.8, 0, 0]}>
          {/* Concrete Platform Deck */}
          <mesh position={[0.9, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 0.78, 70]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.75} />
          </mesh>

          {/* Tactile Warning Strip */}
          <mesh position={[-0.45, 0.78, 0]}>
            <boxGeometry args={[0.22, 0.02, 70]} />
            <meshStandardMaterial color="#FACC15" roughness={0.4} />
          </mesh>

          {/* Modern Curved Canopy */}
          <group position={[1.2, 0, 0]}>
            <mesh position={[0, 4.0, 0]} castShadow>
              <boxGeometry args={[3.8, 0.2, 45]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.1} />
            </mesh>
            {[-18, -6, 6, 18].map((pillarZ, idx) => (
              <mesh key={idx} position={[0, 2.1, pillarZ]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 3.8, 12]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.3} />
              </mesh>
            ))}
            {/* Platform Number 2 Sign */}
            <group position={[0, 3.4, 0]}>
              <mesh>
                <boxGeometry args={[0.05, 0.45, 0.45]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <Text position={[-0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.28} color="#DC2626">
                2
              </Text>
            </group>
          </group>

          {/* Station Board (Facing track) */}
          <group position={[1.2, 2.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 1.25, 4.4]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.3} />
            </mesh>
            <Text
              position={[0.05, 0.22, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.32}
              color="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {station.name.toUpperCase()}
            </Text>
            <Text
              position={[0.05, -0.22, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.24}
              color="#1E293B"
              anchorX="center"
              anchorY="middle"
            >
              {`${station.nameTamil} | ${station.nameSinhala}`}
            </Text>
          </group>

          <PlatformBench position={[1.2, 0.78, -10]} rotationY={Math.PI} />
          <PlatformBench position={[1.2, 0.78, 10]} rotationY={Math.PI} />

          {/* Waiting Passengers */}
          <Passenger3D position={[0.4, 0.78, -4]} color="#9333EA" />
          <Passenger3D position={[0.6, 0.78, 8]} color="#0D9488" />

          {/* Platform Night Lighting */}
          {isNight && (
            <pointLight position={[1.2, 3.8, 0]} intensity={3.5} distance={28} color="#FEF3C7" castShadow />
          )}
        </group>
      )}
    </group>
  );
}
