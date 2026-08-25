'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

const TOTAL_PARTICLE_COUNT = 70000;
const ATMOS_PARTICLE_COUNT = 1800;
const FORMATION_DURATION = 2200; // ms
const NEXVORO_CYAN = 0x22d3ee;

// Easing for professional convergence
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className,
  isLoader = false
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const atmosRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const startPositionsRef = useRef<Float32Array | null>(null);
  const mouthMaskRef = useRef<Uint8Array | null>(null);
  const formationStartTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef(speaking);

  useEffect(() => {
    isSpeakingRef.current = speaking;
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

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
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

      const manager = new THREE.LoadingManager();
      manager.onError = (url) => console.warn('[Hologram] Resource load suppressed, geometry still extracted:', url);
      const loader = new GLTFLoader(manager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        gltf.scene.updateMatrixWorld(true);
        
        const validMeshes: { mesh: THREE.Mesh, weight: number, group: string }[] = [];
        const combinedGeometries: THREE.BufferGeometry[] = [];

        gltf.scene.traverse((node: any) => {
          if (node.isMesh && node.geometry) {
            const lowerName = (node.name || '').toLowerCase();
            
            if (/eyeball|cornea|iris|pupil|sclera|teeth|tongue|inner|mouth_interior/.test(lowerName)) return;

            let group: 'face' | 'hair' | 'details' | 'body' | null = null;
            
            if (/hair|scalp|fringe|bang|ponytail|braid|wolf3d_hair/.test(lowerName)) {
              group = 'hair';
            } else if (/eyebrow|brow|eyelash|lash/.test(lowerName)) {
              group = 'details';
            } else if (/face|head|facial/.test(lowerName)) {
              group = 'face';
            } else if (/skin|body|neck|character|base|geo/.test(lowerName)) {
              group = 'body';
            }

            if (group) {
              const geometry = node.geometry.clone();
              geometry.applyMatrix4(node.matrixWorld);
              const bakedMesh = new THREE.Mesh(geometry);
              
              // Budget weights: Prioritize face and high-detail regions
              let weight = 1.0;
              if (group === 'face') weight = 5.0; // Core face density boost
              if (group === 'hair') weight = 1.5; 
              if (group === 'details') weight = 2.5; // Eyelids, Brows, Lips
              if (group === 'body') weight = 1.0; // Neck and shoulders lower density

              validMeshes.push({ mesh: bakedMesh, weight, group });
              combinedGeometries.push(geometry);
            }
          }
        });

        if (validMeshes.length === 0) throw new Error('Neural extraction failed: No viable meshes detected.');

        const totalWeight = validMeshes.reduce((sum, m) => sum + m.weight, 0);
        const targetPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const startPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const mouthMask = new Uint8Array(TOTAL_PARTICLE_COUNT);
        const tempVec = new THREE.Vector3();
        
        // Bounding calculation for normalization
        const box = new THREE.Box3();
        combinedGeometries.forEach(g => {
          g.computeBoundingBox();
          if (g.boundingBox) box.union(g.boundingBox);
        });
        const center = new THREE.Vector3();
        box.getCenter(center);
        const heightVal = box.max.y - box.min.y;
        const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 5;
        const scale = (visibleHeight * 0.8) / heightVal;

        let sampledCount = 0;
        validMeshes.forEach(({ mesh, weight, group }) => {
          const sampler = new MeshSurfaceSampler(mesh).build();
          const baseCount = Math.floor((weight / totalWeight) * TOTAL_PARTICLE_COUNT);
          
          for (let i = 0; i < baseCount; i++) {
            if (sampledCount >= TOTAL_PARTICLE_COUNT) break;
            sampler.sample(tempVec);
            
            // Apply normalization immediately
            tempVec.sub(center).multiplyScalar(scale);

            // 1. Feature Zone Density Boost (Nose, Lips, Eye sockets)
            // Centered face coordinates: X:[-0.2, 0.2], Y:[-0.1, 0.3], Z:[0.2, 0.5]
            const inFeatureZone = (group === 'face' || group === 'details') && 
                                Math.abs(tempVec.x) < 0.22 && 
                                tempVec.y > -0.3 && tempVec.y < 0.3 &&
                                tempVec.z > 0.15;

            // If in feature zone, we might duplicate or bias (simulated here by accepting more)
            // But Area-Weighted sampling is fixed. We instead just fill the buffer.
            
            const idx = sampledCount * 3;
            targetPositions[idx] = tempVec.x;
            targetPositions[idx+1] = tempVec.y;
            targetPositions[idx+2] = tempVec.z;
            
            // Start scattered
            startPositions[idx] = tempVec.x + (Math.random() - 0.5) * 6;
            startPositions[idx+1] = tempVec.y + (Math.random() - 0.5) * 6;
            startPositions[idx+2] = tempVec.z + (Math.random() - 0.5) * 4;
            
            // Mouth region detection for speaking animation (heuristic)
            if (Math.abs(tempVec.x) < 0.2 && tempVec.y < -0.15 && tempVec.y > -0.5 && tempVec.z > 0.2) {
              mouthMask[sampledCount] = 1;
            }
            
            sampledCount++;
          }
        });

        // Fill remaining buffer with feature-boost points if necessary
        while (sampledCount < TOTAL_PARTICLE_COUNT) {
          const randomIdx = Math.floor(Math.random() * sampledCount);
          const px = targetPositions[randomIdx * 3];
          const py = targetPositions[randomIdx * 3 + 1];
          const pz = targetPositions[randomIdx * 3 + 2];
          
          // Only duplicate points near central features to increase apparent density
          if (Math.abs(px) < 0.25 && py > -0.4 && py < 0.35 && pz > 0.15) {
             const idx = sampledCount * 3;
             targetPositions[idx] = px + (Math.random() - 0.5) * 0.002;
             targetPositions[idx+1] = py + (Math.random() - 0.5) * 0.002;
             targetPositions[idx+2] = pz + (Math.random() - 0.5) * 0.002;
             
             startPositions[idx] = px + (Math.random() - 0.5) * 4;
             startPositions[idx+1] = py + (Math.random() - 0.5) * 4;
             startPositions[idx+2] = pz + (Math.random() - 0.5) * 3;
             
             sampledCount++;
          } else if (Math.random() > 0.8) { // Safety filler
             const idx = sampledCount * 3;
             const sIdx = Math.floor(Math.random() * sampledCount) * 3;
             targetPositions[idx] = targetPositions[sIdx];
             targetPositions[idx+1] = targetPositions[sIdx+1];
             targetPositions[idx+2] = targetPositions[sIdx+2];
             startPositions[idx] = targetPositions[idx] + (Math.random() - 0.5) * 2;
             startPositions[idx+1] = targetPositions[idx+1] + (Math.random() - 0.5) * 2;
             startPositions[idx+2] = targetPositions[idx+2] + (Math.random() - 0.5) * 2;
             sampledCount++;
          } else {
             // Just duplicate any
             const sIdx = Math.floor(Math.random() * sampledCount) * 3;
             const idx = sampledCount * 3;
             targetPositions[idx] = targetPositions[sIdx];
             targetPositions[idx+1] = targetPositions[sIdx+1];
             targetPositions[idx+2] = targetPositions[sIdx+2];
             startPositions[idx] = targetPositions[idx];
             startPositions[idx+1] = targetPositions[idx+1];
             startPositions[idx+2] = targetPositions[idx+2];
             sampledCount++;
          }
        }

        targetPositionsRef.current = targetPositions;
        startPositionsRef.current = startPositions;
        mouthMaskRef.current = mouthMask;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(startPositions), 3));
        const material = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.006,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(ATMOS_PARTICLE_COUNT * 3);
        for (let i = 0; i < ATMOS_PARTICLE_COUNT; i++) {
          atmosPos[i*3] = (Math.random() - 0.5) * 10;
          atmosPos[i*3+1] = (Math.random() - 0.5) * 10;
          atmosPos[i*3+2] = (Math.random() - 0.5) * 6;
        }
        atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
        const atmosMat = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.004,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
        });
        const atmos = new THREE.Points(atmosGeo, atmosMat);
        scene.add(atmos);
        atmosRef.current = atmos;

        formationStartTimeRef.current = performance.now();
        setLoading(false);

        const animate = (time: number) => {
          if (!isMounted || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
          
          const elapsed = time - formationStartTimeRef.current;
          const formationProgress = Math.min(elapsed / FORMATION_DURATION, 1);
          const easedProgress = easeOutCubic(formationProgress);

          if (pointsRef.current && targetPositionsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            const targets = targetPositionsRef.current;
            const starts = startPositionsRef.current!;
            const masks = mouthMaskRef.current!;
            const isSpeaking = isSpeakingRef.current;
            const timeSec = time * 0.001;

            for (let i = 0; i < TOTAL_PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

              if (formationProgress < 1) {
                posArray[ix] = starts[ix] + (targets[ix] - starts[ix]) * easedProgress;
                posArray[iy] = starts[iy] + (targets[iy] - starts[iy]) * easedProgress;
                posArray[iz] = starts[iz] + (targets[iz] - starts[iz]) * easedProgress;
              } else {
                // Stabilized Idle Jitter
                posArray[ix] = targets[ix] + Math.sin(timeSec * 0.4 + i * 0.1) * 0.0005;
                posArray[iy] = targets[iy] + Math.cos(timeSec * 0.3 + i * 0.1) * 0.0005;
                posArray[iz] = targets[iz];

                // Vocal Matrix Response
                if (isSpeaking && masks[i]) {
                  posArray[iy] += Math.sin(timeSec * 14 + i) * 0.004;
                }
              }
            }
            posAttr.needsUpdate = true;
          }

          if (atmosRef.current) {
            const atmosArray = atmosRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < ATMOS_PARTICLE_COUNT; i++) {
              atmosArray[i*3 + 1] += 0.0015; 
              if (atmosArray[i*3 + 1] > 5) atmosArray[i*3 + 1] = -5;
            }
            atmosRef.current.geometry.attributes.position.needsUpdate = true;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };

        animate(performance.now());

      } catch (err) {
        console.error('[Hologram System] Fatal failure:', err);
        if (isMounted) setError(true);
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
      if (atmosRef.current) {
        atmosRef.current.geometry.dispose();
        (atmosRef.current.material as THREE.Material).dispose();
      }
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {(loading || isLoader) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#050816]/80 backdrop-blur-xl z-50">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Neural Persona...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/90 z-50 p-12 text-center">
           <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
           </div>
           <div className="space-y-1">
             <p className="text-sm font-bold text-white uppercase tracking-widest">Neural Link Offline</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">Identity nodes could not be synthesized for this session.</p>
           </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.08)_0%,_transparent_75%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;
