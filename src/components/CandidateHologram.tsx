"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CandidateHologramProps {
  active: boolean;
  speaking: boolean;
  onStatusChange: (status: string) => void;
  className?: string;
}

/**
 * @fileOverview CandidateHologram FINAL REBUILD.
 * Features: High-performance particle engine, GLB with Procedural Fallback,
 * Isolated mouth animation, and zero-allocation animation loop.
 */

export default function CandidateHologram({ 
  active, 
  speaking, 
  onStatusChange, 
  className 
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const requestRef = useRef<number | null>(null);
  
  // Refs for animation sync to avoid React state overhead
  const speakingRef = useRef(speaking);
  const formationRef = useRef(0);
  const isLoadedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const PARTICLE_COUNT = 12000;
  const MODEL_PATH = '/models/face.glb';

  // Sync props to refs
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initial Scene Setup (Immediate)
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Memory Management (Typed Arrays)
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targets = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const masks = new Uint8Array(PARTICLE_COUNT); // 1 = mouth, 2 = eyes, 0 = static

    // 3. Procedural Fallback Generator (Ensures screen is never blank)
    const generateFallbackData = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Head Shape (Ellipsoid)
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        
        const x = 3.5 * Math.cos(theta) * Math.sin(phi);
        const y = 4.5 * Math.sin(theta) * Math.sin(phi);
        const z = 3.0 * Math.cos(phi);

        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = z;

        // Color (Holographic Cyan)
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.9;

        // Masks (Normalized coordinates)
        if (y < -1.0 && y > -2.5 && Math.abs(x) < 1.2 && z > 1.5) {
          masks[i] = 1; // Mouth
        } else if (y > 0.8 && y < 1.8 && Math.abs(x) > 0.5 && Math.abs(x) < 2.0 && z > 1.8) {
          masks[i] = 2; // Eyes
        }
        
        // Start below projector
        positions[i * 3] = (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = -15 - Math.random() * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
    };

    // 4. Initialize Fallback First
    generateFallbackData();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    // 5. Load Real Model Path
    const loader = new GLTFLoader();
    loader.load(MODEL_PATH, (gltf) => {
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
        geo.computeBoundingBox();
        const box = geo.boundingBox!;
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        
        const scale = 7.5 / Math.max(size.x, size.y, size.z);
        const attrPos = geo.attributes.position;
        const geoCount = attrPos.count;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const idx = i % geoCount;
          const tx = (attrPos.getX(idx) - center.x) * scale;
          const ty = (attrPos.getY(idx) - center.y) * scale;
          const tz = (attrPos.getZ(idx) - center.z) * scale;

          targets[i * 3] = tx;
          targets[i * 3 + 1] = ty;
          targets[i * 3 + 2] = tz;

          // Recalculate Masks for GLB
          if (ty < -1.2 && ty > -2.8 && Math.abs(tx) < 1.5 && tz > 1.0) {
            masks[i] = 1; // Mouth
          } else if (ty > 0.6 && ty < 1.6 && Math.abs(tx) > 0.4 && Math.abs(tx) < 1.8 && tz > 1.2) {
            masks[i] = 2; // Eyes
          } else {
            masks[i] = 0;
          }
        }
        console.log("[Hologram] GLB Nodes Synchronized.");
        onStatusChange("Face Model Optimized");
      }
      setIsLoading(false);
      isLoadedRef.current = true;
    }, undefined, (err) => {
      console.warn("[Hologram] GLB Load Failed, Keeping Procedural Fallback.");
      onStatusChange("Neural Fallback Active");
      setIsLoading(false);
    });

    // 6. Animation Logic (Zero-Allocation)
    let time = 0;
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      time += 16; // Approx delta

      if (pointsRef.current) {
        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
        
        // Smooth formation lerp
        if (formationRef.current < 1.0) formationRef.current += 0.015;
        
        const speakIntensity = speakingRef.current ? Math.sin(time * 0.012) * 0.2 : 0;
        const blink = Math.sin(time * 0.003) > 0.98 ? 0.1 : 1.0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const i3 = i * 3;
          let tx = targets[i3];
          let ty = targets[i3 + 1];
          let tz = targets[i3 + 2];

          // Apply Morphing Animations
          if (masks[i] === 1) { // Mouth
            ty += (targets[i3 + 1] > -1.8 ? speakIntensity * 0.5 : -speakIntensity);
          } else if (masks[i] === 2) { // Eyes
            ty *= blink;
          }

          // Lerp to target
          posArray[i3] += (tx - posArray[i3]) * 0.1;
          posArray[i3 + 1] += (ty - posArray[i3 + 1]) * 0.1;
          posArray[i3 + 2] += (tz - posArray[i3 + 2]) * 0.1;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Subtle Idle rotation
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
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current) {
          try { containerRef.current.removeChild(rendererRef.current.domElement); } catch (e) {}
        }
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative bg-black overflow-hidden rounded-[2rem] ${className ?? ""}`}
    >
      {/* Cinematic HUD Overlays */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}
    </div>
  );
}
