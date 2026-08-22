"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - High-Stability Lifecycle v11.0.
 * Optimized for low-power GPU environments.
 * Prevents renderer recreation on prop changes using refs.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  className,
  isLoader = false
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Three.js Core Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Lifecycle Guards
  const initializingRef = useRef(false);
  const disposedRef = useRef(false);
  
  // Prop Sync Refs
  const speakingRef = useRef(speaking);
  const activeRef = useRef(active);

  const [isLoading, setIsLoading] = useState(true);
  const [contextLost, setContextLost] = useState(false);

  // Sync props to refs to avoid re-initializing engine
  useEffect(() => { speakingRef.current = speaking; }, [speaking]);
  useEffect(() => { activeRef.current = active; }, [active]);

  // RESOURCE DISPOSAL
  const disposeScene = useCallback(() => {
    console.log("[Hologram] Purging GPU resources...");
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if ((object as THREE.Mesh).isMesh || (object as THREE.Points).isPoints) {
          const mesh = object as THREE.Mesh | THREE.Points;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
      sceneRef.current.clear();
      sceneRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    cameraRef.current = null;
  }, []);

  const initEngine = useCallback(() => {
    // Strict Guard: Prevent multiple renderers or init during disposal
    if (initializingRef.current || rendererRef.current || disposedRef.current) return;
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    initializingRef.current = true;
    setIsLoading(true);
    setContextLost(false);
    
    try {
      // 1. SCENE & CAMERA
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000810);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(42, rect.width / rect.height, 0.1, 100);
      camera.position.set(0, 0, 3.0);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // 2. RENDERER (Low Power Config)
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: false, // Reduced GPU load
        alpha: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false
      });
      
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); // Aggressive cap
      renderer.setSize(rect.width, rect.height);
      rendererRef.current = renderer;

      // 3. LISTENERS
      const onContextLost = (e: Event) => {
        e.preventDefault();
        console.warn("[Hologram] Context Lost.");
        setContextLost(true);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };

      const onContextRestored = () => {
        console.log("[Hologram] Context Restored. Re-syncing...");
        disposeScene();
        initializingRef.current = false;
        initEngine();
      };

      canvasRef.current.addEventListener('webglcontextlost', onContextLost, false);
      canvasRef.current.addEventListener('webglcontextrestored', onContextRestored, false);

      // 4. LOAD ASSETS
      const loader = new GLTFLoader();
      loader.load('/models/woman_head.glb', (gltf) => {
        // Guard against async load after unmount
        if (disposedRef.current || !sceneRef.current) return;

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = 1.4 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        model.position.x -= scaledCenter.x;
        model.position.y -= scaledCenter.y;
        model.position.z -= scaledCenter.z;

        const facePositions: number[] = [];
        const mouthPositions: number[] = [];
        const hairPositions: number[] = [];
        const HAIR_LIMIT = 1200;
        let hCount = 0;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const pos = mesh.geometry.attributes.position;
            const name = child.name.toLowerCase();

            if (name.includes("face")) {
              const wireMat = new THREE.MeshBasicMaterial({
                color: 0x4ff0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
              });
              const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMat);
              wireMesh.applyMatrix4(mesh.matrixWorld);
              sceneRef.current?.add(wireMesh);
            }

            const tempV = new THREE.Vector3();
            for (let i = 0; i < pos.count; i += 2) {
              tempV.set(pos.getX(i), pos.getY(i), pos.getZ(i));
              tempV.applyMatrix4(mesh.matrixWorld);

              if (name.includes("face")) facePositions.push(tempV.x, tempV.y, tempV.z);
              else if (name.includes("mouth")) mouthPositions.push(tempV.x, tempV.y, tempV.z);
              else if (name.includes("hair") && hCount < HAIR_LIMIT) {
                hairPositions.push(tempV.x, tempV.y, tempV.z);
                hCount++;
              }
            }
          }
        });

        // Points Materials
        const faceGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
        const facePoints = new THREE.Points(faceGeo, new THREE.PointsMaterial({ color: 0x4ff0ff, size: 0.025, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
        sceneRef.current.add(facePoints);

        const hairGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(hairPositions, 3));
        const hairPoints = new THREE.Points(hairGeo, new THREE.PointsMaterial({ color: 0x1a5fb4, size: 0.01, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }));
        sceneRef.current.add(hairPoints);

        const mouthGeo = new THREE.BufferGeometry();
        const mouthTarget = new Float32Array(mouthPositions);
        mouthGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mouthPositions), 3));
        const mouthPoints = new THREE.Points(mouthGeo, new THREE.PointsMaterial({ color: 0x4ff0ff, size: 0.02, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
        sceneRef.current.add(mouthPoints);

        let time = 0;
        const animate = () => {
          if (disposedRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
          animationRef.current = requestAnimationFrame(animate);
          time += 0.016;

          sceneRef.current.rotation.y = Math.sin(time * 0.4) * 0.05;

          // React to speaking via ref
          if (speakingRef.current) {
            const pArr = mouthGeo.attributes.position.array as Float32Array;
            const amp = Math.abs(Math.sin(time * 15)) * 0.03;
            for (let i = 0; i < pArr.length; i += 3) {
              pArr[i+1] = mouthTarget[i+1] + (Math.random() - 0.5) * amp;
            }
            mouthGeo.attributes.position.needsUpdate = true;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        animate();
        setIsLoading(false);
        initializingRef.current = false;
      }, undefined, (err) => {
        console.error("[Hologram] Load Fault:", err);
        initializingRef.current = false;
        setIsLoading(false);
      });

    } catch (err) {
      console.error("[Hologram] Fatal Init:", err);
      initializingRef.current = false;
      setIsLoading(false);
    }
  }, [disposeScene]);

  // ON MOUNT
  useEffect(() => {
    disposedRef.current = false;
    initEngine();

    return () => {
      disposedRef.current = true;
      disposeScene();
    };
  }, [initEngine, disposeScene]);

  // RESIZE
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w <= 0 || h <= 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative overflow-hidden bg-[#000810]", className)}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {isLoading && !contextLost && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000810]/80 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}

      {contextLost && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Neural Buffer Exhausted</p>
          <p className="text-xs text-white/40 mb-6">GPU context dropped. This occurs when system resources are limited.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 glass rounded-xl text-[9px] font-black uppercase tracking-widest text-accent border border-accent/20">Re-Initialize</button>
        </div>
      )}
    </div>
  );
}