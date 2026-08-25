'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * @fileOverview CandidateHologram - High-fidelity 3D Particle Face.
 * 
 * IMPLEMENTATION PROTOCOL:
 * 1. Loads /models/woman_head.glb strictly.
 * 2. Suppresses texture blob errors as only geometry is required.
 * 3. Samples 18,000 particles from the mesh surface.
 * 4. Normalizes and centers the model to fit the viewport perfectly.
 * 5. Implements smooth formation and vocal-synced mouth movement.
 * 6. ZERO dependencies on undefined helpers like cn() or AnimatePresence.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 18000;
const ATMOSPHERE_COUNT = 150;
const NEXVORO_CYAN = 0x22d3ee;
const FORMATION_SPEED = 0.05;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Three.js Core Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const atmosphereRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Data Refs
  const speakingRef = useRef(speaking);
  const targetPositionsRef = useRef<Float32Array | null>(null);

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

      // 1. SCENE ARCHITECTURE
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      cameraRef.current = camera;
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      rendererRef.current = renderer;

      // 2. MODEL ACQUISITION & ERROR SUPPRESSION
      // Using LoadingManager to ignore texture errors since we only need geometry
      const loadingManager = new THREE.LoadingManager();
      loadingManager.onError = (url) => {
        if (url.startsWith('blob:')) return; 
        console.warn('[Hologram] Load failed (expected for non-geometric nodes):', url);
      };

      const loader = new GLTFLoader(loadingManager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            '/models/woman_head.glb',
            (data) => resolve(data),
            undefined,
            (err) => reject(err)
          );
        });

        if (!isMounted) return;

        // 3. GEOMETRY PROCESSING
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            meshes.push(child);
          }
        });

        if (meshes.length === 0) throw new Error("No mesh nodes detected");

        // Identify main face mesh by vertex volume
        const faceMesh = meshes.reduce((prev, current) => {
          const prevCount = prev.geometry.attributes.position.count;
          const currentCount = current.geometry.attributes.position.count;
          return currentCount > prevCount ? current : prev;
        });

        // Apply world transform and normalize coordinates
        faceMesh.updateMatrixWorld();
        const geometry = faceMesh.geometry.clone();
        geometry.applyMatrix4(faceMesh.matrixWorld);
        
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim; // Calibrate for 75% height fill
        
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.scale(scale, scale, scale);

        // 4. PARTICLE SAMPLING
        const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
        const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
        const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
        const tempPosition = new THREE.Vector3();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          sampler.sample(tempPosition);
          targetPositions[i * 3] = tempPosition.x;
          targetPositions[i * 3 + 1] = tempPosition.y;
          targetPositions[i * 3 + 2] = tempPosition.z;

          // Start from atmospheric scattered cloud
          currentPositions[i * 3] = (Math.random() - 0.5) * 8;
          currentPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
          currentPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }

        targetPositionsRef.current = targetPositions;

        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

        const pointsMat = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.018,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(pointsGeo, pointsMat);
        scene.add(points);
        pointsRef.current = points;

        // 5. ATMOSPHERIC NODES
        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
        for (let i = 0; i < ATMOSPHERE_COUNT; i++) {
          atmosPos[i * 3] = (Math.random() - 0.5) * 6;
          atmosPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
          atmosPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
        const atmosMat = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.005,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
        });
        const atmos = new THREE.Points(atmosGeo, atmosMat);
        scene.add(atmos);
        atmosphereRef.current = atmos;

        setLoading(false);

        // 6. ANIMATION ENGINE
        const animate = () => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isMounted) return;
          const time = performance.now() * 0.001;

          if (pointsRef.current && targetPositionsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            const targetArray = targetPositionsRef.current;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

              // Smooth Formation (Convergence)
              posArray[ix] += (targetArray[ix] - posArray[ix]) * FORMATION_SPEED;
              posArray[iy] += (targetArray[iy] - posArray[iy]) * FORMATION_SPEED;
              posArray[iz] += (targetArray[iz] - posArray[iz]) * FORMATION_SPEED;

              // Neural Shimmer (Individual particle vibration)
              posArray[ix] += (Math.random() - 0.5) * 0.0006;
              posArray[iy] += (Math.random() - 0.5) * 0.0006;

              // Speaking Animation: Subtle localized mouth warp
              // Mouth region roughly Y: -0.2 to -0.6 for normalized models
              if (speakingRef.current) {
                if (targetArray[iy] < -0.25 && targetArray[iy] > -0.55 && Math.abs(targetArray[ix]) < 0.2) {
                   posArray[iy] += Math.sin(time * 20 + i) * 0.0015;
                }
              }
            }
            posAttr.needsUpdate = true;

            // Stable Vertical Float
            pointsRef.current.position.y = Math.sin(time * 0.7) * 0.02;
            
            // Random Hologram Flicker
            if (Math.random() > 0.98) {
              (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.random() * 0.3;
            }
          }

          if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y = time * 0.05;
            atmosphereRef.current.position.y = Math.sin(time * 0.3) * 0.05;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (err) {
        console.error('[Hologram] Critical Node Fault:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    init();

    // Resize Resilience
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // 7. RESOURCE DISPOSAL
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
      if (atmosphereRef.current) {
        atmosphereRef.current.geometry.dispose();
        (atmosphereRef.current.material as THREE.Material).dispose();
      }
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/60 backdrop-blur-xl z-50">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Neural Nodes...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050816]/90 z-50 p-6 text-center">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-2">!</div>
           <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest leading-tight">Visual Node Failure</p>
           <p className="text-[9px] text-white/30 uppercase tracking-widest">Model load aborted</p>
        </div>
      )}

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;
