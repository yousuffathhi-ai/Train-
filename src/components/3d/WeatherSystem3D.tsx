import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { WeatherType } from '../../types';

interface WeatherSystem3DProps {
  weather: WeatherType;
  trainZ: number;
}

export function WeatherSystem3D({ weather, trainZ }: WeatherSystem3DProps) {
  const rainRef = useRef<THREE.Points>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const flashTimer = useRef(0);

  // Generate rain droplets
  const [rainPositions, rainCount] = useMemo(() => {
    const count = weather === 'storm' ? 2400 : weather === 'rain' ? 1200 : 0;
    if (count === 0) return [new Float32Array(0), 0];

    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60; // X spread
      pos[i * 3 + 1] = Math.random() * 25; // Y height
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80; // Z spread
    }
    return [pos, count];
  }, [weather]);

  useFrame((state, delta) => {
    // Animate falling rain
    if (rainRef.current && (weather === 'rain' || weather === 'storm')) {
      rainRef.current.position.z = trainZ;
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * 35; // Fall speed
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 25;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Lightning flashes during storm
    if (lightningLightRef.current && weather === 'storm') {
      flashTimer.current -= delta;
      if (flashTimer.current <= 0) {
        // Flash light with random burst
        lightningLightRef.current.intensity = Math.random() > 0.4 ? 12 : 0;
        flashTimer.current = Math.random() * 6 + 2; // Next flash in 2-8s
        setTimeout(() => {
          if (lightningLightRef.current) lightningLightRef.current.intensity = 0;
        }, 120);
      }
    }
  });

  // Lighting & Sun configuration
  let sunPosition: [number, number, number] = [100, 45, 100];
  let ambientIntensity = 0.8;
  let dirIntensity = 1.3;
  let lightColor = "#FFFFFF";
  let skyTurbidity = 8;
  let skyRayleigh = 2;

  if (weather === 'golden_hour') {
    sunPosition = [100, 6, 80];
    ambientIntensity = 0.6;
    dirIntensity = 1.6;
    lightColor = "#FED7AA"; // Warm sunset orange
    skyTurbidity = 10;
    skyRayleigh = 4;
  } else if (weather === 'night') {
    sunPosition = [-100, -20, -100];
    ambientIntensity = 0.15;
    dirIntensity = 0.3;
    lightColor = "#38BDF8"; // Moonlit blue
    skyTurbidity = 20;
    skyRayleigh = 0.5;
  } else if (weather === 'foggy') {
    sunPosition = [80, 20, 50];
    ambientIntensity = 0.7;
    dirIntensity = 0.5;
    lightColor = "#E2E8F0";
    skyTurbidity = 25;
    skyRayleigh = 8;
  } else if (weather === 'rain' || weather === 'storm') {
    sunPosition = [50, 25, 50];
    ambientIntensity = 0.4;
    dirIntensity = 0.4;
    lightColor = "#94A3B8";
    skyTurbidity = 30;
    skyRayleigh = 5;
  }

  return (
    <>
      {/* Skybox */}
      <Sky
        sunPosition={sunPosition}
        turbidity={skyTurbidity}
        rayleigh={skyRayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {/* Stars in Night Mode */}
      {weather === 'night' && (
        <Stars radius={120} depth={50} count={3500} factor={4} saturation={0} fade speed={1} />
      )}

      {/* Ambient and Main Sunlight */}
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <directionalLight
        position={[sunPosition[0] * 0.5, 40, sunPosition[2] * 0.5]}
        intensity={dirIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Lightning Point Light */}
      {weather === 'storm' && (
        <pointLight
          ref={lightningLightRef}
          position={[0, 40, trainZ - 40]}
          color="#E0F2FE"
          intensity={0}
          distance={300}
        />
      )}

      {/* Rain Particle System */}
      {(weather === 'rain' || weather === 'storm') && rainCount > 0 && (
        <points ref={rainRef} position={[0, 0, trainZ]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.18}
            color="#93C5FD"
            transparent
            opacity={0.7}
          />
        </points>
      )}
    </>
  );
}
