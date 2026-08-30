import React from 'react';
import { SignalAspect } from '../../types';

interface Signaling3DProps {
  positionZ: number;
  aspect: SignalAspect;
}

export function Signaling3D({ positionZ, aspect }: Signaling3DProps) {
  // Determine which lamps are illuminated
  const isRed = aspect === 'red';
  const isYellow = aspect === 'yellow';
  const isDoubleYellow = aspect === 'double_yellow';
  const isGreen = aspect === 'green';

  return (
    <group position={[2.2, 0, positionZ]}>
      {/* Signal Post Mast (Steel Lattice/Tubular Mast) */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 6.4, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      {/* Signal Head Target Shield (Black Backplate) */}
      <mesh position={[-0.3, 5.2, 0]} castShadow>
        <boxGeometry args={[0.65, 1.8, 0.15]} />
        <meshStandardMaterial color="#0B0D0E" roughness={0.9} />
      </mesh>

      {/* Visor Hoods */}
      {[-0.6, -0.2, 0.2, 0.6].map((yOff, idx) => (
        <mesh key={idx} position={[-0.3, 5.2 + yOff, -0.15]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.12, 8, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#0B0D0E" side={2} />
        </mesh>
      ))}

      {/* 1. Green Aspect Lamp (Top) */}
      <mesh position={[-0.3, 5.8, -0.1]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isGreen ? "#10B981" : "#064E3B"}
          emissive={isGreen ? "#10B981" : "#000000"}
          emissiveIntensity={isGreen ? 2.5 : 0}
        />
      </mesh>
      {isGreen && <pointLight position={[-0.3, 5.8, -0.3]} color="#10B981" intensity={3} distance={15} />}

      {/* 2. Yellow Aspect Lamp */}
      <mesh position={[-0.3, 5.4, -0.1]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isYellow || isDoubleYellow ? "#F59E0B" : "#78350F"}
          emissive={isYellow || isDoubleYellow ? "#F59E0B" : "#000000"}
          emissiveIntensity={isYellow || isDoubleYellow ? 2.5 : 0}
        />
      </mesh>
      {(isYellow || isDoubleYellow) && <pointLight position={[-0.3, 5.4, -0.3]} color="#F59E0B" intensity={3} distance={15} />}

      {/* 3. Second Yellow Aspect Lamp */}
      <mesh position={[-0.3, 5.0, -0.1]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isDoubleYellow ? "#F59E0B" : "#78350F"}
          emissive={isDoubleYellow ? "#F59E0B" : "#000000"}
          emissiveIntensity={isDoubleYellow ? 2.5 : 0}
        />
      </mesh>

      {/* 4. Red Aspect Lamp (Bottom) */}
      <mesh position={[-0.3, 4.6, -0.1]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={isRed ? "#EF4444" : "#7F1D1D"}
          emissive={isRed ? "#EF4444" : "#000000"}
          emissiveIntensity={isRed ? 3.0 : 0}
        />
      </mesh>
      {isRed && <pointLight position={[-0.3, 4.6, -0.3]} color="#EF4444" intensity={3.5} distance={18} />}

      {/* Trackside AWS Inductor Magnet (Sitting in middle of 4-foot track) */}
      <group position={[-2.2, 0.05, 30]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.12, 1.2]} />
          <meshStandardMaterial color="#FACC15" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Guard Ramp */}
        <mesh position={[0, -0.02, 0.8]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
