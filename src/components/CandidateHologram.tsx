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
 * @fileOverview CandidateHologram - GPU Stability & Realism Protocol v6.0.
 * Clean rewrite to resolve GL_OUT_OF_MEMORY and Shader Compiler errors.
 * Uses standard materials and aggressive disposal logic.
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
  const [contextLost, setContextLost] = useState(false);

  // AGGRESSIVE MEMORY PURGE
  const disposeScene = useCallback(() => {
    if (!sceneRef.current) return;
    
    console.log("[Hologram] Initializing aggressive memory purge...");
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
    setContextLost(false);
    
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

    // 2. RENDERER (Clean direct render, no post-processing)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    // 3. CONTEXT RECOVERY LISTENERS
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("[Hologram] WebGL Context Lost. Resources exhausted.");
      setContextLost(true);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

    const handleContextRestored = () => {
      console.log("[Hologram] WebGL Context Restored. Re-initializing matrix...");
      initEngine();
    };

    canvasRef.current.addEventListener('webglcontextlost', handleContextLost, false);
    canvasRef.current.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 4. ASSET LOADING
    const loader = new GLTFLoader();
    loader.load('/models/woman_head.glb', (gltf) => {
      const model = gltf.scene;

      // NORMALIZATION & CENTERING (LOCKED TO 1.4)
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.4 / maxDim;
      model.scale.setScalar(scale);

      // Recompute center AFTER scaling for perfect origin alignment
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      model.position.x -= scaledCenter.x;
      model.position.y -= scaledCenter.y;
      model.position.z -= scaledCenter.z;

      console.log("[Hologram] Normalized Dimensions:", (size.x * scale).toFixed(2), "x", (size.y * scale).toFixed(2), "x", (size.z * scale).toFixed(2));
      console.log("[Hologram] Final model world position:", model.position);

      // Categorized point collections
      const facePositions: number[] = [];
      const eyePositions: number[] = [];
      const mouthPositions: number[] = [];
      const hairPositions: number[] = [];

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

          // FACE STRUCTURE OVERLAY (WIREFRAME)
          if (isFace) {
            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x4ff0ff,
              wireframe: true,
              transparent: true,
              opacity: 0.6,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);

            // VOLUMETRIC FILL
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

          if (isMouth) {
            const mouthWireMat = new THREE.MeshBasicMaterial({
              color: 0x4ff0ff,
              wireframe: true,
              transparent: true,
              opacity: 0.25,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            const mouthWire = new THREE.Mesh(mesh.geometry.clone(), mouthWireMat);
            mouthWire.applyMatrix4(mesh.matrixWorld);
            scene.add(mouthWire);
          }

          // VERTEX SAMPLING
          const tempV = new THREE.Vector3();
          for (let i = 0; i < posAttr.count; i += 2) {
            tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            tempV.applyMatrix4(mesh.matrixWorld);

            if (isFace) {
              facePositions.push(tempV.x, tempV.y, tempV.z);
            } else if (isIris) {
              eyePositions.push(tempV.x, tempV.y, tempV.z);
            } else if (isMouth) {
              mouthPositions.push(tempV.x, tempV.y, tempV.z);
            } else if (isHair && hairCount < HAIR_TOTAL_LIMIT) {
              hairPositions.push(tempV.x, tempV.y, tempV.z);
              hairCount++;
            }
          }
        }
      });

      console.log(`[Hologram] FINAL COUNTS - Face: ${facePositions.length/3}, Hair: ${hairPositions.length/3}, Eyes: ${eyePositions.length/3}, Mouth: ${mouthPositions.length/3}`);

      // FACE PARTICLES (High Fidelity)
      const faceGeo = new THREE.BufferGeometry();
      faceGeo.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3));
      const faceMat = new THREE.PointsMaterial({
        color: 0x4ff0ff,
        size: 0.025,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const facePoints = new THREE.Points(faceGeo, faceMat);
      scene.add(facePoints);

      // HAIR PARTICLES (Subtle Cap)
      const hairGeo = new THREE.BufferGeometry();
      hairGeo.setAttribute('position', new THREE.Float32BufferAttribute(hairPositions, 3));
      const hairMat = new THREE.PointsMaterial({
        color: 0x1a5fb4,
        size: 0.01,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const hairPoints = new THREE.Points(hairGeo, hairMat);
      scene.add(hairPoints);

      // EYE PARTICLES (Iris Only)
      const eyeGeo = new THREE.BufferGeometry();
      eyeGeo.setAttribute('position', new THREE.Float32BufferAttribute(eyePositions, 3));
      const eyeMat = new THREE.PointsMaterial({
        color: 0x006677,
        size: 0.012,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      scene.add(new THREE.Points(eyeGeo, eyeMat));

      // MOUTH PARTICLES (Animated Region)
      const mouthGeo = new THREE.BufferGeometry();
      const mouthTarget = new Float32Array(mouthPositions);
      mouthGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mouthPositions), 3));
      const mouthMat = new THREE.PointsMaterial({
        color: 0x4ff0ff,
        size: 0.02,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mouthPoints = new THREE.Points(mouthGeo, mouthMat);
      scene.add(mouthPoints);

      // ANIMATION LOOP
      let time = 0;
      const animate = () => {
        if (!sceneRef.current) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        // Subtle head float
        const floatY = Math.sin(time * 1.2) * 0.012;
        scene.position.y = floatY;
        
        // Face rotation
        scene.rotation.y = Math.sin(time * 0.4) * 0.05;

        // Mouth Animation (Simulation)
        if (speaking) {
          const pArr = mouthGeo.attributes.position.array as Float32Array;
          const speechAmp = Math.abs(Math.sin(time * 15)) * 0.03;
          for (let i = 0; i < pArr.length; i += 3) {
            pArr[i+1] = mouthTarget[i+1] + (Math.random() - 0.5) * speechAmp;
          }
          mouthGeo.attributes.position.needsUpdate = true;
        } else {
          // Snap back if stopped
          const pArr = mouthGeo.attributes.position.array as Float32Array;
          if (pArr[1] !== mouthTarget[1]) {
             for (let i = 0; i < pArr.length; i++) pArr[i] = mouthTarget[i];
             mouthGeo.attributes.position.needsUpdate = true;
          }
        }

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);
    }, undefined, (err) => {
      console.error("[Hologram] Critical Load Fault:", err);
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

  // Window Resize Protocol
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

      {contextLost && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/20 backdrop-blur-xl p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-4">Memory Exhaustion Detected</p>
          <p className="text-xs text-white/40 mb-6">GPU context was lost due to resource pressure. Re-opening the browser tab is recommended.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 glass rounded-xl text-[9px] font-black uppercase tracking-widest text-accent">Attempt Recovery</button>
        </div>
      )}

      {/* Static Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(79,240,255,0.1)] mix-blend-screen opacity-50" />
    </div>
  );
}
