'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Particle Face
 * 
 * CONSTRUCTION: 
 * 1. Loads /models/woman_head.glb
 * 2. Samples 18,000 particles from the actual mesh surface
 * 3. Animates particles from a scattered cloud into a structured face
 * 4. Animates mouth region based on 'speaking' prop via refs
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 18000;
const ATMOSPHERE_COUNT = 250;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Three.js Core Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Animation State Refs
  const speakingRef = useRef(speaking);
  const formationProgress = useRef(0);
  const mouthMovementValue = useRef(0);
  const timeRef = useRef(0);

  // Sync speaking prop to ref to avoid effect triggers
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;

      // 1. Scene Setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
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
        console.error('[Hologram] WebGL init failed', e);
        setError("WEBGL_INIT_FAILED");
        return;
      }

      // 2. Data Loading & Sampling
      const loader = new GLTFLoader();
      
      const createMatrix = (mesh: THREE.Mesh) => {
        const geometry = mesh.geometry;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        geometry.center(); // Center geometry for better rotation/control

        // Normalization scale
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.0 / maxDim; // Normalize to a consistent scene size

        // Setup Sampler
        const sampler = new MeshSurfaceSampler(mesh).build();
        
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
        const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
        const mouthWeights = new Float32Array(PARTICLE_COUNT); // Marks particles for speaking animation

        const tempPos = new THREE.Vector3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sampler.sample(tempPos);
          
          // Apply Scale
          tempPos.multiplyScalar(scale);

          // Store structure position
          targetPositions[i * 3] = tempPos.x;
          targetPositions[i * 3 + 1] = tempPos.y;
          targetPositions[i * 3 + 2] = tempPos.z;

          // Initial Scattered Position
          initialPositions[i * 3] = (Math.random() - 0.5) * 8;
          initialPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;

          // Detect Mouth Region (Heuristic based on Y/Z)
          // woman_head model usually has mouth in center-bottom, front-facing
          const isMouthY = tempPos.y < -0.15 && tempPos.y > -0.5;
          const isMouthX = Math.abs(tempPos.x) < 0.25;
          const isMouthZ = tempPos.z > 0.1;
          
          mouthWeights[i] = (isMouthY && isMouthX && isMouthZ) ? 1.0 : 0.0;
        }

        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
        pointGeometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));
        pointGeometry.setAttribute('mouthWeight', new THREE.BufferAttribute(mouthWeights, 1));

        const material = new THREE.PointsMaterial({
          color: 0x22d3ee, // Nexvoro Cyan
          size: 0.024,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(pointGeometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Position Camera
        camera.position.set(0, 0.2, 8);
        camera.lookAt(0, 0, 0);

        // Atmosphere - Subtle floating drift
        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
        for(let i=0; i<ATMOSPHERE_COUNT; i++) {
          atmosPos[i*3] = (Math.random()-0.5)*10;
          atmosPos[i*3+1] = (Math.random()-0.5)*10;
          atmosPos[i*3+2] = (Math.random()-0.5)*10;
        }
        atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
        const atmos = new THREE.Points(atmosGeo, new THREE.PointsMaterial({ 
          color: 0x4ff0ff, 
          size: 0.015, 
          transparent: true, 
          opacity: 0.25,
          blending: THREE.AdditiveBlending
        }));
        scene.add(atmos);

        setLoading(false);
        animate();
      };

      // Load specific model
      loader.load(
        '/models/woman_head.glb',
        (gltf) => {
          if (!isMounted) return;
          let headMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              headMesh = child as THREE.Mesh;
            }
          });

          if (headMesh) {
            createMatrix(headMesh);
          } else {
            console.error('[Hologram] No mesh found in GLB');
            setError("GEOMETRY_MISSING");
          }
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.error('[Hologram] Model load failed:', err);
          setError("HOLOGRAM LOAD FAILED: Models path or configuration error.");
        }
      );
    };

    const animate = () => {
      const loop = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        const time = performance.now() * 0.001;
        timeRef.current = time;
        const points = pointsRef.current;

        if (points) {
          const positions = points.geometry.attributes.position.array as Float32Array;
          const targets = points.geometry.attributes.targetPos.array as Float32Array;
          const weights = points.geometry.attributes.mouthWeight.array as Float32Array;

          // 1. Formation Sequence (Convergence)
          if (formationProgress.current < 1.0) {
            formationProgress.current += 0.006;
          }

          // 2. Speaking Protocol
          const targetMouthMove = speakingRef.current ? Math.sin(time * 18) * 0.04 : 0;
          mouthMovementValue.current += (targetMouthMove - mouthMovementValue.current) * 0.15;

          // 3. Update Particle Buffer
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

            const tx = targets[ix];
            let ty = targets[iy];
            const tz = targets[iz];

            // Apply speaking warp to mouth particles only
            if (weights[i] > 0) {
              ty += mouthMovementValue.current;
            }

            // Lerp from current position to target based on formation progress
            // Smooth travel + slight noise for sci-fi feel
            const speed = 0.08 * formationProgress.current;
            positions[ix] += (tx - positions[ix]) * speed;
            positions[iy] += (ty - positions[iy]) * speed;
            positions[iz] += (tz - positions[iz]) * speed;
          }

          points.geometry.attributes.position.needsUpdate = true;
          
          // Subtle vertical float + flicker
          points.position.y = Math.sin(time * 0.8) * 0.05;
          points.rotation.y = Math.sin(time * 0.2) * 0.02; // Very minor drift
          
          // Neural Flicker
          if (Math.random() > 0.98) {
            (points.material as THREE.PointsMaterial).opacity = 0.4 + Math.random() * 0.5;
          } else {
            (points.material as THREE.PointsMaterial).opacity += (0.85 - (points.material as THREE.PointsMaterial).opacity) * 0.1;
          }
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
  }, [active]);

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
      className={cn(
        "relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />

      {/* States Overlays */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/60 backdrop-blur-xl z-50">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816] z-50 p-6 text-center">
           <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-2">!</div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{error}</p>
        </div>
      )}
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;