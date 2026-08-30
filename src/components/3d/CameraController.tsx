import React, { useRef, useEffect } from 'react';
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

  // Smooth sway & vibration for cab views based on speed
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedFactor = Math.min(speedKmh / 100, 1.2);
    const cabRumbleY = Math.sin(time * 24) * 0.003 * speedFactor;
    const cabSwayX = Math.sin(time * 3.5) * 0.008 * speedFactor;

    if (cameraMode === 'cab360') {
      // 360° Free Look inside the cockpit (centered around driver's head)
      const driverHeadPos = new THREE.Vector3(0.48 + cabSwayX, 1.85 + cabRumbleY, trainZ - 2.2);

      if (controlsRef.current) {
        // Keep OrbitControls centered exactly at the driver head
        controlsRef.current.target.copy(driverHeadPos);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'driver' || cameraMode === 'cab') {
      // Driver Eye View: Locked looking forward through front windscreen
      const desiredPos = new THREE.Vector3(0.48 + cabSwayX, 1.85 + cabRumbleY, trainZ - 2.2);
      const desiredLook = new THREE.Vector3(0.48, 1.75, trainZ - 50);

      camera.position.lerp(desiredPos, delta * 18);
      camera.lookAt(desiredLook);

      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredLook);
      }
    } else if (cameraMode === 'chase') {
      // Third-person chase camera behind and above the train
      const desiredPos = new THREE.Vector3(0, 5.2, trainZ + 18);
      const desiredLook = new THREE.Vector3(0, 2.0, trainZ - 6);

      camera.position.lerp(desiredPos, delta * 8);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredLook, delta * 10);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'coastal') {
      // Coastal scenic camera looking from beach/ocean back at train
      const desiredPos = new THREE.Vector3(22, 3.8, trainZ - 12);
      const desiredLook = new THREE.Vector3(0, 1.8, trainZ - 2);

      camera.position.lerp(desiredPos, delta * 6);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredLook, delta * 8);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'drone') {
      // High aerial drone view
      const desiredPos = new THREE.Vector3(-18, 25, trainZ + 28);
      const desiredLook = new THREE.Vector3(0, 1.5, trainZ - 10);

      camera.position.lerp(desiredPos, delta * 5);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(desiredLook, delta * 8);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'passenger') {
      // Inside passenger coach looking out right towards Indian ocean
      const desiredPos = new THREE.Vector3(1.15, 2.0, trainZ + 14);
      const desiredLook = new THREE.Vector3(30, 1.0, trainZ + 10);

      camera.position.lerp(desiredPos, delta * 15);
      camera.lookAt(desiredLook);
    } else if (cameraMode === 'passby') {
      // Trackside pass-by camera
      const desiredPos = new THREE.Vector3(-4.8, 1.5, trainZ - 40);
      const desiredLook = new THREE.Vector3(0, 1.8, trainZ);

      camera.position.lerp(desiredPos, delta * 4);
      camera.lookAt(desiredLook);
    }
  });

  // When switching into cab360, set initial camera orientation facing front windshield
  useEffect(() => {
    if (cameraMode === 'cab360') {
      camera.position.set(0.48, 1.85, trainZ - 2.19);
      if (controlsRef.current) {
        controlsRef.current.target.set(0.48, 1.85, trainZ - 2.2);
        controlsRef.current.update();
      }
    }
  }, [cameraMode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={cameraMode === 'chase' || cameraMode === 'coastal' || cameraMode === 'drone'}
      enableRotate={cameraMode === 'cab360' || cameraMode === 'chase' || cameraMode === 'coastal' || cameraMode === 'drone'}
      maxPolarAngle={cameraMode === 'cab360' ? Math.PI - 0.1 : Math.PI / 2 - 0.03}
      minPolarAngle={cameraMode === 'cab360' ? 0.1 : 0.2}
      minDistance={cameraMode === 'cab360' ? 0.01 : 4}
      maxDistance={cameraMode === 'cab360' ? 0.05 : 60}
      rotateSpeed={cameraMode === 'cab360' ? -0.8 : 0.8}
    />
  );
}
