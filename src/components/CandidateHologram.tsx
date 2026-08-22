"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CandidateHologramProps {
  stream?: MediaStream | null;
  isCameraOn?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

/**
 * @fileOverview CandidateHologram - Repaired High-Performance 3D Particle Face.
 * Loads face.glb, samples vertices, and runs an optimized animation loop.
 */

export default function CandidateHologram({ 
  isCameraOn = true, 
  isSpeaking = false,
  className 
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const requestRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const MAX_PARTICLES = 20000;
  const MODEL_PATH = '/models/face.glb';

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(25, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Data Buffers (Reused to prevent GC overhead)
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const targets = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const masks = new Uint8Array(MAX_PARTICLES * 2); // x=mouth, y=eye

    // 3. Load Model
    const loader = new GLTFLoader();
    loader.load(MODEL_PATH, (gltf) => {
      let mainMesh: THREE.Mesh | null = null;
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (!mainMesh || (child as THREE.Mesh).geometry.attributes.position.count > mainMesh.geometry.attributes.position.count) {
            mainMesh = child as THREE.Mesh;
          }
        }
      });

      if (!mainMesh) {
        console.error("No valid face mesh found in GLB");
        setIsLoading(false);
        return;
      }

      const geometry = mainMesh.geometry;
      const posAttr = geometry.attributes.position;
      const count = Math.min(posAttr.count, MAX_PARTICLES);

      // Normalize Model
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 8 / maxDim;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const idx = i % count;
        const x = (posAttr.getX(idx) - center.x) * scaleFactor;
        const y = (posAttr.getY(idx) - center.y) * scaleFactor;
        const z = (posAttr.getZ(idx) - center.z) * scaleFactor;

        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = z;

        // Initial state: small cloud at bottom
        positions[i * 3] = (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = -10 + Math.random() * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

        // Color (Cyan Hologram)
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;

        // Region Masking (Assuming normalized face: Y=0 centered)
        // Mouth: Y between -2.5 and -1.0
        if (y < -1.0 && y > -2.8 && Math.abs(x) < 1.5 && z > 0) {
          masks[i * 2] = 1;
        }
        // Eyes: Y between 0.8 and 2.2
        if (y > 0.8 && y < 2.2 && Math.abs(x) > 0.4 && Math.abs(x) < 2.2 && z > 0) {
          masks[i * 2 + 1] = 1;
        }
      }

      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const pointsMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      pointsRef.current = points;
      scene.add(points);
      setIsLoading(false);
    }, undefined, (err) => {
      console.error("GLB Load Error:", err);
      setIsLoading(false);
    });

    // 4. Animation Variables
    let time = 0;
    let formation = 0;

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      time += 16; // approximate delta

      if (pointsRef.current) {
        const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
        
        // Mouth animation parameters
        const mouthCenterY = -1.8;
        const mouthOpen = isSpeaking ? Math.sin(time * 0.012) * 0.25 + 0.25 : 0;
        const blink = Math.sin(time * 0.003) > 0.98 ? 1 : 0;

        // Smooth formation
        if (formation < 1) formation += 0.01;

        for (let i = 0; i < MAX_PARTICLES; i++) {
          const i3 = i * 3;
          
          // Target position with animations
          let tx = targets[i3];
          let ty = targets[i3 + 1];
          let tz = targets[i3 + 2];

          // Speak Animation (Mouth Mask)
          if (masks[i * 2] === 1) {
            ty += (targets[i3 + 1] > mouthCenterY ? mouthOpen * 0.4 : -mouthOpen * 0.8);
          }

          // Blink Animation (Eye Mask)
          if (masks[i * 2 + 1] === 1 && blink) {
            ty *= 0.95;
          }

          // Lerp to target
          pos[i3] += (tx - pos[i3]) * (formation < 1 ? 0.05 : 0.2);
          pos[i3 + 1] += (ty - pos[i3 + 1]) * (formation < 1 ? 0.05 : 0.2);
          pos[i3 + 2] += (tz - pos[i3 + 2]) * (formation < 1 ? 0.05 : 0.2);
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Subtle Idle Sway
        pointsRef.current.rotation.y = Math.sin(time * 0.0004) * 0.02;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
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
        if (containerRef.current) containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [isSpeaking]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-black rounded-[inherit] overflow-hidden", className)}>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 glass backdrop-blur-xl flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synthesizing Neural Node...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
