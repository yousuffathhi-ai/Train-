import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { STATIONS_DATA } from '../../data/stations';

interface RailwayTrackProps {
  trainZ: number;
}

const MAX_NEAR_SLEEPERS = 180; // Detailed near sleepers with steel Pandrol clips
const MAX_FAR_SLEEPERS = 300;  // Medium LOD sleepers
const MAX_POLES = 30;

export function RailwayTrack({ trainZ }: RailwayTrackProps) {
  const currentChunk = Math.floor(-trainZ / 100);

  // Instanced mesh refs for high-performance LOD rendering
  const nearSleepersRef = useRef<THREE.InstancedMesh>(null);
  const leftClipsRef = useRef<THREE.InstancedMesh>(null);
  const rightClipsRef = useRef<THREE.InstancedMesh>(null);
  const farSleepersRef = useRef<THREE.InstancedMesh>(null);
  const polesRef = useRef<THREE.InstancedMesh>(null);
  const insulatorsRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update LOD instances around trainZ
  useEffect(() => {
    if (!nearSleepersRef.current || !leftClipsRef.current || !rightClipsRef.current || !farSleepersRef.current || !polesRef.current || !insulatorsRef.current) {
      return;
    }

    let nearCount = 0;
    let farCount = 0;

    // High detail range: -90m to +90m around train
    // Medium detail range: -240m to -90m and +90m to +240m
    const minZ = (currentChunk - 3) * 100;
    const maxZ = (currentChunk + 3) * 100;

    for (let z = minZ; z <= maxZ; z += 1.25) {
      const posZ = -z;
      const distToTrain = Math.abs(posZ - trainZ);

      if (distToTrain <= 110) {
        // High Detail LOD (with Pandrol clips)
        if (nearCount < MAX_NEAR_SLEEPERS) {
          dummy.position.set(0, -0.05, posZ);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          nearSleepersRef.current.setMatrixAt(nearCount, dummy.matrix);

          // Left rail clip
          dummy.position.set(-0.835, 0.065, posZ);
          dummy.updateMatrix();
          leftClipsRef.current.setMatrixAt(nearCount, dummy.matrix);

          // Right rail clip
          dummy.position.set(0.835, 0.065, posZ);
          dummy.updateMatrix();
          rightClipsRef.current.setMatrixAt(nearCount, dummy.matrix);

          nearCount++;
        }
      } else {
        // Medium Detail LOD (simplified sleeper slab, no clips)
        if (farCount < MAX_FAR_SLEEPERS) {
          dummy.position.set(0, -0.05, posZ);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          farSleepersRef.current.setMatrixAt(farCount, dummy.matrix);
          farCount++;
        }
      }
    }

    // Telegraph Poles LOD (Every 40m)
    let poleCount = 0;
    let insCount = 0;
    for (let z = minZ; z <= maxZ; z += 40) {
      if (poleCount >= MAX_POLES) break;
      const posZ = -z;

      dummy.position.set(-2.9, 2.5, posZ);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      polesRef.current.setMatrixAt(poleCount, dummy.matrix);
      poleCount++;

      // Ceramic insulators on crossarm
      for (const xOff of [-0.4, 0, 0.4]) {
        if (insCount < MAX_POLES * 3) {
          dummy.position.set(-2.6 + xOff, 4.8, posZ);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          insulatorsRef.current.setMatrixAt(insCount, dummy.matrix);
          insCount++;
        }
      }
    }

    // Hide remaining instances
    for (let i = nearCount; i < MAX_NEAR_SLEEPERS; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      nearSleepersRef.current.setMatrixAt(i, dummy.matrix);
      leftClipsRef.current.setMatrixAt(i, dummy.matrix);
      rightClipsRef.current.setMatrixAt(i, dummy.matrix);
    }
    for (let i = farCount; i < MAX_FAR_SLEEPERS; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      farSleepersRef.current.setMatrixAt(i, dummy.matrix);
    }
    for (let i = poleCount; i < MAX_POLES; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      polesRef.current.setMatrixAt(i, dummy.matrix);
    }
    for (let i = insCount; i < MAX_POLES * 3; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      insulatorsRef.current.setMatrixAt(i, dummy.matrix);
    }

    nearSleepersRef.current.instanceMatrix.needsUpdate = true;
    leftClipsRef.current.instanceMatrix.needsUpdate = true;
    rightClipsRef.current.instanceMatrix.needsUpdate = true;
    farSleepersRef.current.instanceMatrix.needsUpdate = true;
    polesRef.current.instanceMatrix.needsUpdate = true;
    insulatorsRef.current.instanceMatrix.needsUpdate = true;
  }, [currentChunk, trainZ, dummy]);

  // Stations with Lagoon bridges
  const bridgeStations = STATIONS_DATA.filter((s) => s.hasBridge);

  return (
    <group>
      {/* 1. Track Sub-Ballast (Deep Gravel Bed) - distinct elevation at y = -0.22 to eliminate z-fighting */}
      <mesh position={[0, -0.22, trainZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.6, 1000]} />
        <meshStandardMaterial color="#333130" roughness={0.92} />
      </mesh>

      {/* 2. Ballast Shoulder Slopes (Beveled side flanks) - distinct elevation at y = -0.28 */}
      <mesh position={[-2.45, -0.28, trainZ]} rotation={[-Math.PI / 2, 0.45, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1000]} />
        <meshStandardMaterial color="#292726" roughness={0.96} />
      </mesh>
      <mesh position={[2.45, -0.28, trainZ]} rotation={[-Math.PI / 2, -0.45, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1000]} />
        <meshStandardMaterial color="#292726" roughness={0.96} />
      </mesh>

      {/* 3. Rail Web & Base Tie Plates - elevation at y = 0.04 */}
      <mesh position={[-0.835, 0.04, trainZ]}>
        <boxGeometry args={[0.16, 0.03, 1000]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.5} />
      </mesh>
      <mesh position={[0.835, 0.04, trainZ]}>
        <boxGeometry args={[0.16, 0.03, 1000]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.5} />
      </mesh>

      {/* 4. Left Continuous Gleaming Steel Rail Head - elevation at y = 0.12 */}
      <mesh position={[-0.835, 0.12, trainZ]} castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.14, 1000]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* 5. Right Continuous Gleaming Steel Rail Head - elevation at y = 0.12 */}
      <mesh position={[0.835, 0.12, trainZ]} castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.14, 1000]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.12} />
      </mesh>

      {/* ============================================================ */}
      {/* 6. INSTANCED SLEEPERS & HARDWARE (LOD System)                */}
      {/* ============================================================ */}

      {/* High-LOD Near Sleepers (Concrete & Hardwood) */}
      <instancedMesh
        ref={nearSleepersRef}
        args={[undefined, undefined, MAX_NEAR_SLEEPERS]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.7, 0.14, 0.28]} />
        <meshStandardMaterial color="#64748B" roughness={0.85} metalness={0.1} />
      </instancedMesh>

      {/* Left Pandrol Rail Clips */}
      <instancedMesh
        ref={leftClipsRef}
        args={[undefined, undefined, MAX_NEAR_SLEEPERS]}
      >
        <boxGeometry args={[0.18, 0.035, 0.14]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.3} />
      </instancedMesh>

      {/* Right Pandrol Rail Clips */}
      <instancedMesh
        ref={rightClipsRef}
        args={[undefined, undefined, MAX_NEAR_SLEEPERS]}
      >
        <boxGeometry args={[0.18, 0.035, 0.14]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.3} />
      </instancedMesh>

      {/* Medium-LOD Far Sleepers (Simplified Geometry) */}
      <instancedMesh
        ref={farSleepersRef}
        args={[undefined, undefined, MAX_FAR_SLEEPERS]}
      >
        <boxGeometry args={[2.65, 0.12, 0.26]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </instancedMesh>

      {/* Instanced Telegraph Poles */}
      <instancedMesh
        ref={polesRef}
        args={[undefined, undefined, MAX_POLES]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.1, 5, 8]} />
        <meshStandardMaterial color="#64748B" roughness={0.6} />
      </instancedMesh>

      {/* Instanced Ceramic Insulators */}
      <instancedMesh
        ref={insulatorsRef}
        args={[undefined, undefined, MAX_POLES * 3]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
      </instancedMesh>

      {/* 7. Lagoon Causeway Bridges (Batticaloa, Kaluwanchikudy, Thirukkovil, Pottuvil) */}
      {bridgeStations.map((bStation) => {
        const bZ = -bStation.position;
        return (
          <group key={`bridge-${bStation.id}`} position={[0, 0, bZ]}>
            {/* Lagoon Water Channel Underneath */}
            <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[160, 140]} />
              <meshStandardMaterial color="#0284C7" roughness={0.1} transparent opacity={0.92} />
            </mesh>

            {/* Concrete & Stone Viaduct Deck Structure */}
            <mesh position={[0, -0.55, 0]} castShadow receiveShadow>
              <boxGeometry args={[5.2, 0.85, 120]} />
              <meshStandardMaterial color="#475569" roughness={0.7} />
            </mesh>

            {/* Coastal Steel Safety Railings (Sri Lankan SLR Blue) */}
            <mesh position={[-2.4, 0.45, 0]}>
              <boxGeometry args={[0.1, 0.9, 120]} />
              <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[2.4, 0.45, 0]}>
              <boxGeometry args={[0.1, 0.9, 120]} />
              <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Massive Stone Piers */}
            {[-50, -25, 0, 25, 50].map((pierZ, pIdx) => (
              <mesh key={pIdx} position={[0, -2.4, pierZ]} castShadow>
                <cylinderGeometry args={[1.8, 2.4, 4.8, 12]} />
                <meshStandardMaterial color="#334155" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
