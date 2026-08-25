'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview CandidateHologram - Realistic 3D Particle Matrix.
 * CONSTRUCTION: Constructs a human face from 18,000+ tiny luminous points.
 * FEATURES: Neural formation, Blink protocol, Vocal synchronization, 3D Depth mapping.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Three.js Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const atmosphereRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Animation State Refs
  const formationProgress = useRef(0);
  const targetSpeakingValue = useRef(0);
  const currentSpeakingValue = useRef(0);
  const blinkValue = useRef(1);
  const lastBlinkTime = useRef(0);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;
    const PARTICLE_COUNT = 18000;
    const ATMOSPHERE_COUNT = 200;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;

      // 1. Scene Setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.set(0, 0, 8);
      cameraRef.current = camera;

      try {
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        rendererRef.current = renderer;
      } catch (e) {
        console.error('[Hologram] WebGL init failed');
        setError(true);
        return;
      }

      // 2. Data Loading & Sampling
      const loader = new GLTFLoader();
      const createPoints = (faceGeo: THREE.BufferGeometry) => {
        faceGeo.center();
        
        // Sample points from the mesh surface
        const sampler = new MeshSurfaceSampler(new THREE.Mesh(faceGeo)).build();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
        const metadata = new Float32Array(PARTICLE_COUNT); // 0: general, 1: eye, 2: mouth
        
        const tempPos = new THREE.Vector3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sampler.sample(tempPos);
          
          // Store target positions
          positions[i * 3] = tempPos.x;
          positions[i * 3 + 1] = tempPos.y;
          positions[i * 3 + 2] = tempPos.z;

          // Store initial scattered positions
          initialPositions[i * 3] = (Math.random() - 0.5) * 10;
          initialPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

          // Heuristic Feature Detection
          // Note: Based on standard face mesh proportions
          const isMouth = tempPos.y < -0.2 && tempPos.y > -0.6 && Math.abs(tempPos.x) < 0.4 && tempPos.z > 0.2;
          const isEye = tempPos.y > 0.1 && tempPos.y < 0.4 && Math.abs(tempPos.x) > 0.15 && Math.abs(tempPos.x) < 0.55 && tempPos.z > 0.1;
          
          metadata[i] = isMouth ? 2 : (isEye ? 1 : 0);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
        geometry.setAttribute('targetPos', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('metadata', new THREE.BufferAttribute(metadata, 1));

        const material = new THREE.PointsMaterial({
          color: 0x22d3ee, // Nexvoro Cyan
          size: 0.022,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Atmosphere
        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
        for(let i=0; i<ATMOSPHERE_COUNT; i++) {
          atmosPos[i*3] = (Math.random()-0.5)*6;
          atmosPos[i*3+1] = (Math.random()-0.5)*6;
          atmosPos[i*3+2] = (Math.random()-0.5)*6;
        }
        atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
        const atmosMat = new THREE.PointsMaterial({ color: 0x4ff0ff, size: 0.01, transparent: true, opacity: 0.3 });
        const atmos = new THREE.Points(atmosGeo, atmosMat);
        scene.add(atmos);
        atmosphereRef.current = atmos;

        setLoading(false);
        animate();
      };

      // Load Model or Fallback
      loader.load(
        '/models/face.glb',
        (gltf) => {
          if (!isMounted) return;
          let faceMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) faceMesh = child as THREE.Mesh;
          });
          if (faceMesh) createPoints(faceMesh.geometry);
          else setError(true);
        },
        undefined,
        () => {
          if (!isMounted) return;
          console.warn('[Hologram] Face model missing, using procedural matrix');
          createPoints(new THREE.SphereGeometry(1, 64, 64));
        }
      );
    };

    const animate = () => {
      const loop = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        const time = performance.now() * 0.001;
        const points = pointsRef.current;
        if (points) {
          const positions = points.geometry.attributes.position.array as Float32Array;
          const targets = points.geometry.attributes.targetPos.array as Float32Array;
          const meta = points.geometry.attributes.metadata.array as Float32Array;

          // 1. Formation Logic
          if (formationProgress.current < 1) {
            formationProgress.current += 0.008;
          }

          // 2. Speaking Logic
          targetSpeakingValue.current = speaking ? Math.sin(time * 15) * 0.08 : 0;
          currentSpeakingValue.current += (targetSpeakingValue.current - currentSpeakingValue.current) * 0.1;

          // 3. Blink Logic
          if (time - lastBlinkTime.current > 4 + Math.random() * 3) {
            blinkValue.current = 0; // Close
            lastBlinkTime.current = time;
          }
          if (blinkValue.current < 1) blinkValue.current += 0.15;

          // 4. Update Particle Matrix
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            const type = meta[i];

            // Core Interpolation
            const tx = targets[ix];
            let ty = targets[iy];
            let tz = targets[iz];

            // Morphing feature layers
            if (type === 2) { // Mouth
              ty += currentSpeakingValue.current;
              tz += Math.abs(currentSpeakingValue.current) * 0.5;
            }
            if (type === 1) { // Eyes
              const dy = targets[iy] - 0.25; // Eye center Y
              ty = 0.25 + dy * Math.max(0.1, blinkValue.current);
            }

            // Smooth Travel
            positions[ix] += (tx - positions[ix]) * formationProgress.current * 0.15;
            positions[iy] += (ty - positions[iy]) * formationProgress.current * 0.15;
            positions[iz] += (tz - positions[iz]) * formationProgress.current * 0.15;
          }

          points.geometry.attributes.position.needsUpdate = true;
          
          // Subtle Sway
          points.rotation.y = Math.sin(time * 0.5) * 0.04;
          points.position.y = Math.sin(time * 0.8) * 0.05;
        }

        // Atmosphere drift
        if (atmosphereRef.current) {
          atmosphereRef.current.rotation.y += 0.0005;
          atmosphereRef.current.position.y = Math.sin(time * 0.2) * 0.1;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameIdRef.current = requestAnimationFrame(loop);
      };
      loop();
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [active, speaking]);

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-[#050816] rounded-[2rem] overflow-hidden border border-white/5 ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/60 backdrop-blur-xl z-50">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816] z-50">
           <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">!</div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Visual Node Failure</p>
        </div>
      )}
      
      {/* Background Ambience Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-60" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;
