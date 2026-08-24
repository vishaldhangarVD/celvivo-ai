'use client';

import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - High-Density Surface-Aware Hologram.
 * Implementation: Triangle surface sampling for uniform face density.
 * Occlusion: Z-Depth filtering to keep only the front-facing "mask".
 */

const CandidateHologram = memo(({ 
  className,
  active = true,
  speaking = false,
  isLoader = false
}: { 
  className?: string;
  active?: boolean;
  speaking?: boolean;
  isLoader?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speakingRef = useRef(speaking);
  const nextBlinkTime = useRef<number>(Date.now() + 3000);
  const isBlinking = useRef<boolean>(false);
  const eyeMaterialsRef = useRef<THREE.PointsMaterial[]>([]);
  
  const sceneElements = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
  } | null>(null);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const parent = canvasRef.current.parentElement;
    const width = parent?.clientWidth || 400;
    const height = parent?.clientHeight || 400;
    console.log("[Hologram] Container dimensions:", width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /**
     * Surface Sampler: Generates points on the actual triangles of the mesh
     * rather than just at the vertices, ensuring uniform density.
     */
    const createPoints = (
      geometry: THREE.BufferGeometry, 
      color: string, 
      size: number, 
      opacity: number, 
      targetCount: number = 0,
      isEyes: boolean = false,
      zFilterRange: number = 1.0 // 1.0 = keep all, 0.4 = keep front 40%
    ) => {
      const positions = geometry.attributes.position.array as Float32Array;
      const index = geometry.index ? (geometry.index.array as Uint16Array | Uint32Array) : null;
      const vertexCount = positions.length / 3;
      
      let finalPositions: Float32Array;

      if (targetCount > 0 && index) {
        // High-Fidelity Surface Sampling
        finalPositions = new Float32Array(targetCount * 3);
        const triangleCount = index.length / 3;

        for (let i = 0; i < targetCount; i++) {
          const triIdx = Math.floor(Math.random() * triangleCount) * 3;
          const a = index[triIdx];
          const b = index[triIdx + 1];
          const c = index[triIdx + 2];

          // Barycentric Coordinates for uniform distribution
          let r1 = Math.random();
          let r2 = Math.random();
          if (r1 + r2 > 1) {
            r1 = 1 - r1;
            r2 = 1 - r2;
          }
          const r3 = 1 - r1 - r2;

          finalPositions[i * 3] = r1 * positions[a * 3] + r2 * positions[b * 3] + r3 * positions[c * 3];
          finalPositions[i * 3 + 1] = r1 * positions[a * 3 + 1] + r2 * positions[b * 3 + 1] + r3 * positions[c * 3 + 1];
          finalPositions[i * 3 + 2] = r1 * positions[a * 3 + 2] + r2 * positions[b * 3 + 2] + r3 * positions[c * 3 + 2];
        }
      } else {
        finalPositions = positions;
      }

      // Apply Z-Depth Occlusion Filtering if requested
      if (zFilterRange < 1.0) {
        geometry.computeBoundingBox();
        const minZ = geometry.boundingBox!.min.z;
        const maxZ = geometry.boundingBox!.max.z;
        const range = maxZ - minZ;
        const threshold = minZ + (range * zFilterRange);
        
        console.log(`[Hologram] Z-Audit | Range: ${minZ.toFixed(3)} to ${maxZ.toFixed(3)} | Threshold: ${threshold.toFixed(3)}`);

        const filtered = [];
        for (let i = 0; i < finalPositions.length / 3; i++) {
          if (finalPositions[i * 3 + 2] <= threshold) { // Note: z is often negative coming from loader
            filtered.push(finalPositions[i * 3], finalPositions[i * 3 + 1], finalPositions[i * 3 + 2]);
          }
        }
        finalPositions = new Float32Array(filtered);
      }

      console.log(`[Hologram] ${isEyes ? 'Eyes' : 'Face/Hair'} particles active:`, finalPositions.length / 3);

      const groups = 3;
      const pointsPerGroup = Math.floor(finalPositions.length / 3 / groups);

      for (let g = 0; g < groups; g++) {
        const subGeo = new THREE.BufferGeometry();
        const subPos = finalPositions.slice(g * pointsPerGroup * 3, (g + 1) * pointsPerGroup * 3);
        subGeo.setAttribute('position', new THREE.BufferAttribute(subPos, 3));
        
        const sizeVar = 0.85 + (Math.random() * 0.3);
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
        
        if (isEyes) eyeMaterialsRef.current.push(mat);
      }
    };

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
        const sizeVec = new THREE.Vector3();
        faceGeo.boundingBox!.getSize(sizeVec);

        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        const scaleFactor = 1.4 / maxDim;
        const transformMatrix = new THREE.Matrix4().makeScale(scaleFactor, scaleFactor, scaleFactor);
        
        faceGeo.applyMatrix4(transformMatrix);
        if (mouthGeo) mouthGeo.applyMatrix4(transformMatrix);
        if (irisGeo) irisGeo.applyMatrix4(transformMatrix);
        hairGeos.forEach(h => h.geo.applyMatrix4(transformMatrix));

        faceGeo.computeBoundingBox();
        const finalCenter = new THREE.Vector3();
        faceGeo.boundingBox!.getCenter(finalCenter);

        // Face Synthesis: Use 5000 surface-sampled nodes with front-face occlusion
        createPoints(faceGeo, '#4ff0ff', 0.022, 0.95, 5000, false, 0.4);
        
        if (mouthGeo) createPoints(mouthGeo, '#4ff0ff', 0.018, 0.6, 1000);
        if (irisGeo) createPoints(irisGeo, '#4ff0ff', 0.012, 0.5, 0, true);

        // Volumetric Hair Logic
        hairGeos.forEach(h => {
          let count = 1200;
          if (h.name.includes('Cap') || h.name.includes('Back')) count = 3600;
          createPoints(h.geo, '#1a5fb4', 0.02, 0.5, count);
        });

        scene.traverse((obj) => {
          if (obj instanceof THREE.Points) {
            obj.position.sub(finalCenter);
          }
        });
      }

      sceneElements.current = { scene, camera, renderer };
    });

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!sceneElements.current) return;

      const now = Date.now();

      // Blinking Protocol
      if (now > nextBlinkTime.current && !isBlinking.current) {
        isBlinking.current = true;
        eyeMaterialsRef.current.forEach(m => m.opacity = 0);
        setTimeout(() => {
          eyeMaterialsRef.current.forEach(m => m.opacity = 0.5);
          isBlinking.current = false;
          nextBlinkTime.current = Date.now() + 3000 + Math.random() * 3000;
        }, 150);
      }

      scene.children.forEach(child => {
        if (child instanceof THREE.Points) {
          child.rotation.y = Math.sin(now * 0.0008) * 0.03;
          if (speakingRef.current) {
            child.position.y += Math.sin(now * 0.04) * 0.0004;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current || !canvasRef.current.parentElement) return;
      const w = canvasRef.current.parentElement.clientWidth;
      const h = canvasRef.current.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {isLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 backdrop-blur-md z-50">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;