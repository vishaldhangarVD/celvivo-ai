"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  stream?: MediaStream | null;
  isCameraOn?: boolean;
  onStatusChange?: (status: string) => void;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - The Unified Nexvoro AI Hologram Engine.
 * Handles both the "Synchronizing Identity" loading phase and the live session preview.
 * Features: Procedural baseline, GLB sync, and Dark Navy matrix background.
 */

export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  onStatusChange, 
  className,
  isLoader = false
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const speakingRef = useRef(speaking);
  const activeRef = useRef(active);
  const [isLoading, setIsLoading] = useState(true);

  const PARTICLE_COUNT = 14000;
  const FORMATION_SPEED = 0.02;

  const safeStatusChange = useCallback((status: string) => {
    if (typeof onStatusChange === 'function') {
      onStatusChange(status);
    }
  }, [onStatusChange]);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Set requested permanent Dark Navy background
    scene.background = new THREE.Color(0x001a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 16); 
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(width, height);
    
    // Cleanup container before appending to prevent double-canvas in StrictMode
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Data Buffers
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const masks = new Int8Array(PARTICLE_COUNT);

    // 3. Generate Procedural Baseline
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      
      const x = 2.8 * Math.cos(theta) * Math.sin(phi);
      const y = 3.5 * Math.sin(theta) * Math.sin(phi);
      const z = 2.4 * Math.cos(phi);

      targetPositions[i * 3] = x;
      targetPositions[i * 3 + 1] = y;
      targetPositions[i * 3 + 2] = z;

      if (y < -1.2 && y > -2.2 && Math.abs(x) < 1.0 && z > 1.2) {
        masks[i] = y > -1.7 ? 1 : 2; 
      } else if (y > 0.8 && y < 1.8 && Math.abs(x) > 0.4 && Math.abs(x) < 1.8 && z > 1.4) {
        masks[i] = 3; 
      }

      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      colors[i * 3] = 0.1; 
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; 
      colors[i * 3 + 2] = 0.9;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // 4. Background GLB Sync
    const loader = new GLTFLoader();
    loader.load('/models/face.glb', (gltf) => {
      if (!isMounted) return;
      let headMesh: THREE.Mesh | null = null;
      gltf.scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          if (!headMesh || (node as THREE.Mesh).geometry.attributes.position.count > headMesh.geometry.attributes.position.count) {
            headMesh = node as THREE.Mesh;
          }
        }
      });

      if (headMesh) {
        const geo = headMesh.geometry;
        const attr = geo.attributes.position;
        console.log("Model loaded, vertex count: " + attr.count);

        geo.computeBoundingBox();
        const box = geo.boundingBox!;
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        const scale = 7.0 / Math.max(size.x, size.y, size.z);

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i % attr.count;
          const tx = (attr.getX(idx) - center.x) * scale;
          const ty = (attr.getY(idx) - center.y) * scale;
          const tz = (attr.getZ(idx) - center.z) * scale;

          targetPositions[i * 3] = tx;
          targetPositions[i * 3 + 1] = ty;
          targetPositions[i * 3 + 2] = tz;

          if (ty < -1.1 && ty > -2.4 && Math.abs(tx) < 1.2 && tz > 1.0) {
            masks[i] = ty > -1.75 ? 1 : 2;
          } else if (ty > 0.6 && ty < 1.8 && Math.abs(tx) > 0.5 && Math.abs(tx) < 1.8 && tz > 1.2) {
            masks[i] = 3;
          } else {
            masks[i] = 0;
          }
        }
        safeStatusChange("NEURAL_SYNC_COMPLETE");
      }
      setIsLoading(false);
    }, undefined, (err) => {
      console.warn("[Hologram] GLB Sync Restricted, Using Procedural Matrix.");
      if (isMounted) setIsLoading(false);
      safeStatusChange("PROCEDURAL_BASELINE_ACTIVE");
    });

    // 5. Matrix Animation Loop
    let time = 0;
    let formationProgress = 0;

    const animate = () => {
      if (!isMounted) return;
      animationRef.current = requestAnimationFrame(animate);
      time += 16; 

      if (pointsRef.current) {
        const posAttr = pointsRef.current.geometry.attributes.position;
        const pArray = posAttr.array as Float32Array;

        if (formationProgress < 1.0) formationProgress += FORMATION_SPEED;

        const speakCycle = speakingRef.current ? Math.sin(time * 0.012) : 0;
        const blinkCycle = Math.sin(time * 0.002) > 0.98 ? 0.05 : 1.0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          let tx = targetPositions[i3];
          let ty = targetPositions[i3 + 1];
          let tz = targetPositions[i3 + 2];

          if (masks[i] === 1) ty += speakCycle * 0.08;
          else if (masks[i] === 2) ty -= speakCycle * 0.12;
          else if (masks[i] === 3) ty *= blinkCycle;

          const ease = formationProgress >= 1.0 ? 0.12 : 0.05;
          pArray[i3] += (tx - pArray[i3]) * ease;
          pArray[i3 + 1] += (ty - pArray[i3 + 1]) * ease;
          pArray[i3 + 2] += (tz - pArray[i3 + 2]) * ease;
        }

        posAttr.needsUpdate = true;
        pointsRef.current.rotation.y = Math.sin(time * 0.0004) * 0.02;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [safeStatusChange]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative overflow-hidden rounded-[2rem] ${className ?? ""}`}
    >
      {/* Visual Scanline HUD */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
      </div>

      {/* Conditional Synchronizing Text Overlay */}
      {isLoader && (
        <div className="absolute inset-x-0 bottom-12 z-50 flex flex-col items-center gap-4">
          <div className="text-center animate-pulse">
            <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase">
              Synchronizing Identity...
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-1 h-1 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading && !isLoader && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001a2e]/60 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix...</p>
        </div>
      )}
    </div>
  );
}