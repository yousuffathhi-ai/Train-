import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WeatherType } from '../../types';

interface OceanWaterProps {
  weather: WeatherType;
  trainZ: number;
}

// Procedural high-resolution ocean wave normal map generator
function createOceanNormalMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        // Multi-frequency wave synthesis
        const nx = x / 512;
        const ny = y / 512;

        const wave1 = Math.sin(nx * Math.PI * 16 + ny * Math.PI * 8);
        const wave2 = Math.cos(nx * Math.PI * 32 - ny * Math.PI * 18);
        const wave3 = Math.sin((nx + ny) * Math.PI * 48);
        const wave4 = Math.cos(nx * Math.PI * 64 + ny * Math.PI * 32) * 0.5;

        const totalWave = (wave1 + wave2 * 0.6 + wave3 * 0.4 + wave4 * 0.2) / 2.2;

        // Normal map vectors: R = X slope, G = Y slope, B = Height (Z up)
        const dx = Math.sin(nx * Math.PI * 16) * 45;
        const dy = Math.cos(ny * Math.PI * 16) * 45;

        const r = Math.floor(THREE.MathUtils.clamp(128 + dx + totalWave * 20, 0, 255));
        const g = Math.floor(THREE.MathUtils.clamp(128 + dy + totalWave * 20, 0, 255));
        const b = Math.floor(THREE.MathUtils.clamp(230 + totalWave * 25, 180, 255));

        const idx = (y * 512 + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 60);
  return texture;
}

export function OceanWater({ weather, trainZ }: OceanWaterProps) {
  const deepOceanRef = useRef<THREE.Mesh>(null);
  const coastalSurfRef = useRef<THREE.Mesh>(null);
  const foamWaveRef = useRef<THREE.Mesh>(null);
  const normalMapRef = useRef<THREE.CanvasTexture | null>(null);

  // Generate or memoize the dynamic wave normal map
  const oceanNormalMap = useMemo(() => {
    const map = createOceanNormalMap();
    normalMapRef.current = map;
    return map;
  }, []);

  // Weather-responsive water characteristics
  const waterConfig = useMemo(() => {
    switch (weather) {
      case 'golden_hour':
        return {
          deepColor: '#9A3412',
          surfColor: '#C2410C',
          foamColor: '#FEF3C7',
          roughness: 0.08,
          metalness: 0.25,
          transmission: 0.72,
          reflectivity: 0.95,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.8
        };
      case 'night':
        return {
          deepColor: '#021526',
          surfColor: '#072540',
          foamColor: '#64748B',
          roughness: 0.05,
          metalness: 0.35,
          transmission: 0.5,
          reflectivity: 0.9,
          clearcoat: 0.9,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.2
        };
      case 'rain':
      case 'storm':
        return {
          deepColor: '#1E293B',
          surfColor: '#334155',
          foamColor: '#E2E8F0',
          roughness: 0.22,
          metalness: 0.15,
          transmission: 0.6,
          reflectivity: 0.8,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
          envMapIntensity: 0.9
        };
      case 'foggy':
        return {
          deepColor: '#0E7490',
          surfColor: '#06B6D4',
          foamColor: '#CFFAFE',
          roughness: 0.15,
          metalness: 0.1,
          transmission: 0.75,
          reflectivity: 0.85,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.1
        };
      case 'sunny':
      default:
        return {
          deepColor: '#004B7A', // Deep Indian Ocean sapphire
          surfColor: '#0284C7', // Crystal coastal turquoise
          foamColor: '#F8FAFC',
          roughness: 0.06,
          metalness: 0.12,
          transmission: 0.82,
          reflectivity: 0.92,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          envMapIntensity: 1.6
        };
    }
  }, [weather]);

  // Animate wave normal map offset & swell in real-time
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Scroll normal map texture to simulate incoming ocean swells
    if (normalMapRef.current) {
      normalMapRef.current.offset.x = (time * 0.018) % 1;
      normalMapRef.current.offset.y = (time * 0.045) % 1;
    }

    // Swell elevation synced with train positioning
    if (deepOceanRef.current) {
      deepOceanRef.current.position.z = trainZ;
      deepOceanRef.current.position.y = -0.56 + Math.sin(time * 1.2) * 0.05;
    }

    if (coastalSurfRef.current) {
      coastalSurfRef.current.position.z = trainZ;
      coastalSurfRef.current.position.y = -0.50 + Math.sin(time * 1.5 + 0.3) * 0.04;
    }

    // Dynamic rhythmic shoreline breaker wave
    if (foamWaveRef.current) {
      foamWaveRef.current.position.z = trainZ;
      const waveCycle = (Math.sin(time * 1.7) + 1) * 0.5; // 0 to 1
      foamWaveRef.current.position.x = 20.5 + waveCycle * 1.6;
      foamWaveRef.current.position.y = -0.46 + Math.sin(time * 1.9) * 0.03;
    }
  });

  return (
    <group>
      {/* 1. Deep Indian Ocean using MeshPhysicalMaterial with dynamic normal maps & transmission */}
      <mesh
        ref={deepOceanRef}
        position={[85, -0.56, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[110, 1000, 48, 48]} />
        <meshPhysicalMaterial
          color={waterConfig.deepColor}
          roughness={waterConfig.roughness}
          metalness={waterConfig.metalness}
          transmission={waterConfig.transmission}
          ior={1.333}
          reflectivity={waterConfig.reflectivity}
          clearcoat={waterConfig.clearcoat}
          clearcoatRoughness={waterConfig.clearcoatRoughness}
          envMapIntensity={waterConfig.envMapIntensity}
          normalMap={oceanNormalMap}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* 2. Coastal Surf & Lagoon Shallows (MeshPhysicalMaterial with high transmission) */}
      <mesh
        ref={coastalSurfRef}
        position={[36, -0.50, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[32, 1000, 32, 32]} />
        <meshPhysicalMaterial
          color={waterConfig.surfColor}
          roughness={waterConfig.roughness * 1.1}
          metalness={waterConfig.metalness * 0.8}
          transmission={waterConfig.transmission}
          ior={1.333}
          reflectivity={waterConfig.reflectivity}
          clearcoat={waterConfig.clearcoat}
          clearcoatRoughness={waterConfig.clearcoatRoughness}
          envMapIntensity={waterConfig.envMapIntensity}
          normalMap={oceanNormalMap}
          normalScale={new THREE.Vector2(0.25, 0.25)}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 3. Rolling Shoreline Breaker Surf Foam */}
      <mesh
        ref={foamWaveRef}
        position={[21, -0.46, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[5.5, 1000, 16, 16]} />
        <meshStandardMaterial
          color={waterConfig.foamColor}
          roughness={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 4. Wet Sand Tide Line (Specular sheen along the beach margin) */}
      <mesh
        position={[19, -0.45, trainZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[3.5, 1000]} />
        <meshPhysicalMaterial
          color={weather === 'golden_hour' ? '#B45309' : '#CA8A04'}
          roughness={0.12}
          metalness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}
