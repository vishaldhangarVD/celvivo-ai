'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Particle Face
 * Optimized for woman_head.glb with realistic distribution and neural animations.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 18500;
const ATMOSPHERE_COUNT = 200;

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

      // 2. Data Loading & Multi-Mesh Sampling
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
            setError("GEOMETRY_MISSING");
            return;
          }

          // Calculate global bounding box for all meshes
          const globalBox = new THREE.Box3();
          meshes.forEach(m => {
            m.geometry.computeBoundingBox();
            if (m.geometry.boundingBox) {
              const box = m.geometry.boundingBox.clone();
              box.applyMatrix4(m.matrixWorld);
              globalBox.union(box);
            }
          });

          const center = new THREE.Vector3();
          globalBox.getCenter(center);
          const size = new THREE.Vector3();
          globalBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const normalizationScale = 3.0 / maxDim;

          // Prepare Particle Arrays
          const positions = new Float32Array(PARTICLE_COUNT * 3);
          const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
          const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
          const mouthWeights = new Float32Array(PARTICLE_COUNT);
          const eyeWeights = new Float32Array(PARTICLE_COUNT);

          const tempPos = new THREE.Vector3();
          const particlesPerMesh = Math.floor(PARTICLE_COUNT / meshes.length);

          meshes.forEach((mesh, mIdx) => {
            const sampler = new MeshSurfaceSampler(mesh).build();
            const startIdx = mIdx * particlesPerMesh;
            const endIdx = mIdx === meshes.length - 1 ? PARTICLE_COUNT : startIdx + particlesPerMesh;

            for (let i = startIdx; i < endIdx; i++) {
              sampler.sample(tempPos);
              
              // Apply world transform
              tempPos.applyMatrix4(mesh.matrixWorld);
              
              // Normalize: Center and Scale
              tempPos.sub(center).multiplyScalar(normalizationScale);

              // Store target structure
              targetPositions[i * 3] = tempPos.x;
              targetPositions[i * 3 + 1] = tempPos.y;
              targetPositions[i * 3 + 2] = tempPos.z;

              // Scattered initial cloud
              initialPositions[i * 3] = (Math.random() - 0.5) * 10;
              initialPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
              initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

              // Mouth region heuristic: bottom-center region of face
              const isMouthY = tempPos.y < -0.15 && tempPos.y > -0.45;
              const isMouthX = Math.abs(tempPos.x) < 0.25;
              const isMouthZ = tempPos.z > 0.1;
              mouthWeights[i] = (isMouthY && isMouthX && isMouthZ) ? 1.0 : 0.0;

              // Eye region heuristic for blinking
              const isEyeY = tempPos.y > 0.15 && tempPos.y < 0.35;
              const isEyeX = Math.abs(tempPos.x) > 0.15 && Math.abs(tempPos.x) < 0.45;
              const isEyeZ = tempPos.z > 0.1;
              eyeWeights[i] = (isEyeY && isEyeX && isEyeZ) ? 1.0 : 0.0;
            }
          });

          const pointGeometry = new THREE.BufferGeometry();
          pointGeometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
          pointGeometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));
          pointGeometry.setAttribute('mouthWeight', new THREE.BufferAttribute(mouthWeights, 1));
          pointGeometry.setAttribute('eyeWeight', new THREE.BufferAttribute(eyeWeights, 1));

          const material = new THREE.PointsMaterial({
            color: 0x22d3ee,
            size: 0.015,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });

          const points = new THREE.Points(pointGeometry, material);
          scene.add(points);
          pointsRef.current = points;

          // Camera Alignment
          camera.position.set(0, 0, 8);
          camera.lookAt(0, 0, 0);

          // Atmosphere
          const atmosGeo = new THREE.BufferGeometry();
          const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
          for(let i=0; i<ATMOSPHERE_COUNT; i++) {
            atmosPos[i*3] = (Math.random()-0.5)*12;
            atmosPos[i*3+1] = (Math.random()-0.5)*12;
            atmosPos[i*3+2] = (Math.random()-0.5)*12;
          }
          atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
          const atmos = new THREE.Points(atmosGeo, new THREE.PointsMaterial({ 
            color: 0x4ff0ff, 
            size: 0.012, 
            transparent: true, 
            opacity: 0.2,
            blending: THREE.AdditiveBlending
          }));
          scene.add(atmos);

          setLoading(false);
          animate();
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.error('[Hologram] Load failed:', err);
          setError("Visual Node Failure: Identity archive inaccessible.");
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
          const mWeights = points.geometry.attributes.mouthWeight.array as Float32Array;
          const eWeights = points.geometry.attributes.eyeWeight.array as Float32Array;

          if (formationProgress.current < 1.0) {
            formationProgress.current += 0.008;
          }

          // Neural Blinking Logic
          const blinkCycle = time % 4;
          const isBlinking = blinkCycle > 3.8;
          const blinkValue = isBlinking ? 0.1 : 1.0;

          // Speaking Logic
          const targetMouthMove = speakingRef.current ? Math.sin(time * 18) * 0.04 : 0;
          mouthMovementValue.current += (targetMouthMove - mouthMovementValue.current) * 0.15;

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            const tx = targets[ix];
            let ty = targets[iy];
            const tz = targets[iz];

            // Apply Speaking displacement
            if (mWeights[i] > 0) ty += mouthMovementValue.current;

            // Apply Blinking displacement
            if (eWeights[i] > 0 && isBlinking) {
               ty = ty * 0.95 + 0.25 * 0.05; // Compress towards eye center
            }

            const speed = 0.08 * formationProgress.current;
            positions[ix] += (tx - positions[ix]) * speed;
            positions[iy] += (ty - positions[iy]) * speed;
            positions[iz] += (tz - positions[iz]) * speed;
          }

          points.geometry.attributes.position.needsUpdate = true;
          
          // Subtle horizontal head sway
          points.rotation.y = Math.sin(time * 0.4) * 0.035;
          
          // Subtle vertical float
          points.position.y = Math.sin(time * 0.6) * 0.05;
          
          // Neural Flicker
          if (Math.random() > 0.98) {
            (points.material as THREE.PointsMaterial).opacity = 0.4 + Math.random() * 0.3;
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
      className={cn(
        "relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
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
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;