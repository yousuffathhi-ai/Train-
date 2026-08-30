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

// Kattankudy Islamic Crescent & Star Monument (Image 6 Landmark)
function KattankudyMonument({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Circular Curbs with Black & White Chevron Trim */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4.2, 4.4, 0.3, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Raised Round Pedestal Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.8, 0.4, 24]} />
        <meshStandardMaterial color="#0284C7" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Flared Conical Fountain / Base Column (White & Blue) */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[1.1, 2.2, 2.2, 24]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* Golden Sunburst Ray Ring */}
      <mesh position={[0, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.8, 24]} />
        <meshStandardMaterial color="#FACC15" emissive="#F59E0B" emissiveIntensity={0.6} side={2} />
      </mesh>

      {/* Iconic Large Golden Crescent Moon (Torus sector / curved ribbon) */}
      <group position={[0, 4.2, 0]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Outer Crescent Arc */}
        <mesh castShadow>
          <torusGeometry args={[2.0, 0.28, 16, 48, Math.PI * 1.5]} />
          <meshStandardMaterial
            color="#F59E0B"
            emissive="#D97706"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Central 5-Pointed Star */}
        <group position={[0.2, 0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.9, 0.9, 0.22, 5]} />
            <meshStandardMaterial
              color="#FBBF24"
              emissive="#F59E0B"
              emissiveIntensity={0.7}
              metalness={0.8}
              roughness={0.15}
            />
          </mesh>
        </group>
      </group>

      {/* Monument Ambient Spotlight */}
      <pointLight position={[0, 5.0, 0]} color="#FEF08A" intensity={3.5} distance={20} />
    </group>
  );
}

// Modern Sri Lankan Curved Canopy Platform (Beliatta / Matara Terminal Architecture)
function CurvedModernCanopy({ length = 60 }: { length?: number }) {
  return (
    <group>
      {/* Cantilever Arched Canopy Roof (Sweeping white ribbed curved roof) */}
      <mesh position={[0, 4.5, 0]} rotation={[0, 0, 0.12]} castShadow>
        <boxGeometry args={[4.4, 0.22, length]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Underside Ribbed Steel Truss Frames */}
      {[-24, -16, -8, 0, 8, 16, 24].map((z, idx) => (
        <group key={idx} position={[0, 4.35, z]}>
          <mesh rotation={[0, 0, 0.12]}>
            <boxGeometry args={[4.3, 0.12, 0.15]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Flared White Circular Architectural Columns (Pairs along platform) */}
      {[-22, -11, 0, 11, 22].map((pillarZ, idx) => (
        <group key={idx} position={[-0.6, 0, pillarZ]}>
          {/* Main Cylindrical Column */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 4.2, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Decorative Flared Capital at Top of Column */}
          <mesh position={[0, 4.2, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.16, 0.35, 16]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.2} metalness={0.2} />
          </mesh>
          {/* Column Base Plinth */}
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.26, 0.28, 0.4, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Station3D({ station, isNight }: Station3DProps) {
  const stationZ = -station.position;
  const isLeft = station.platformSide === 'LEFT' || station.platformSide === 'BOTH';
  const isRight = station.platformSide === 'RIGHT' || station.platformSide === 'BOTH';
  const isKattankudy = station.id === 2 || station.name.toLowerCase().includes('kattankudy');

  return (
    <group position={[0, 0, stationZ]}>
      {/* Kattankudy Crescent & Star Monument (Image 6) on the East Station Entrance Plaza */}
      {isKattankudy && (
        <KattankudyMonument position={[14.5, 0, 0]} />
      )}

      {/* Left Platform */}
      {isLeft && (
        <group position={[-2.8, 0, 0]}>
          {/* Concrete Platform Deck */}
          <mesh position={[-1.0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.78, 72]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.7} />
          </mesh>

          {/* Platform Tactile Yellow Safety Warning Edge Tile */}
          <mesh position={[0.5, 0.78, 0]}>
            <boxGeometry args={[0.24, 0.02, 72]} />
            <meshStandardMaterial color="#FACC15" roughness={0.35} />
          </mesh>

          {/* Modern Curved Tubular Canopy (Beliatta / Matara Terminal Design) */}
          <group position={[-1.0, 0, 0]}>
            <CurvedModernCanopy length={58} />

            {/* Platform Number 1 Sign */}
            <group position={[0.2, 3.8, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.48, 0.48]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <Text position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.32} color="#DC2626">
                1
              </Text>
            </group>
          </group>

          {/* Authentic Sri Lankan Railway Station Board (Yellow Board with Black Bold Letters) */}
          <group position={[-1.4, 2.8, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, -0.6, 0]}>
              <boxGeometry args={[0.1, 1.8, 4.8]} />
              <meshStandardMaterial color="#0F172A" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 1.3, 4.6]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.3} />
            </mesh>
            {/* English Station Text */}
            <Text
              position={[0.05, 0.24, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.34}
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

          {/* Station Main Pavilion Building */}
          <mesh position={[-4.2, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.8, 4.2, 26]} />
            <meshStandardMaterial color={station.isTerminal ? "#FEF3C7" : "#FFFFFF"} roughness={0.5} />
          </mesh>

          {/* Terracotta Modern Canopy Roof */}
          <mesh position={[-4.2, 4.5, 0]} castShadow>
            <boxGeometry args={[4.2, 0.6, 27]} />
            <meshStandardMaterial color="#991B1B" roughness={0.6} />
          </mesh>

          {/* Platform Benches */}
          <PlatformBench position={[-1.2, 0.78, -14]} rotationY={0} />
          <PlatformBench position={[-1.2, 0.78, 14]} rotationY={0} />

          {/* Waiting Passengers */}
          <Passenger3D position={[-0.3, 0.78, -8]} color="#2563EB" />
          <Passenger3D position={[-0.6, 0.78, -4]} color="#DC2626" />
          <Passenger3D position={[-0.2, 0.78, 5]} color="#16A34A" />
          <Passenger3D position={[-0.7, 0.78, 11]} color="#D97706" />

          {/* Platform Night Lighting */}
          {isNight && (
            <pointLight position={[-1.0, 4.2, 0]} intensity={3.8} distance={30} color="#FEF3C7" castShadow />
          )}
        </group>
      )}

      {/* Right Platform */}
      {isRight && (
        <group position={[2.8, 0, 0]}>
          {/* Concrete Platform Deck */}
          <mesh position={[1.0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.78, 72]} />
            <meshStandardMaterial color="#F1F5F9" roughness={0.7} />
          </mesh>

          {/* Tactile Warning Strip */}
          <mesh position={[-0.5, 0.78, 0]}>
            <boxGeometry args={[0.24, 0.02, 72]} />
            <meshStandardMaterial color="#FACC15" roughness={0.35} />
          </mesh>

          {/* Modern Curved Canopy */}
          <group position={[1.0, 0, 0]}>
            <CurvedModernCanopy length={58} />

            {/* Platform Number 2 Sign */}
            <group position={[-0.2, 3.8, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.48, 0.48]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
              <Text position={[-0.04, 0, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.32} color="#DC2626">
                2
              </Text>
            </group>
          </group>

          {/* Station Board (Facing track) */}
          <group position={[1.4, 2.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.08, 1.3, 4.6]} />
              <meshStandardMaterial color="#FEF08A" roughness={0.3} />
            </mesh>
            <Text
              position={[0.05, 0.24, 0]}
              rotation={[0, Math.PI / 2, 0]}
              fontSize={0.34}
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

          <PlatformBench position={[1.2, 0.78, -12]} rotationY={Math.PI} />
          <PlatformBench position={[1.2, 0.78, 12]} rotationY={Math.PI} />

          {/* Waiting Passengers */}
          <Passenger3D position={[0.3, 0.78, -5]} color="#9333EA" />
          <Passenger3D position={[0.6, 0.78, 9]} color="#0D9488" />

          {/* Platform Night Lighting */}
          {isNight && (
            <pointLight position={[1.0, 4.2, 0]} intensity={3.8} distance={30} color="#FEF3C7" castShadow />
          )}
        </group>
      )}
    </group>
  );
}
