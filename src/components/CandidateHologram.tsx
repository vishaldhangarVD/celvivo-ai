'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Human Particle Reconstruction.
 * Synthesizes FACE + HAIR from /models/woman_head.glb.
 * Implementation focuses on geometry extraction and weighted particle distribution.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const TOTAL_PARTICLE_COUNT = 22000;
const ATMOSPHERE_COUNT = 250;
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

      // Safe loading manager to ignore texture faults
      const manager = new THREE.LoadingManager();
      manager.onError = (url) => {
        if (url.includes('blob:')) return;
        console.warn(`[Hologram] Asset warning: ${url}`);
      };

      const loader = new GLTFLoader(manager);

      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load('/models/woman_head.glb', resolve, undefined, reject);
        });

        if (!isMounted) return;

        // Ensure all matrices are calculated before cloning geometries
        gltf.scene.updateMatrixWorld(true);

        const faceMeshes: THREE.Mesh[] = [];
        const hairMeshes: THREE.Mesh[] = [];
        const detailMeshes: THREE.Mesh[] = [];

        gltf.scene.traverse((node: any) => {
          if (node.isMesh) {
            const name = (node.name || '').toLowerCase();
            const matName = node.material?.name?.toLowerCase() || '';
            
            const isHair = name.includes('hair') || matName.includes('hair');
            const isDetail = name.includes('eye') || name.includes('brow') || name.includes('lash') || 
                             name.includes('lip') || name.includes('mouth') || name.includes('teeth');
            const isFace = name.includes('face') || name.includes('head') || name.includes('skin') || 
                           name.includes('body') || name.includes('neck');

            if (isHair) {
              hairMeshes.push(node);
            } else if (isDetail) {
              detailMeshes.push(node);
            } else if (isFace) {
              faceMeshes.push(node);
            } else {
              faceMeshes.push(node);
            }
          }
        });

        const targetPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const currentPositions = new Float32Array(TOTAL_PARTICLE_COUNT * 3);
        const tempVec = new THREE.Vector3();

        // Weighted Distribution Protocol: 70% Face, 20% Hair, 10% Details
        const faceCountTarget = Math.floor(TOTAL_PARTICLE_COUNT * 0.70);
        const hairCountTarget = Math.floor(TOTAL_PARTICLE_COUNT * 0.20);
        const detailCountTarget = TOTAL_PARTICLE_COUNT - faceCountTarget - hairCountTarget;

        let sampledCount = 0;

        const processGroup = (meshes: THREE.Mesh[], groupTarget: number) => {
          if (meshes.length === 0 || groupTarget <= 0) return;
          const perMesh = Math.floor(groupTarget / meshes.length);
          
          meshes.forEach((mesh) => {
            const clonedGeo = mesh.geometry.clone();
            clonedGeo.applyMatrix4(mesh.matrixWorld);
            const tempMesh = new THREE.Mesh(clonedGeo);
            const sampler = new MeshSurfaceSampler(tempMesh).build();
            
            for (let i = 0; i < perMesh; i++) {
              if (sampledCount >= TOTAL_PARTICLE_COUNT) break;
              
              sampler.sample(tempVec);
              const idx = sampledCount * 3;
              targetPositions[idx] = tempVec.x;
              targetPositions[idx + 1] = tempVec.y;
              targetPositions[idx + 2] = tempVec.z;
              
              currentPositions[idx] = (Math.random() - 0.5) * 8;
              currentPositions[idx + 1] = (Math.random() - 0.5) * 8;
              currentPositions[idx + 2] = (Math.random() - 0.5) * 8;
              
              sampledCount++;
            }
            clonedGeo.dispose();
          });
        };

        processGroup(faceMeshes, faceCountTarget);
        processGroup(hairMeshes, hairCountTarget);
        processGroup(detailMeshes, detailCountTarget);

        // Global Normalization to stabilize viewport fit
        const box = new THREE.Box3();
        for (let i = 0; i < sampledCount; i++) {
          tempVec.set(targetPositions[i * 3], targetPositions[i * 3 + 1], targetPositions[i * 3 + 2]);
          box.expandByPoint(tempVec);
        }

        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.4 / maxDim;

        for (let i = 0; i < TOTAL_PARTICLE_COUNT; i++) {
          targetPositions[i * 3] = (targetPositions[i * 3] - center.x) * scale;
          targetPositions[i * 3 + 1] = (targetPositions[i * 3 + 1] - center.y) * scale;
          targetPositions[i * 3 + 2] = (targetPositions[i * 3 + 2] - center.z) * scale;
        }

        targetPositionsRef.current = targetPositions;
        originalTargetsRef.current = new Float32Array(targetPositions);

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

        const mat = new THREE.PointsMaterial({
          color: NEXVORO_CYAN,
          size: 0.012,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);
        pointsRef.current = points;

        // Ambient Drifting Nodes
        const atmosGeo = new THREE.BufferGeometry();
        const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
        for (let i = 0; i < ATMOSPHERE_COUNT; i++) {
          atmosPos[i * 3] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
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

              posArray[ix] += (targets[ix] - posArray[ix]) * FORMATION_SPEED;
              posArray[iy] += (targets[iy] - posArray[iy]) * FORMATION_SPEED;
              posArray[iz] += (targets[iz] - posArray[iz]) * FORMATION_SPEED;

              if (speakingRef.current) {
                // Precision mouth region displacement
                if (Math.abs(originals[ix]) < 0.25 && originals[iy] < -0.15 && originals[iy] > -0.6) {
                  posArray[iy] += Math.sin(time * 18 + i) * 0.002;
                }
              }

              posArray[ix] += (Math.random() - 0.5) * 0.0007;
              posArray[iy] += (Math.random() - 0.5) * 0.0007;
            }
            posAttr.needsUpdate = true;
            pointsRef.current.position.y = Math.sin(time * 0.7) * 0.015;
          }

          if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y = time * 0.05;
            atmosphereRef.current.position.y = Math.sin(time * 0.4) * 0.05;
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (err) {
        console.error('[Hologram] Protocol Sync Fault:', err);
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
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Identity Matrix...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050816]/90 z-50 p-6 text-center">
           <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
           <p className="text-[11px] font-bold text-white/90 uppercase tracking-widest leading-tight">Visual Protocol Failure</p>
           <p className="text-[9px] text-white/30 uppercase tracking-widest">Unable to synthesize head geometry</p>
        </div>
      )}

      {/* Holographic FX Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;