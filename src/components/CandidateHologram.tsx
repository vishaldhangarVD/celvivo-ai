'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Loader2, AlertCircle } from 'lucide-react';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const TOTAL_PARTICLE_COUNT = 18000;
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
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const atmosphereRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
  // Use a ref for speaking state to prevent re-initializing the whole Three.js scene
  const speakingRef = useRef(speaking);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const originalTargetsRef = useRef<Float32Array | null>(null);

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

      const loader = new GLTFLoader();

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        // 1. Traverse and extract all valid geometry
        gltf.scene.updateMatrixWorld(true);
        const validMeshes: { mesh: THREE.Mesh; weight: number }[] = [];
        
        gltf.scene.traverse((node: any) => {
          if (node.isMesh && node.geometry) {
            const name = (node.name || '').toLowerCase();
            const matName = node.material?.name?.toLowerCase() || '';
            
            // EXCLUDE eyeball meshes to avoid "giant glowing white ball" effect
            const isEyeball = name.includes('eye') || name.includes('ball') || name.includes('pupil') || 
                             name.includes('iris') || name.includes('cornea') || name.includes('sclera') ||
                             matName.includes('eye') || matName.includes('cornea');
            
            if (isEyeball) return;

            // Prioritize face and hair meshes
            let weight = 1.0;
            if (name.includes('face') || name.includes('head') || name.includes('skin')) weight = 2.0;
            if (name.includes('hair')) weight = 1.5;

            validMeshes.push({ mesh: node, weight });
          }
        });

        if (validMeshes.length === 0) throw new Error("No valid head geometry detected");

        // 2. Sample points from all valid meshes
        const targetPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const currentPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const tempVec = new THREE.Vector3();
        
        const totalWeight = validMeshes.reduce((acc, m) => acc + m.weight, 0);
        let sampledCount = 0;

        validMeshes.forEach(({ mesh, weight }) => {
          const quota = Math.floor((weight / totalWeight) * TOTAL_PARTICLE_COUNT);
          
          // Geometry needs to be sampled in world space
          const clonedGeo = mesh.geometry.clone();
          clonedGeo.applyMatrix4(mesh.matrixWorld);
          const tempMesh = new THREE.Mesh(clonedGeo);
          const sampler = new MeshSurfaceSampler(tempMesh).build();
          
          for (let i = 0; i < quota; i++) {
            if (sampledCount >= TOTAL_PARTICLE_COUNT) break;
            
            sampler.sample(tempVec);
            const idx = sampledCount * 3;
            targetPositions[idx] = tempVec.x;
            targetPositions[idx+1] = tempVec.y;
            targetPositions[idx+2] = tempVec.z;
            
            // Initial scatter
            currentPositions[idx] = (Math.random() - 0.5) * 10;
            currentPositions[idx+1] = (Math.random() - 0.5) * 10;
            currentPositions[idx+2] = (Math.random() - 0.5) * 10;
            
            sampledCount++;
          }
          clonedGeo.dispose();
        });

        // 3. Global Volumetric Normalization
        const box = new THREE.Box3();
        for(let i=0; i<sampledCount; i++) {
          tempVec.set(targetPositions[i*3], targetPositions[i*3+1], targetPositions[i*3+2]);
          box.expandByPoint(tempVec);
        }

        const center = new THREE.Vector3();
        box.getCenter(center);
        const heightVal = box.max.y - box.min.y;
        const scale = 2.8 / heightVal; // Normalized height for framing

        for (let i = 0; i < sampledCount; i++) {
          targetPositions[i * 3] = (targetPositions[i * 3] - center.x) * scale;
          targetPositions[i * 3 + 1] = (targetPositions[i * 3 + 1] - center.y) * scale;
          targetPositions[i * 3 + 2] = (targetPositions[i * 3 + 2] - center.z) * scale;
        }

        targetPositionsRef.current = targetPositions;
        originalTargetsRef.current = new Float32Array(targetPositions);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

        const material = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.012,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Subtle Atmospheric Particles
        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(200 * 3);
        for (let i = 0; i < 200; i++) {
          atmosPos[i * 3] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
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

        const animate = () => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isMounted) return;
          const time = performance.now() * 0.001;

          if (pointsRef.current && targetPositionsRef.current && originalTargetsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            const targets = targetPositionsRef.current;
            const originals = originalTargetsRef.current;

            for (let i = 0; i < TOTAL_PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

              // Smooth formation convergence
              posArray[ix] += (targets[ix] - posArray[ix]) * FORMATION_SPEED;
              posArray[iy] += (targets[iy] - posArray[iy]) * FORMATION_SPEED;
              posArray[iz] += (targets[iz] - posArray[iz]) * FORMATION_SPEED;

              // Speaking Vocal Matrix Animation
              if (speakingRef.current) {
                // Target approximate mouth region in normalized coordinates
                const isMouth = Math.abs(originals[ix]) < 0.2 && originals[iy] < -0.15 && originals[iy] > -0.45;
                if (isMouth) {
                  posArray[iy] += Math.sin(time * 15 + i) * 0.003;
                }
              }

              // Subtle neural shimmer
              posArray[ix] += (Math.random() - 0.5) * 0.001;
              posArray[iy] += (Math.random() - 0.5) * 0.001;
            }
            posAttr.needsUpdate = true;

            // Stable vertical floating movement
            pointsRef.current.position.y = Math.sin(time * 0.6) * 0.02;
          }

          if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y = time * 0.05;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };

        animate();

      } catch (err) {
        console.error('[CandidateHologram] Critical Protocol Fault:', err);
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
          <Loader2 className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Identity matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050816]/90 z-50 p-6 text-center">
           <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
           <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest leading-tight">Visual Node Failure</p>
           <p className="text-[9px] text-white/30 uppercase tracking-widest">Unable to synthesize holographic profile</p>
        </div>
      )}

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;