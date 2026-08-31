import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CameraViewMode } from '../../types';

interface CameraControllerProps {
  cameraMode: CameraViewMode;
  trainZ: number;
  speedKmh: number;
}

export function CameraController({ cameraMode, trainZ, speedKmh }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Passenger coach aisle walk offset (allows walking forward/back in coach aisle: -4.5m to +4.5m)
  const [passengerAisleZ, setPassengerAisleZ] = useState(0);

  // Temporary vectors to avoid garbage collection overhead
  const tempPos = useRef(new THREE.Vector3());
  const tempLook = useRef(new THREE.Vector3());

  // Keyboard navigation for Passenger Aisle Walk-Through (W / S / Up / Down)
  useEffect(() => {
    if (cameraMode !== 'passenger') return;

    const handleAisleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        setPassengerAisleZ((prev) => Math.max(-4.5, prev - 0.4));
      } else if (key === 'arrowdown' || key === 's') {
        setPassengerAisleZ((prev) => Math.min(4.5, prev + 0.4));
      }
    };

    window.addEventListener('keydown', handleAisleKey);
    return () => window.removeEventListener('keydown', handleAisleKey);
  }, [cameraMode]);

  // Smooth sway & vibration for cab and passenger views based on speed
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedFactor = Math.min(speedKmh / 100, 1.2);
    const cabRumbleY = Math.sin(time * 24) * 0.002 * speedFactor;
    const cabSwayX = Math.sin(time * 3.5) * 0.005 * speedFactor;

    if (cameraMode === 'cab360') {
      // 360° Free Look inside the cockpit (centered around driver's eye position)
      const driverHeadX = 0.48 + cabSwayX;
      const driverHeadY = 1.85 + cabRumbleY;
      const driverHeadZ = trainZ - 2.2;

      if (controlsRef.current) {
        controlsRef.current.target.set(driverHeadX, driverHeadY, driverHeadZ);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'driver' || cameraMode === 'cab') {
      // Driver Eye View: Locked looking forward through front windscreen
      tempPos.current.set(0.48 + cabSwayX, 1.85 + cabRumbleY, trainZ - 2.2);
      tempLook.current.set(0.48, 1.75, trainZ - 60);

      camera.position.lerp(tempPos.current, Math.min(1.0, delta * 20));
      camera.lookAt(tempLook.current);

      if (controlsRef.current) {
        controlsRef.current.target.copy(tempLook.current);
      }
    } else if (cameraMode === 'passenger') {
      // Romanian Passenger Coach Interior View (Aisle Walk-through & 360° Window View)
      const passengerX = 0.0 + cabSwayX * 0.5; // Center aisle
      const passengerY = 1.88 + cabRumbleY * 0.6; // Standing / walking eye-level
      const passengerZ = trainZ + 12.8 + passengerAisleZ; // Inside Coach #1

      if (controlsRef.current) {
        controlsRef.current.target.set(passengerX, passengerY, passengerZ);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'chase') {
      // Third-person chase camera behind and above the train
      tempPos.current.set(0, 5.2, trainZ + 18);
      tempLook.current.set(0, 2.0, trainZ - 6);

      camera.position.lerp(tempPos.current, Math.min(1.0, delta * 8));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(tempLook.current, Math.min(1.0, delta * 10));
        controlsRef.current.update();
      }
    } else if (cameraMode === 'coastal') {
      // Coastal scenic camera looking from beach/ocean back at train
      tempPos.current.set(22, 3.8, trainZ - 12);
      tempLook.current.set(0, 1.8, trainZ - 2);

      camera.position.lerp(tempPos.current, Math.min(1.0, delta * 6));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(tempLook.current, Math.min(1.0, delta * 8));
        controlsRef.current.update();
      }
    } else if (cameraMode === 'drone') {
      // High aerial drone view
      tempPos.current.set(-18, 25, trainZ + 28);
      tempLook.current.set(0, 1.5, trainZ - 10);

      camera.position.lerp(tempPos.current, Math.min(1.0, delta * 5));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(tempLook.current, Math.min(1.0, delta * 8));
        controlsRef.current.update();
      }
    } else if (cameraMode === 'passby') {
      // Trackside pass-by camera
      tempPos.current.set(-4.8, 1.5, trainZ - 40);
      tempLook.current.set(0, 1.8, trainZ);

      camera.position.lerp(tempPos.current, Math.min(1.0, delta * 4));
      camera.lookAt(tempLook.current);
    }
  });

  // Reset camera positions on mode change
  useEffect(() => {
    if (cameraMode === 'cab360') {
      camera.position.set(0.48, 1.85, trainZ - 2.19);
      if (controlsRef.current) {
        controlsRef.current.target.set(0.48, 1.85, trainZ - 2.2);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'passenger') {
      camera.position.set(0.0, 1.88, trainZ + 12.8 + passengerAisleZ - 0.05);
      if (controlsRef.current) {
        controlsRef.current.target.set(0.0, 1.88, trainZ + 12.8 + passengerAisleZ);
        controlsRef.current.update();
      }
    }
  }, [cameraMode, camera, trainZ, passengerAisleZ]);

  const isOrbital = cameraMode === 'cab360' || cameraMode === 'passenger' || cameraMode === 'chase' || cameraMode === 'coastal' || cameraMode === 'drone';

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={cameraMode === 'chase' || cameraMode === 'coastal' || cameraMode === 'drone'}
      enableRotate={isOrbital}
      maxPolarAngle={cameraMode === 'cab360' || cameraMode === 'passenger' ? Math.PI - 0.1 : Math.PI / 2 - 0.03}
      minPolarAngle={cameraMode === 'cab360' || cameraMode === 'passenger' ? 0.1 : 0.2}
      minDistance={cameraMode === 'cab360' || cameraMode === 'passenger' ? 0.01 : 4}
      maxDistance={cameraMode === 'cab360' || cameraMode === 'passenger' ? 0.05 : 60}
      rotateSpeed={cameraMode === 'cab360' || cameraMode === 'passenger' ? -0.7 : 0.7}
      dampingFactor={0.08}
      enableDamping={true}
    />
  );
}
