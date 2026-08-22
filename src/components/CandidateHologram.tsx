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
 * @fileOverview CandidateHologram - GPU Stability & Realism Protocol v5.0.
 * Optimized to prevent GL_OUT_OF_MEMORY and Shader Compiler errors.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  className,
  isLoader = false
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [contextError, setContextError] = useState(false);

  // AGGRESSIVE MEMORY CLEANUP
  const disposeScene = useCallback(() => {
    if (!sceneRef.current) return;
    
    console.log("[Hologram] Initializing memory purge...");
    sceneRef.current.traverse((object) => {
      if ((object as any).isMesh || (object as any).isPoints) {
        const mesh = object as THREE.Mesh | THREE.Points;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
    }
    
    sceneRef.current.clear();
    sceneRef.current = null;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const initEngine = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setContextError(false);
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000810);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. RENDERER (Optimized for stability)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // 3. CONTEXT RECOVERY PROTOCOLS
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("[Hologram] WebGL Context Lost. Attempting recovery...");
      setContextError(true);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

    const handleContextRestored = () => {
      console.log("[Hologram] WebGL Context Restored. Re-initializing...");
      initEngine();
    };

    canvasRef.current.addEventListener('webglcontextlost', handleContextLost, false);
    canvasRef.current.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 4. ASSET LOADING
    const loader = new GLTFLoader();
    loader.load('/models/woman_head.glb', (gltf) => {
      const model = gltf.scene;

      // NORMALIZATION & CENTERING (LOCKED TO 1.4 SCALE)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.4 / maxDim;
      model.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      model.position.x = -scaledCenter.x;
      model.position.y = -scaledCenter.y;
      model.position.z = -scaledCenter.z;

      console.log("[Hologram] Normalized Dimensions:", (size.x * scale).toFixed(2), "x", (size.y * scale).toFixed(2), "x", (size.z * scale).toFixed(2));
      console.log("[Hologram] Final model world position:", model.position);

      // PARTICLE SYSTEM LOGIC
      const pointsPool: { pos: THREE.Vector3; type: string }[] = [];
      const HAIR_TOTAL_LIMIT = 1200;
      let hairCount = 0;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name.toLowerCase();

          const isFace = name.includes("face");
          const isMouth = name.includes("mouth");
          const isIris = name.includes("iris");
          const isHair = name.includes("hair");

          // FACE STRUCTURE (WIREFRAME GLOW)
          if (isFace || isMouth) {
            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x4ff0ff,
              wireframe: true,
              transparent: true,
              opacity: isMouth ? 0.25 : 0.6,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);
          }

          // VOLUMETRIC FILL
          if (isFace) {
            const fillMaterial = new THREE.MeshBasicMaterial({
              color: 0x001a2e,
              transparent: true,
              opacity: 0.15,
              depthWrite: false
            });
            const fillMesh = new THREE.Mesh(mesh.geometry.clone(), fillMaterial);
            fillMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(fillMesh);
          }

          // VERTEX SAMPLING
          const tempV = new THREE.Vector3();
          for (let i = 0; i < posAttr.count; i++) {
            if (i % 2 !== 0) continue; // Decimate density
            
            tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            tempV.applyMatrix4(mesh.matrixWorld);

            if (isFace) {
              pointsPool.push({ pos: tempV.clone(), type: 'face' });
            } else if (isIris) {
              pointsPool.push({ pos: tempV.clone(), type: 'eye' });
            } else if (isMouth) {
              pointsPool.push({ pos: tempV.clone(), type: 'mouth' });
            } else if (isHair && hairCount < HAIR_TOTAL_LIMIT) {
              pointsPool.push({ pos: tempV.clone(), type: 'hair' });
              hairCount++;
            }
          }
        }
      });

      // CONSTRUCT BUFFER GEOMETRY
      const totalParticles = pointsPool.length;
      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles);
      const alphas = new Float32Array(totalParticles);
      const isMouthArr = new Float32Array(totalParticles);

      const colorFace = new THREE.Color(0x4ff0ff);
      const colorHair = new THREE.Color(0x1a5fb4);
      const colorEye = new THREE.Color(0x006677);

      for (let i = 0; i < totalParticles; i++) {
        const p = pointsPool[i];
        const i3 = i * 3;

        positions[i3] = p.pos.x + (Math.random() - 0.5) * 2;
        positions[i3+1] = p.pos.y + (Math.random() - 0.5) * 2;
        positions[i3+2] = p.pos.z + (Math.random() - 0.5) * 2;

        targetPositions[i3] = p.pos.x;
        targetPositions[i3+1] = p.pos.y;
        targetPositions[i3+2] = p.pos.z;

        if (p.type === 'face') {
          colorFace.toArray(colors, i3);
          sizes[i] = 0.025;
          alphas[i] = 0.85;
        } else if (p.type === 'hair') {
          colorHair.toArray(colors, i3);
          sizes[i] = 0.01;
          alphas[i] = 0.4;
        } else if (p.type === 'eye') {
          colorEye.toArray(colors, i3);
          sizes[i] = 0.012;
          alphas[i] = 0.5;
        } else if (p.type === 'mouth') {
          colorFace.toArray(colors, i3);
          sizes[i] = 0.02;
          alphas[i] = 0.3;
          isMouthArr[i] = 1.0;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      // Using standard PointsMaterial (size is global but we'll use additive blending for glow)
      const material = new THREE.PointsMaterial({
        size: 0.022,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // ANIMATION LOOP
      let time = 0;
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechAmp = speaking ? Math.abs(Math.sin(time * 15)) * 0.03 : 0;

        for (let i = 0; i < totalParticles; i++) {
          const i3 = i * 3;
          for (let j = 0; j < 3; j++) {
            const idx = i3 + j;
            let target = targetPositions[idx];
            
            // Anatomical Jitter (Hair)
            if (pointsPool[i].type === 'hair') {
              target += (Math.random() - 0.5) * 0.01;
            }

            // Speech Animation (Mouth)
            if (j === 1 && isMouthArr[i] > 0.5) {
              target += (Math.random() - 0.5) * speechAmp;
            }

            const force = (target - pArr[idx]) * 0.08;
            velocities[idx] = (velocities[idx] + force) * 0.85;
            pArr[idx] += velocities[idx];
          }
        }
        geometry.attributes.position.needsUpdate = true;

        points.rotation.y += 0.001;
        points.position.y = Math.sin(time * 1.2) * 0.012;

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);
      console.log(`[Hologram] Matrix Active. Total Particles: ${totalParticles}`);
    }, undefined, (err) => {
      console.error("[Hologram] Load Fault:", err);
      setIsLoading(false);
    });

    return () => {
      canvasRef.current?.removeEventListener('webglcontextlost', handleContextLost);
      canvasRef.current?.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [speaking]);

  useEffect(() => {
    initEngine();
    return disposeScene;
  }, [initEngine, disposeScene]);

  // Handle Rezise
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative overflow-hidden bg-[#000810] ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000810]/80 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}

      {contextError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Memory Exhaustion Detected</p>
          <p className="text-xs text-white/40 mb-6">The neural interface is attempting to recover the visual matrix.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 glass rounded-xl text-[9px] font-black uppercase tracking-widest text-accent">Force Matrix Reset</button>
        </div>
      )}

      {/* Cheap CSS Glow Filter */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(79,240,255,0.1)] mix-blend-screen" />
    </div>
  );
}
