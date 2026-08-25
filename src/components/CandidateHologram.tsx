'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Human Particle Face.
 * Samples geometry from /models/woman_head.glb to create a realistic hologram.
 * Features neural formation, subtle sway, and vocal-sync mouth movement.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 15000;
const FORMATION_SPEED = 0.04;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for Three.js objects to avoid re-renders
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Ref for speaking state to use inside the animation loop
  const speakingRef = useRef(speaking);
  const formationProgress = useRef(0);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // 1. Scene Setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      rendererRef.current = renderer;

      // 2. Load Model & Sample
      const loader = new GLTFLoader();
      
      loader.load(
        '/models/woman_head.glb',
        (gltf) => {
          if (!isMounted) return;

          const meshes: THREE.Mesh[] = [];
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              meshes.push(child as THREE.Mesh);
            }
          });

          if (meshes.length === 0) {
            setError("No geometry found in visual archive.");
            return;
          }

          // Calculate bounding box for normalization
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 3.5 / maxDim; // Normalized scale

          // Sampling Logic
          const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
          const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
          const mouthWeights = new Float32Array(PARTICLE_COUNT); // To identify mouth particles

          const tempPos = new THREE.Vector3();
          const sampler = new MeshSurfaceSampler(meshes[0]).build(); // Sample from main head mesh

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            sampler.sample(tempPos);
            
            // Normalize and center
            tempPos.sub(center).multiplyScalar(scale);

            targetPositions[i * 3] = tempPos.x;
            targetPositions[i * 3 + 1] = tempPos.y;
            targetPositions[i * 3 + 2] = tempPos.z;

            // Initial scattered positions
            currentPositions[i * 3] = tempPos.x + (Math.random() - 0.5) * 5;
            currentPositions[i * 3 + 1] = tempPos.y + (Math.random() - 0.5) * 5;
            currentPositions[i * 3 + 2] = tempPos.z + (Math.random() - 0.5) * 5;

            // Heuristic for mouth identification (relative to centered normalized head)
            // Mouth is usually in the lower center region
            if (tempPos.y < -0.15 && tempPos.y > -0.6 && Math.abs(tempPos.x) < 0.35 && tempPos.z > 0.1) {
              mouthWeights[i] = 1.0;
            } else {
              mouthWeights[i] = 0.0;
            }
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
          geometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));
          geometry.setAttribute('mouthWeight', new THREE.BufferAttribute(mouthWeights, 1));

          const material = new THREE.PointsMaterial({
            color: 0x22d3ee,
            size: 0.012,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });

          const points = new THREE.Points(geometry, material);
          scene.add(points);
          pointsRef.current = points;

          camera.position.set(0, 0, 7.5);
          camera.lookAt(0, 0, 0);

          setLoading(false);
          animate();
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.error('[Hologram] Load failed:', err);
          setError("Visual Node Failure: Archive inaccessible.");
          setLoading(false);
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
          const weights = points.geometry.attributes.mouthWeight.array as Float32Array;

          if (formationProgress.current < 1.0) {
            formationProgress.current += 0.005;
          }

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            
            // 1. Converge to target
            const tx = targets[ix];
            let ty = targets[iy];
            const tz = targets[iz];

            // 2. Add speaking animation (mouth jitter)
            if (speakingRef.current && weights[i] > 0) {
              ty += Math.sin(time * 20 + i) * 0.02;
            }

            // Interpolate
            const lerpFactor = FORMATION_SPEED;
            positions[ix] += (tx - positions[ix]) * lerpFactor;
            positions[iy] += (ty - positions[iy]) * lerpFactor;
            positions[iz] += (tz - positions[iz]) * lerpFactor;
          }

          points.geometry.attributes.position.needsUpdate = true;
          
          // Subtle Sway & Float
          points.rotation.y = Math.sin(time * 0.5) * 0.02;
          points.position.y = Math.sin(time * 0.8) * 0.015;

          // Neural Flicker
          if (Math.random() > 0.98) {
            (points.material as THREE.PointsMaterial).opacity = 0.4 + Math.random() * 0.4;
          } else {
            (points.material as THREE.PointsMaterial).opacity += (0.75 - (points.material as THREE.PointsMaterial).opacity) * 0.1;
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
      if (rendererRef.current) rendererRef.current.dispose();
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
      className={`relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.03)_0%,_transparent_70%)]" />

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
      
      {/* Subtle scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;