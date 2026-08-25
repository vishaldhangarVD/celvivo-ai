'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Human Particle Reconstruction.
 * Synthesizes FACE + HAIR from /models/woman_head.glb.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 20000;
const ATMOSPHERE_COUNT = 150;
const NEXVORO_CYAN = 0x22d3ee;
const FORMATION_SPEED = 0.04;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const atmosphereRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
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

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      cameraRef.current = camera;
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      rendererRef.current = renderer;

      // 1. Texture-Safe Loading Protocol
      const loadingManager = new THREE.LoadingManager();
      loadingManager.onError = () => {}; // Suppress texture blob errors as we only need geometry

      const loader = new GLTFLoader(loadingManager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        // 2. Mesh Classification: Face vs. Hair/Silhouette
        const skinMeshes: THREE.Mesh[] = [];
        const hairMeshes: THREE.Mesh[] = [];
        const totalBox = new THREE.Box3();

        gltf.scene.traverse((node: any) => {
          if (node.isMesh) {
            const name = (node.name || '').toLowerCase();
            const isHair = name.includes('hair') || name.includes('brow') || name.includes('lash');
            const isMouthInterior = name.includes('teeth') || name.includes('tongue');
            
            if (isMouthInterior) return;

            // Compute world-space bounds for normalization
            node.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(node);
            totalBox.union(box);

            if (isHair) {
              hairMeshes.push(node);
            } else {
              skinMeshes.push(node);
            }
          }
        });

        if (skinMeshes.length === 0 && hairMeshes.length === 0) throw new Error("No geometry nodes");

        // 3. Volumetric Normalization
        const center = new THREE.Vector3();
        totalBox.getCenter(center);
        const size = new THREE.Vector3();
        totalBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.2 / maxDim;

        // 4. Weighted Particle Sampling (Face Priority)
        const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
        const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
        const tempPosition = new THREE.Vector3();

        // Distribution: 75% Face (15k), 25% Hair (5k)
        const faceTarget = Math.floor(PARTICLE_COUNT * 0.75);
        const hairTarget = PARTICLE_COUNT - faceTarget;

        let sampledCount = 0;

        const sampleGroup = (meshes: THREE.Mesh[], target: number) => {
          if (meshes.length === 0) return;
          const countPerMesh = Math.floor(target / meshes.length);
          
          meshes.forEach((mesh) => {
            const sampler = new MeshSurfaceSampler(mesh).build();
            for (let i = 0; i < countPerMesh; i++) {
              if (sampledCount >= PARTICLE_COUNT) break;
              
              sampler.sample(tempPosition);
              tempPosition.applyMatrix4(mesh.matrixWorld);
              tempPosition.sub(center);
              tempPosition.multiplyScalar(scale);

              const idx = sampledCount * 3;
              targetPositions[idx] = tempPosition.x;
              targetPositions[idx + 1] = tempPosition.y;
              targetPositions[idx + 2] = tempPosition.z;

              // Scatter atmospheric cloud
              currentPositions[idx] = (Math.random() - 0.5) * 6;
              currentPositions[idx + 1] = (Math.random() - 0.5) * 6;
              currentPositions[idx + 2] = (Math.random() - 0.5) * 6;
              
              sampledCount++;
            }
          });
        };

        sampleGroup(skinMeshes, faceTarget);
        sampleGroup(hairMeshes, hairTarget);

        targetPositionsRef.current = targetPositions;

        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

        const pointsMat = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.014,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(pointsGeo, pointsMat);
        scene.add(points);
        pointsRef.current = points;

        // 5. Ambient Atmosphere
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
          size: 0.006,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
        });
        const atmos = new THREE.Points(atmosGeo, atmosMat);
        scene.add(atmos);
        atmosphereRef.current = atmos;

        setLoading(false);

        // 6. Neural Animation Loop
        const animate = () => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isMounted) return;
          const time = performance.now() * 0.001;

          if (pointsRef.current && targetPositionsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            const targetArray = targetPositionsRef.current;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

              // Smooth Formation Convergence
              posArray[ix] += (targetArray[ix] - posArray[ix]) * FORMATION_SPEED;
              posArray[iy] += (targetArray[iy] - posArray[iy]) * FORMATION_SPEED;
              posArray[iz] += (targetArray[iz] - posArray[iz]) * FORMATION_SPEED;

              // Vocal Matrix: Mouth region displacement
              if (speakingRef.current) {
                // Heuristic for mouth region in normalized coordinates
                if (targetArray[iy] < -0.2 && targetArray[iy] > -0.5 && Math.abs(targetArray[ix]) < 0.25) {
                   posArray[iy] += Math.sin(time * 20 + i) * 0.0015;
                }
              }

              // Subtle Neural Flicker
              posArray[ix] += (Math.random() - 0.5) * 0.0005;
              posArray[iy] += (Math.random() - 0.5) * 0.0005;
            }
            posAttr.needsUpdate = true;

            // Cinematic Vertical Float
            pointsRef.current.position.y = Math.sin(time * 0.6) * 0.015;
            
            // Random Hologram Static
            if (Math.random() > 0.98) {
              (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.random() * 0.4;
            } else {
              (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.85;
            }
          }

          if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y = time * 0.04;
            atmosphereRef.current.position.y = Math.sin(time * 0.3) * 0.05;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (err) {
        console.error('[Hologram] System Fault:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    init();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current) rendererRef.current.dispose();
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
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Identity Matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050816]/90 z-50 p-6 text-center">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-2">!</div>
           <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest leading-tight">Visual Protocol Failure</p>
           <p className="text-[9px] text-white/30 uppercase tracking-widest">Unable to synthesize head geometry</p>
        </div>
      )}

      {/* Holographic Overlay FX */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;
