'use client';

import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - High-Fidelity Neural Face Hologram.
 * Uses bi-directional vertex sampling to ensure balanced visual density.
 * Calibrated for optimal facial glow while preventing hair over-density.
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
     * createPoints:
     * Normalizes vertex counts. Boosts low-density meshes via jitter-duplication.
     * Caps high-density meshes via subsampling.
     */
    const createPoints = (
      geometry: THREE.BufferGeometry, 
      color: string, 
      size: number, 
      opacity: number, 
      targetCount: number = 0,
      isEyes: boolean = false,
      jitterAmount: number = 0.004
    ) => {
      const positions = geometry.attributes.position.array as Float32Array;
      const vertexCount = positions.length / 3;
      
      console.log("[Diag] originalCount:", vertexCount, "targetCount:", targetCount, "will boost:", targetCount > 0 && vertexCount < targetCount);
      
      let finalPositions: Float32Array;

      if (targetCount > 0 && targetCount > vertexCount) {
        // Low-Density Boost: High-Density Jitter Synthesis
        finalPositions = new Float32Array(targetCount * 3);
        // Copy original vertices
        for (let i = 0; i < positions.length; i++) {
          finalPositions[i] = positions[i];
        }
        // Fill remainder with jittered clones
        for (let i = vertexCount; i < targetCount; i++) {
          const sourceIdx = Math.floor(Math.random() * vertexCount) * 3;
          finalPositions[i * 3] = positions[sourceIdx] + (Math.random() - 0.5) * jitterAmount;
          finalPositions[i * 3 + 1] = positions[sourceIdx + 1] + (Math.random() - 0.5) * jitterAmount;
          finalPositions[i * 3 + 2] = positions[sourceIdx + 2] + (Math.random() - 0.5) * jitterAmount;
        }
      } else if (targetCount > 0 && vertexCount > targetCount) {
        // High-Density Cap: Subsampling to prevent occlusion
        finalPositions = new Float32Array(targetCount * 3);
        for (let i = 0; i < targetCount; i++) {
          // Use linear sampling across the vertex buffer for even distribution
          const sourceIdx = Math.floor(i * (vertexCount / targetCount)) * 3;
          finalPositions[i * 3] = positions[sourceIdx];
          finalPositions[i * 3 + 1] = positions[sourceIdx + 1];
          finalPositions[i * 3 + 2] = positions[sourceIdx + 2];
        }
      } else {
        finalPositions = positions;
      }

      console.log("[Diag] finalPositions particle count:", finalPositions.length / 3);

      const subGeo = new THREE.BufferGeometry();
      subGeo.setAttribute('position', new THREE.BufferAttribute(finalPositions, 3));
      
      const mat = new THREE.PointsMaterial({ 
        color, 
        size: size, 
        transparent: true, 
        opacity, 
        blending: THREE.AdditiveBlending, 
        depthWrite: false 
      });
      
      const pts = new THREE.Points(subGeo, mat);
      scene.add(pts);
      
      if (isEyes) eyeMaterialsRef.current.push(mat);
    };

    const manager = new THREE.LoadingManager();
    manager.onError = (url) => {
      if (url.includes('blob:')) {
        return;
      }
      console.error('[Hologram] Load error:', url);
    };

    const loader = new GLTFLoader(manager);
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

        // Face Synthesis: Boosted to 8,000 nodes for high-quality features
        console.log("[Diag] Face raw vertex count:", (faceGeo as THREE.BufferGeometry).attributes.position.array.length / 3);
        createPoints(faceGeo, '#4ff0ff', 0.026, 0.85, 8000, false, 0.004);
        
        if (mouthGeo) createPoints(mouthGeo, '#4ff0ff', 0.015, 0.5, 1000, false, 0.004);
        if (irisGeo) createPoints(irisGeo, '#4ff0ff', 0.01, 0.6, 500, true, 0.004);

        // Volumetric Hair Logic: Capped to prevent overwhelming the face
        hairGeos.forEach(h => {
          let count = 1500;
          if (h.name.includes('Cap') || h.name.includes('Back')) count = 3000;
          createPoints(h.geo, '#1a5fb4', 0.018, 0.4, count, false, 0.006);
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
          eyeMaterialsRef.current.forEach(m => m.opacity = 0.6);
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