'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const TOTAL_PARTICLE_COUNT = 55000;
const ATMOS_PARTICLE_COUNT = 1500;
const FORMATION_DURATION = 2000; // ms
const NEXVORO_CYAN = 0x22d3ee;

// Easing function for smooth convergence
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

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

      const loadingManager = new THREE.LoadingManager();
      // Ignore texture errors for particle sampling
      loadingManager.onError = (url) => console.warn(`Suppressed texture load error: ${url}`);
      const loader = new GLTFLoader(loadingManager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        gltf.scene.updateMatrixWorld(true);
        
        const groups = {
          face: [] as THREE.Mesh[],
          hair: [] as THREE.Mesh[],
          details: [] as THREE.Mesh[]
        };

        gltf.scene.traverse((node: any) => {
          if (node.isMesh && node.geometry) {
            const name = (node.name || '').toLowerCase();
            const matName = (node.material?.name || '').toLowerCase();
            
            // EXCLUSION PROTOCOL: No glowing balls/teeth
            const isExclude = /eye|ball|cornea|iris|pupil|sclera|teeth|tongue|lens/.test(name) || 
                              /eye|cornea|iris|pupil|teeth/.test(matName);
            if (isExclude) return;

            if (/hair|bang|fringe/.test(name)) groups.hair.push(node);
            else if (/eyebrow|brow|eyelash|eyelid|lash/.test(name)) groups.details.push(node);
            else groups.face.push(node);
          }
        });

        const targetPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const startPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const mouthMask = new Uint8Array(TOTAL_PARTICLE_COUNT);
        const tempVec = new THREE.Vector3();
        
        let sampledCount = 0;
        const quotas = {
          face: Math.floor(TOTAL_PARTICLE_COUNT * 0.60),
          hair: Math.floor(TOTAL_PARTICLE_COUNT * 0.30),
          details: Math.floor(TOTAL_PARTICLE_COUNT * 0.10)
        };

        // Sampling Logic
        const sampleGroup = (meshes: THREE.Mesh[], quota: number) => {
          if (meshes.length === 0 || quota <= 0) return;
          
          // Create a temporary combined mesh for group sampling
          const combinedGeos: THREE.BufferGeometry[] = [];
          meshes.forEach(m => {
            const g = m.geometry.clone();
            g.applyMatrix4(m.matrixWorld);
            combinedGeos.push(g);
          });
          
          const merged = THREE.BufferGeometryUtils ? (THREE as any).BufferGeometryUtils.mergeGeometries(combinedGeos) : combinedGeos[0];
          const sampler = new MeshSurfaceSampler(new THREE.Mesh(merged)).build();
          
          for (let i = 0; i < quota; i++) {
            if (sampledCount >= TOTAL_PARTICLE_COUNT) break;
            sampler.sample(tempVec);
            const idx = sampledCount * 3;
            targetPositions[idx] = tempVec.x;
            targetPositions[idx+1] = tempVec.y;
            targetPositions[idx+2] = tempVec.z;
            
            // Random start point in atmosphere
            startPositions[idx] = (Math.random() - 0.5) * 8;
            startPositions[idx+1] = (Math.random() - 0.5) * 8;
            startPositions[idx+2] = (Math.random() - 0.5) * 5;
            
            sampledCount++;
          }
          
          if (merged !== combinedGeos[0]) merged.dispose();
          combinedGeos.forEach(g => g.dispose());
        };

        sampleGroup(groups.face, quotas.face);
        sampleGroup(groups.hair, quotas.hair);
        sampleGroup(groups.details, quotas.details);

        // Normalize & Scale
        const box = new THREE.Box3();
        for (let i = 0; i < sampledCount; i++) {
          tempVec.set(targetPositions[i*3], targetPositions[i*3+1], targetPositions[i*3+2]);
          box.expandByPoint(tempVec);
        }
        const center = new THREE.Vector3();
        box.getCenter(center);
        const headHeight = box.max.y - box.min.y;
        
        // Calculate visible height at camera distance 5
        const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 5;
        const scale = (visibleHeight * 0.8) / headHeight;

        for (let i = 0; i < sampledCount; i++) {
          targetPositions[i*3] = (targetPositions[i*3] - center.x) * scale;
          targetPositions[i*3+1] = (targetPositions[i*3+1] - center.y) * scale;
          targetPositions[i*3+2] = (targetPositions[i*3+2] - center.z) * scale;
          
          // Precompute mouth mask (Rough heuristic based on normalized head coords)
          // X near center, Y between chin and nose
          const nx = targetPositions[i*3];
          const ny = targetPositions[i*3+1];
          if (Math.abs(nx) < 0.25 && ny < -0.2 && ny > -0.6) {
            mouthMask[i] = 1;
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
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Atmosphere System
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
          size: 0.003,
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

          if (pointsRef.current && targetPositionsRef.current && startPositionsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            const targets = targetPositionsRef.current;
            const starts = startPositionsRef.current;
            const masks = mouthMaskRef.current!;
            const isSpeaking = isSpeakingRef.current;
            const tSeconds = time * 0.001;

            for (let i = 0; i < TOTAL_PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

              if (formationProgress < 1) {
                // Convergence Phase
                posArray[ix] = starts[ix] + (targets[ix] - starts[ix]) * easedProgress;
                posArray[iy] = starts[iy] + (targets[iy] - starts[iy]) * easedProgress;
                posArray[iz] = starts[iz] + (targets[iz] - starts[iz]) * easedProgress;
              } else {
                // Stable / Animation Phase
                posArray[ix] = targets[ix];
                posArray[iy] = targets[iy] + Math.sin(tSeconds * 0.4 + i * 0.1) * 0.002; // Idle float
                posArray[iz] = targets[iz];

                // Vocal Matrix Displacement
                if (isSpeaking && masks[i]) {
                  posArray[iy] += Math.sin(tSeconds * 12 + i) * 0.005;
                }
              }
            }
            posAttr.needsUpdate = true;
          }

          if (atmosRef.current) {
            const atmosPos = atmosRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < ATMOS_PARTICLE_COUNT; i++) {
              atmosPos[i*3 + 1] += 0.001; // Slow drift up
              if (atmosPos[i*3 + 1] > 5) atmosPos[i*3 + 1] = -5;
            }
            atmosRef.current.geometry.attributes.position.needsUpdate = true;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };

        animate(performance.now());

      } catch (err) {
        console.error('[Hologram Engine] Critical Fault:', err);
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
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#050816]/80 backdrop-blur-xl z-50">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Identity matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/90 z-50 p-12 text-center">
           <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <div className="space-y-1">
             <p className="text-sm font-bold text-white uppercase tracking-widest">Neural Link Failure</p>
             <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">Unable to synthesize visual nodes for this session.</p>
           </div>
        </div>
      )}

      {/* Cinematic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;