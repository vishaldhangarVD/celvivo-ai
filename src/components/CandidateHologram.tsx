'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - Particles-Only Hologram.
 * Using woman_head.glb with raw vertex sampling for maximum clarity.
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
  const speakingRef = useRef(speaking);
  const nextBlinkTime = useRef<number>(Date.now() + 3000);
  const isBlinking = useRef<boolean>(false);
  const sceneElements = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    eyeMaterials: THREE.PointsMaterial[];
  } | null>(null);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

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
      headCenter?: THREE.Vector3,
      isEyes: boolean = false
    ) => {
      const positions = geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      let finalPositions: Float32Array;

      if (targetCount > 0 && count > 0) {
        finalPositions = new Float32Array(targetCount * 3);
        for (let i = 0; i < targetCount; i++) {
          const idx = Math.floor(Math.random() * count);
          const offset = (Math.random() - 0.5) * jitter;
          const px = positions[idx * 3] + offset;
          const py = positions[idx * 3 + 1] + offset;
          const pz = positions[idx * 3 + 2] + offset;

          // Outlier & Vertical Filter
          if (headCenter) {
            const dx = px - headCenter.x;
            const dy = py - headCenter.y;
            const dz = pz - headCenter.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist > radiusLimit || py < yCutoff) {
              i--; // Retry
              continue;
            }
          }

          finalPositions[i * 3] = px;
          finalPositions[i * 3 + 1] = py;
          finalPositions[i * 3 + 2] = pz;
        }
      } else {
        finalPositions = positions;
      }

      const groups = 3;
      const pointsPerGroup = Math.floor(finalPositions.length / 3 / groups);

      for (let g = 0; g < groups; g++) {
        const subGeo = new THREE.BufferGeometry();
        const subPos = finalPositions.slice(g * pointsPerGroup * 3, (g + 1) * pointsPerGroup * 3);
        subGeo.setAttribute('position', new THREE.BufferAttribute(subPos, 3));
        
        const sizeVar = 1 + (Math.random() - 0.5) * 0.15;
        const mat = new THREE.PointsMaterial({ 
          color, 
          size: size * sizeVar, 
          transparent: true, 
          opacity, 
          blending: THREE.AdditiveBlending, 
          depthWrite: false 
        });
        
        const pts = new THREE.Points(subGeo, mat);
        scene.add(pts);
        
        if (isEyes) {
          eyeMaterials.push(mat);
        }
      }
    };

    // 2. Load Model
    const loader = new GLTFLoader();
    loader.load('/models/woman_head.glb', (gltf) => {
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
        faceGeo.computeBoundingBox();
        const box = faceGeo.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.4 / maxDim;
        const transform = new THREE.Matrix4().makeScale(scale, scale, scale);
        
        faceGeo.applyMatrix4(transform);
        if (mouthGeo) mouthGeo.applyMatrix4(transform);
        if (irisGeo) irisGeo.applyMatrix4(transform);
        hairGeos.forEach(h => h.geo.applyMatrix4(transform));

        faceGeo.computeBoundingBox();
        const newCenter = new THREE.Vector3();
        faceGeo.boundingBox!.getCenter(newCenter);

        // Create Particle Systems
        // Raw sampling for Face and Mouth (targetCount = 0)
        createPoints(faceGeo, '#4ff0ff', 0.022, 0.9, 0, 0.002);
        if (mouthGeo) createPoints(mouthGeo, '#4ff0ff', 0.018, 0.6, 0, 0.002);
        if (irisGeo) createPoints(irisGeo, '#4ff0ff', 0.012, 0.5, 0, 0, 0, -Infinity, undefined, true);

        const radius = size.length() * scale * 0.5;
        hairGeos.forEach(h => {
          let tCount = 1200;
          if (h.name.includes('Hair_Cap_0') || h.name.includes('Back_Mat_0')) tCount = 3600;
          else if (h.name.includes('FrontL_Mat_0') || h.name.includes('FrontR_Mat_0')) tCount = 1200;
          
          createPoints(h.geo, '#1a5fb4', 0.02, 0.5, tCount, 0.002, radius * 1.15, newCenter.y - (size.y * scale * 0.2), newCenter);
        });

        // Global Centering
        scene.traverse((obj) => {
          if (obj instanceof THREE.Points) obj.position.sub(newCenter);
        });
      }

      sceneElements.current = { scene, camera, renderer, eyeMaterials };
    });

    // 3. Animation Loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!sceneElements.current) return;

      const now = Date.now();

      // Blinking logic
      if (now > nextBlinkTime.current && !isBlinking.current) {
        isBlinking.current = true;
        sceneElements.current.eyeMaterials.forEach(m => m.opacity = 0);
        setTimeout(() => {
          if (sceneElements.current) {
            sceneElements.current.eyeMaterials.forEach(m => m.opacity = 0.5);
            isBlinking.current = false;
            nextBlinkTime.current = Date.now() + 3000 + Math.random() * 3000;
          }
        }, 150);
      }

      // Idle movement & vocal jitter
      scene.children.forEach(child => {
        if (child instanceof THREE.Points) {
          child.rotation.y = Math.sin(now * 0.001) * 0.02;
          if (speakingRef.current) {
            child.position.y += Math.sin(now * 0.05) * 0.0005;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

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
  }, []);

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
