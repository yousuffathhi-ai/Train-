import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { WeatherType } from '../../types';

interface CoastalLandscapeProps {
  trainZ: number;
  weather: WeatherType;
}

// 🌴 Kallady / Karaitivu Beach Crescent & Star Monument Landmark (from Reference Images)
function EasternBeachMonument({ positionZ }: { positionZ: number }) {
  return (
    <group position={[18, -0.4, positionZ]} rotation={[0, -Math.PI / 4, 0]}>
      {/* Stepped Pedestal Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 3.2, 0.3, 24]} />
        <meshStandardMaterial color="#0284C7" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.25, 24]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* Flared Support Column with Sunburst Motif */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.8, 2.2, 16]} />
        <meshStandardMaterial color="#38BDF8" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Sunburst Fin Rays radiating outward */}
      {[...Array(12)].map((_, i) => (
        <mesh
          key={i}
          position={[0, 1.8, 0]}
          rotation={[0, 0, (i * Math.PI) / 6]}
        >
          <boxGeometry args={[0.06, 2.0, 0.08]} />
          <meshStandardMaterial color="#FACC15" roughness={0.2} emissive="#FACC15" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Giant Curved Crescent Moon (Blue/Gold) */}
      <group position={[0, 3.4, 0]}>
        <mesh castShadow>
          <torusGeometry args={[1.5, 0.22, 16, 32, Math.PI * 1.3]} />
          <meshStandardMaterial color="#0284C7" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Central 5-Pointed Golden Star */}
        <group position={[0, 0.2, 0]}>
          <mesh castShadow>
            <octahedronGeometry args={[0.85, 0]} />
            <meshStandardMaterial
              color="#FBBF24"
              metalness={0.9}
              roughness={0.1}
              emissive="#FBBF24"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>

      {/* Night Illuminating Spotlight */}
      <pointLight position={[0, 4, 1.5]} intensity={4} distance={20} color="#FACC15" />
    </group>
  );
}

// 🕌 Eastern Coastal Mosque Landmark (Octagonal Dome & Minaret from Reference Image 2)
function EasternCoastalMosque({ positionZ }: { positionZ: number }) {
  return (
    <group position={[-28, -0.3, positionZ]}>
      {/* Mosque Main Compound Plinth */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 0.6, 16]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.8} />
      </mesh>

      {/* Octagonal Main Prayer Hall (Blue Tile Facade) */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5.2, 5.8, 5.2, 8]} />
        <meshStandardMaterial color="#0284C7" roughness={0.4} />
      </mesh>

      {/* Upper Octagonal Drum with Arched Windows */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <cylinderGeometry args={[4.2, 4.2, 1.8, 8]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Magnificent Golden Dome */}
      <mesh position={[0, 8.2, 0]} castShadow>
        <sphereGeometry args={[4.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.9}
          roughness={0.1}
          emissive="#D97706"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Dome Golden Crescent Spire */}
      <mesh position={[0, 12.8, 0]}>
        <cylinderGeometry args={[0.06, 0.12, 1.8, 8]} />
        <meshStandardMaterial color="#FACC15" metalness={0.9} />
      </mesh>

      {/* Lofty Coastal Minaret Tower */}
      <group position={[7, 0, 7]}>
        <mesh position={[0, 8, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.6, 16, 8]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Minaret Balcony */}
        <mesh position={[0, 15.5, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.6, 12]} />
          <meshStandardMaterial color="#0284C7" />
        </mesh>
        {/* Minaret Golden Cupola */}
        <mesh position={[0, 17.5, 0]}>
          <coneGeometry args={[1.3, 3, 12]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Mosque Night Illumination */}
      <pointLight position={[0, 9, 0]} intensity={5} distance={35} color="#FEF08A" />
    </group>
  );
}

const MAX_PALMS = 400;
const MAX_SHRUBS = 600;
const MAX_BOULDERS = 300;

export function CoastalLandscape({ trainZ, weather }: CoastalLandscapeProps) {
  const currentChunk = Math.floor(-trainZ / 150);

  // Dynamic colors based on time of day
  const sandColor = weather === 'golden_hour' ? '#D97706' : '#FBBF24';
  const grassColor = weather === 'rain' || weather === 'storm' ? '#14532D' : '#15803D';

  // Refs for InstancedMeshes
  const palmTrunksMeshRef = useRef<THREE.InstancedMesh>(null);
  const palmCrownsMeshRef = useRef<THREE.InstancedMesh>(null);
  const coastalShrubsMeshRef = useRef<THREE.InstancedMesh>(null);
  const seaWallMeshRef = useRef<THREE.InstancedMesh>(null);

  // Shared reusable dummy for matrix calculation
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Compute Palm Trees & Shrubs positions dynamically around trainZ
  useEffect(() => {
    if (!palmTrunksMeshRef.current || !palmCrownsMeshRef.current || !coastalShrubsMeshRef.current || !seaWallMeshRef.current) {
      return;
    }

    let palmCount = 0;
    let shrubCount = 0;

    // Generate palms & shrubs around current chunk (-4 to +4 chunks)
    for (let c = -4; c <= 4; c++) {
      const baseZ = (currentChunk + c) * 150;

      // Beach Palms (Right side)
      for (let j = 0; j < 14; j++) {
        if (palmCount >= MAX_PALMS) break;
        const rand = Math.sin(baseZ + j * 43.7) * 10000;
        const frac = rand - Math.floor(rand);
        const posX = 9.5 + frac * 8.5; // On the golden beach berm
        const posZ = -(baseZ + j * 10 + frac * 7);
        const scale = 0.85 + frac * 0.45;
        const rotY = frac * Math.PI * 2;

        // Trunk matrix
        dummy.position.set(posX, -0.4 + 2.4 * scale, posZ);
        dummy.rotation.set(0.08, rotY, 0.05);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        palmTrunksMeshRef.current.setMatrixAt(palmCount, dummy.matrix);

        // Crown matrix (positioned at top of trunk)
        dummy.position.set(posX + 0.2 * scale, -0.4 + 4.9 * scale, posZ + 0.15 * scale);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(scale * 1.1, scale * 1.1, scale * 1.1);
        dummy.updateMatrix();
        palmCrownsMeshRef.current.setMatrixAt(palmCount, dummy.matrix);

        palmCount++;
      }

      // Inland Coconut Groves (Left side)
      for (let j = 0; j < 22; j++) {
        if (palmCount >= MAX_PALMS) break;
        const rand = Math.sin(baseZ + j * 79.1) * 10000;
        const frac = rand - Math.floor(rand);
        const posX = -(8.5 + frac * 32);
        const posZ = -(baseZ + j * 6.5 + frac * 6);
        const scale = 0.9 + frac * 0.5;
        const rotY = frac * Math.PI * 2;

        // Trunk
        dummy.position.set(posX, -0.3 + 2.5 * scale, posZ);
        dummy.rotation.set(0.06, rotY, 0.04);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        palmTrunksMeshRef.current.setMatrixAt(palmCount, dummy.matrix);

        // Crown
        dummy.position.set(posX + 0.18 * scale, -0.3 + 5.1 * scale, posZ + 0.12 * scale);
        dummy.rotation.set(0, rotY, 0);
        dummy.scale.set(scale * 1.15, scale * 1.15, scale * 1.15);
        dummy.updateMatrix();
        palmCrownsMeshRef.current.setMatrixAt(palmCount, dummy.matrix);

        palmCount++;
      }

      // Coastal Shrubs and Tropical Undergrowth
      for (let j = 0; j < 35; j++) {
        if (shrubCount >= MAX_SHRUBS) break;
        const rand = Math.sin(baseZ + j * 93.3) * 10000;
        const frac = rand - Math.floor(rand);
        const isLeft = (j % 2 === 0);
        const posX = isLeft ? -(5.5 + frac * 28) : (6.5 + frac * 8);
        const posZ = -(baseZ + j * 4.2 + frac * 3.5);
        const scale = 0.6 + frac * 0.7;

        dummy.position.set(posX, -0.3 + 0.3 * scale, posZ);
        dummy.rotation.set(frac * 0.2, frac * Math.PI * 2, frac * 0.2);
        dummy.scale.set(scale * 1.3, scale * 0.8, scale * 1.3);
        dummy.updateMatrix();
        coastalShrubsMeshRef.current.setMatrixAt(shrubCount, dummy.matrix);

        shrubCount++;
      }
    }

    // Granite Riprap Sea Wall Boulders (Instanced)
    let boulderCount = 0;
    for (let z = -300; z <= 300; z += 2.5) {
      if (boulderCount >= MAX_BOULDERS) break;
      const actualZ = trainZ + z;
      const rand = Math.sin(actualZ * 17.3) * 1000;
      const frac = rand - Math.floor(rand);
      const posX = 7.2 + (frac - 0.5) * 0.9;
      const scale = 0.75 + frac * 0.55;

      dummy.position.set(posX, -0.22, actualZ);
      dummy.rotation.set(frac * Math.PI, frac * Math.PI * 2, frac * Math.PI);
      dummy.scale.set(scale, scale * 0.85, scale);
      dummy.updateMatrix();
      seaWallMeshRef.current.setMatrixAt(boulderCount, dummy.matrix);
      boulderCount++;
    }

    // Hide any unused instance slots
    for (let i = palmCount; i < MAX_PALMS; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      palmTrunksMeshRef.current.setMatrixAt(i, dummy.matrix);
      palmCrownsMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    for (let i = shrubCount; i < MAX_SHRUBS; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      coastalShrubsMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    for (let i = boulderCount; i < MAX_BOULDERS; i++) {
      dummy.position.set(0, -9999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      seaWallMeshRef.current.setMatrixAt(i, dummy.matrix);
    }

    palmTrunksMeshRef.current.instanceMatrix.needsUpdate = true;
    palmCrownsMeshRef.current.instanceMatrix.needsUpdate = true;
    coastalShrubsMeshRef.current.instanceMatrix.needsUpdate = true;
    seaWallMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [currentChunk, trainZ, dummy]);

  // Streetlights along the highway
  const streetlights = useMemo(() => {
    const list: number[] = [];
    for (let c = -2; c <= 2; c++) {
      const baseZ = (currentChunk + c) * 150;
      for (let j = 0; j < 5; j++) {
        list.push(-(baseZ + j * 30));
      }
    }
    return list;
  }, [currentChunk]);

  return (
    <group>
      {/* 1. Golden Sandy Beach (Right side berm) */}
      <mesh position={[14, -0.44, trainZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 1000]} />
        <meshStandardMaterial color={sandColor} roughness={0.95} />
      </mesh>

      {/* 2. Trackside Embankment Berm (Right) */}
      <mesh position={[4.5, -0.32, trainZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 1000]} />
        <meshStandardMaterial color="#A16207" roughness={0.9} />
      </mesh>

      {/* 3. Inland Green Coastal Landscape (Left side coconut estates) */}
      <mesh position={[-32, -0.3, trainZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[58, 1000]} />
        <meshStandardMaterial color={grassColor} roughness={0.88} />
      </mesh>

      {/* 4. A4 Coastal Highway (Batticaloa - Pottuvil Main Road) */}
      <mesh position={[-16, -0.27, trainZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 1000]} />
        <meshStandardMaterial color="#1E2022" roughness={0.7} />
      </mesh>

      {/* Highway Center & Shoulder Lines with proper height offset to prevent z-fighting */}
      <mesh position={[-16, -0.262, trainZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.22, 1000]} />
        <meshStandardMaterial color="#FACC15" roughness={0.5} />
      </mesh>
      <mesh position={[-19.2, -0.262, trainZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 1000]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      <mesh position={[-12.8, -0.262, trainZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 1000]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* 5. Streetlights along A4 Highway */}
      {streetlights.map((zPos, idx) => (
        <group key={`streetlight-${idx}`} position={[-12.2, -0.27, zPos]}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 6, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[-0.6, 5.9, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {weather === 'night' && (
            <pointLight position={[-1.2, 5.6, 0]} intensity={2.5} distance={18} color="#FEF3C7" />
          )}
        </group>
      ))}

      {/* ============================================================ */}
      {/* 6. INSTANCED MESHES: PALMS, CROWNS, SHRUBS & BOULDERS        */}
      {/* ============================================================ */}

      {/* Instanced Palm Trunks */}
      <instancedMesh
        ref={palmTrunksMeshRef}
        args={[undefined, undefined, MAX_PALMS]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.18, 0.35, 5.0, 8]} />
        <meshStandardMaterial color="#78350F" roughness={0.9} />
      </instancedMesh>

      {/* Instanced Palm Frond Leaf Crowns */}
      <instancedMesh
        ref={palmCrownsMeshRef}
        args={[undefined, undefined, MAX_PALMS]}
        castShadow
      >
        <coneGeometry args={[2.8, 1.2, 7]} />
        <meshStandardMaterial color="#15803D" roughness={0.65} />
      </instancedMesh>

      {/* Instanced Coastal Shrubs & Undergrowth */}
      <instancedMesh
        ref={coastalShrubsMeshRef}
        args={[undefined, undefined, MAX_SHRUBS]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </instancedMesh>

      {/* Instanced Riprap Sea Wall Granite Boulders */}
      <instancedMesh
        ref={seaWallMeshRef}
        args={[undefined, undefined, MAX_BOULDERS]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#475569" roughness={0.92} />
      </instancedMesh>

      {/* 7. Iconic Eastern Landmarks */}
      <EasternBeachMonument positionZ={-2500} />
      <EasternBeachMonument positionZ={-42000} />
      <EasternBeachMonument positionZ={-92000} />

      <EasternCoastalMosque positionZ={-6500} />
      <EasternCoastalMosque positionZ={-38000} />
      <EasternCoastalMosque positionZ={-72000} />
    </group>
  );
}
