'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * @fileOverview CandidateHologram - High-fidelity Particles-Only Hologram.
 * Restored version with stable face, volumetric hair, and blinking animation.
 */

export default function CandidateHologram({ 
  className,
  active = true,
  speaking = false,
  isLoader = false
}: { 
  className?: string;
  active?: boolean;
  speaking?: boolean;
  isLoader?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    eyeMaterials: THREE.PointsMaterial[];
  } | null>(null);

  const nextBlinkTime = useRef<number>(Date.now() + 3000);
  const isBlinking = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const facePoints: THREE.Points[] = [];
    const mouthPoints: THREE.Points[] = [];
    const hairPoints: THREE.Points[] = [];
    const eyePoints: THREE.Points[] = [];
    const eyeMaterials: THREE.PointsMaterial[] = [];

    // Helper: Create Point Cloud from Geometry
    const createPoints = (
      geometry: THREE.BufferGeometry, 
      color: string, 
      size: number, 
      opacity: number, 
      targetCount: number = 0,
      jitter: number = 0,
      radiusLimit: number = 0,
      yCutoff: number = -Infinity,
      headCenter?: THREE.Vector3
    ) => {
      const positions = geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      let finalPositions: Float32Array;

      if (targetCount > 0 && count > 0) {
        finalPositions = new Float32Array(targetCount * 3);
        let validCount = 0;
        let attempts = 0;
        const maxAttempts = targetCount * 5;

        while (validCount < targetCount && attempts < maxAttempts) {
          const idx = Math.floor(Math.random() * count);
          const x = positions[idx * 3];
          const y = positions[idx * 3 + 1];
          const z = positions[idx * 3 + 2];

          let isValid = true;
          if (radiusLimit > 0 && headCenter) {
            const dist = Math.sqrt((x - headCenter.x)**2 + (y - headCenter.y)**2 + (z - headCenter.z)**2);
            if (dist > radiusLimit) isValid = false;
          }
          if (y < yCutoff) isValid = false;

          if (isValid) {
            const offset = (Math.random() - 0.5) * jitter;
            finalPositions[validCount * 3] = x + offset;
            finalPositions[validCount * 3 + 1] = y + offset;
            finalPositions[validCount * 3 + 2] = z + offset;
            validCount++;
          }
          attempts++;
        }
      } else {
        finalPositions = positions;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(finalPositions, 3));

      // Multi-material for organic variance
      const materials = [
        new THREE.PointsMaterial({ color, size: size * 0.85, transparent: true, opacity: opacity * 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
        new THREE.PointsMaterial({ color, size, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }),
        new THREE.PointsMaterial({ color, size: size * 1.15, transparent: true, opacity: opacity * 1.1, blending: THREE.AdditiveBlending, depthWrite: false })
      ];

      const groups = 3;
      const pointsPerGroup = Math.floor(finalPositions.length / 3 / groups);

      for (let g = 0; g < groups; g++) {
        const subGeo = new THREE.BufferGeometry();
        const subPos = finalPositions.slice(g * pointsPerGroup * 3, (g + 1) * pointsPerGroup * 3);
        subGeo.setAttribute('position', new THREE.BufferAttribute(subPos, 3));
        const pts = new THREE.Points(subGeo, materials[g]);
        scene.add(pts);
        if (jitter === 0.002) facePoints.push(pts); // Identifier for face/mouth
        else hairPoints.push(pts);

        if (radiusLimit === 0 && jitter === 0) { // Eye identifier
           eyePoints.push(pts);
           eyeMaterials.push(materials[g]);
        }
      }
    };

    // Load Model
    const loader = new GLTFLoader();
    loader.load('/models/default_avatar.glb', (gltf) => {
      let faceGeo: THREE.BufferGeometry | null = null;
      let mouthGeo: THREE.BufferGeometry | null = null;
      let irisGeo: THREE.BufferGeometry | null = null;
      const hairGeos: { name: string; geo: THREE.BufferGeometry }[] = [];

      gltf.scene.traverse((child: any) => {
        if (child.isMesh) {
          const geo = child.geometry.clone();
          geo.applyMatrix4(child.matrixWorld);
          if (child.name.includes('Face_0')) faceGeo = geo;
          else if (child.name.includes('Mouth_0')) mouthGeo = geo;
          else if (child.name.includes('Iris')) irisGeo = geo;
          else if (child.name.toLowerCase().includes('hair')) hairGeos.push({ name: child.name, geo });
        }
      });

      if (faceGeo) {
        // Centering Protocol
        faceGeo.computeBoundingBox();
        const box = faceGeo.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.4 / maxDim;

        // Apply global transform
        const transform = new THREE.Matrix4().makeScale(scale, scale, scale);
        faceGeo.applyMatrix4(transform);
        if (mouthGeo) mouthGeo.applyMatrix4(transform);
        if (irisGeo) irisGeo.applyMatrix4(transform);
        hairGeos.forEach(h => h.geo.applyMatrix4(transform));

        // Final Centering
        faceGeo.computeBoundingBox();
        const newCenter = new THREE.Vector3();
        faceGeo.boundingBox!.getCenter(newCenter);
        const radius = size.length() * scale * 0.5;

        // Reconstruct Scene
        createPoints(faceGeo, '#4ff0ff', 0.022, 0.9, 6500, 0.002);
        if (mouthGeo) createPoints(mouthGeo, '#4ff0ff', 0.018, 0.6, 1500, 0.002);
        if (irisGeo) createPoints(irisGeo, '#4ff0ff', 0.012, 0.5);

        // Volumetric Hair
        hairGeos.forEach(h => {
          let count = 1000;
          if (h.name.includes('Cap') || h.name.includes('Back')) count = 3600;
          createPoints(h.geo, '#1a5fb4', 0.02, 0.5, count, 0.002, radius * 1.15, newCenter.y - (size.y * scale * 0.2), newCenter);
        });

        // Absolute Center
        scene.traverse((obj) => {
          if (obj instanceof THREE.Points) obj.position.sub(newCenter);
        });
      }

      sceneRef.current = { scene, camera, renderer, eyeMaterials };
    });

    // Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!sceneRef.current) return;

      const now = Date.now();

      // Blinking Protocol
      if (now > nextBlinkTime.current && !isBlinking.current) {
        isBlinking.current = true;
        console.log("[Hologram] Blink");
        sceneRef.current.eyeMaterials.forEach(m => m.opacity = 0);
        setTimeout(() => {
          if (sceneRef.current) {
            sceneRef.current.eyeMaterials.forEach(m => m.opacity = 0.5);
            isBlinking.current = false;
            nextBlinkTime.current = Date.now() + 3000 + Math.random() * 3000;
          }
        }, 150);
      }

      // Subtle Idle/Vocal Shake
      scene.children.forEach(child => {
        if (child instanceof THREE.Points) {
          child.rotation.y = Math.sin(now * 0.001) * 0.02;
          if (speaking) {
            child.position.y += Math.sin(now * 0.05) * 0.0005;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [speaking]);

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {isLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-md z-50">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}
    </div>
  );
}