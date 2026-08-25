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

const TOTAL_PARTICLE_COUNT = 55000;
const ATMOS_PARTICLE_COUNT = 1500;
const FORMATION_DURATION = 2000; // ms
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

      // Loading Manager to handle texture errors without aborting geometry extraction
      const manager = new THREE.LoadingManager();
      manager.onError = (url) => console.warn('[Hologram] Resource load suppressed, geometry still extracted:', url);
      const loader = new GLTFLoader(manager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        gltf.scene.updateMatrixWorld(true);
        
        const validMeshes: { mesh: THREE.Mesh, weight: number }[] = [];
        const combinedGeometries: THREE.BufferGeometry[] = [];

        gltf.scene.traverse((node: any) => {
          if (node.isMesh && node.geometry) {
            const lowerName = (node.name || '').toLowerCase();
            
            // 1. Filter out internal nodes or over-bright artifacts
            if (/eyeball|cornea|iris|pupil|sclera|teeth|tongue|inner|mouth_interior/.test(lowerName)) return;

            // 2. Classify meshes to ensure hair rendering and face density
            let group: 'face' | 'hair' | 'details' | null = null;
            
            if (/hair|scalp|fringe|bang|ponytail|braid|wolf3d_hair/.test(lowerName)) {
              group = 'hair';
            } else if (/eyebrow|brow|eyelash|lash/.test(lowerName)) {
              group = 'details';
            } else if (/face|head|skin|body|neck|facial|character|base|geo/.test(lowerName)) {
              group = 'face';
            }

            if (group) {
              // 3. Bake world transforms into local geometry for accurate cross-mesh alignment
              const geometry = node.geometry.clone();
              geometry.applyMatrix4(node.matrixWorld);
              const bakedMesh = new THREE.Mesh(geometry);
              
              let weight = 1.0;
              if (group === 'face') weight = 2.0;
              if (group === 'hair') weight = 1.5;
              if (group === 'details') weight = 0.5;

              validMeshes.push({ mesh: bakedMesh, weight });
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
        
        let sampledCount = 0;
        validMeshes.forEach(({ mesh, weight }) => {
          const sampler = new MeshSurfaceSampler(mesh).build();
          const count = Math.floor((weight / totalWeight) * TOTAL_PARTICLE_COUNT);
          
          for (let i = 0; i < count; i++) {
            if (sampledCount >= TOTAL_PARTICLE_COUNT) break;
            sampler.sample(tempVec);
            
            const idx = sampledCount * 3;
            targetPositions[idx] = tempVec.x;
            targetPositions[idx+1] = tempVec.y;
            targetPositions[idx+2] = tempVec.z;
            
            // Random start dispersion for formation effect
            startPositions[idx] = (Math.random() - 0.5) * 8;
            startPositions[idx+1] = (Math.random() - 0.5) * 8;
            startPositions[idx+2] = (Math.random() - 0.5) * 4;
            
            sampledCount++;
          }
        });

        // 4. Volumetric Normalization
        const box = new THREE.Box3();
        combinedGeometries.forEach(g => {
          g.computeBoundingBox();
          if (g.boundingBox) box.union(g.boundingBox);
        });

        const center = new THREE.Vector3();
        box.getCenter(center);
        const heightVal = box.max.y - box.min.y;
        
        // Calculate target scale relative to FOV
        const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * 5;
        const scale = (visibleHeight * 0.78) / heightVal;

        for (let i = 0; i < sampledCount; i++) {
          targetPositions[i*3] = (targetPositions[i*3] - center.x) * scale;
          targetPositions[i*3+1] = (targetPositions[i*3+1] - center.y) * scale;
          targetPositions[i*3+2] = (targetPositions[i*3+2] - center.z) * scale;
          
          // Heuristic lip-region masking for vocal displacement
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

        // Atmosphere drift nodes
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
          opacity: 0.15,
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
                // Initial Convergence
                posArray[ix] = starts[ix] + (targets[ix] - starts[ix]) * easedProgress;
                posArray[iy] = starts[iy] + (targets[iy] - starts[iy]) * easedProgress;
                posArray[iz] = starts[iz] + (targets[iz] - starts[iz]) * easedProgress;
              } else {
                // Stabilized Idle Jitter
                posArray[ix] = targets[ix] + Math.sin(timeSec * 0.6 + i) * 0.0006;
                posArray[iy] = targets[iy] + Math.cos(timeSec * 0.4 + i) * 0.0006;
                posArray[iz] = targets[iz];

                // Vocal Matrix Response
                if (isSpeaking && masks[i]) {
                  posArray[iy] += Math.sin(timeSec * 16 + i) * 0.0045;
                }
              }
            }
            posAttr.needsUpdate = true;
          }

          if (atmosRef.current) {
            const atmosArray = atmosRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < ATMOS_PARTICLE_COUNT; i++) {
              atmosArray[i*3 + 1] += 0.002; 
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
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Visual Identity...</p>
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;