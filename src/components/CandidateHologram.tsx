'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Particle Face
 * Optimized for woman_head.glb.
 * Renders a realistic human face using thousands of tiny cyan particles.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 18000;
const ATMOSPHERE_COUNT = 300;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  
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

      const loader = new GLTFLoader();
      
      loader.load(
        '/models/woman_head.glb',
        (gltf) => {
          if (!isMounted) return;

          const faceMeshes: THREE.Mesh[] = [];
          const hairMeshes: THREE.Mesh[] = [];
          const otherMeshes: THREE.Mesh[] = [];

          // 1. COLLECT & CATEGORIZE MESHES
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const name = mesh.name.toLowerCase();
              
              // Skip eyeball-specific meshes to avoid bright circular eyes
              if (name.includes('eye') || name.includes('iris') || name.includes('pupil') || name.includes('cornea') || name.includes('lens')) {
                return;
              }

              if (name.includes('face') || name.includes('head') || name.includes('skin')) {
                faceMeshes.push(mesh);
              } else if (name.includes('hair')) {
                hairMeshes.push(mesh);
              } else {
                otherMeshes.push(mesh);
              }
            }
          });

          // Fallback if categorization failed
          if (faceMeshes.length === 0 && hairMeshes.length === 0 && otherMeshes.length === 0) {
            gltf.scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) faceMeshes.push(child as THREE.Mesh);
            });
          }

          if (faceMeshes.length === 0 && otherMeshes.length === 0) {
            setError("GEOMETRY_MISSING");
            return;
          }

          // 2. CALCULATE GLOBAL BOUNDING BOX FOR NORMALIZATION
          const globalBox = new THREE.Box3().setFromObject(gltf.scene);
          const center = new THREE.Vector3();
          globalBox.getCenter(center);
          const size = new THREE.Vector3();
          globalBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const normalizationScale = 3.5 / maxDim;

          // 3. SAMPLE PARTICLES WITH WEIGHTS
          // We want the face to be highly detailed
          const positions = new Float32Array(PARTICLE_COUNT * 3);
          const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
          const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
          const mouthWeights = new Float32Array(PARTICLE_COUNT);
          const eyeWeights = new Float32Array(PARTICLE_COUNT);

          const tempPos = new THREE.Vector3();

          // Distribution: 70% Face, 20% Hair, 10% Other
          const faceTarget = Math.floor(PARTICLE_COUNT * 0.75);
          const hairTarget = Math.floor(PARTICLE_COUNT * 0.15);
          const otherTarget = PARTICLE_COUNT - faceTarget - hairTarget;

          const sampleGroup = (meshes: THREE.Mesh[], count: number, startIdx: number) => {
            if (meshes.length === 0) return startIdx;
            
            // Simplified: equal share per mesh in group
            const perMesh = Math.floor(count / meshes.length);
            let currentIdx = startIdx;

            meshes.forEach((mesh) => {
              const sampler = new MeshSurfaceSampler(mesh).build();
              for (let i = 0; i < perMesh; i++) {
                if (currentIdx >= PARTICLE_COUNT) break;
                
                sampler.sample(tempPos);
                tempPos.applyMatrix4(mesh.matrixWorld);
                
                // Normalize & Center
                tempPos.sub(center).multiplyScalar(normalizationScale);

                const ix = currentIdx * 3;
                targetPositions[ix] = tempPos.x;
                targetPositions[ix + 1] = tempPos.y;
                targetPositions[ix + 2] = tempPos.z;

                // Scatter initially
                initialPositions[ix] = (Math.random() - 0.5) * 10;
                initialPositions[ix + 1] = (Math.random() - 0.5) * 10;
                initialPositions[ix + 2] = (Math.random() - 0.5) * 10;

                // Mouth region logic (heuristic based on normalized coords)
                const isMouthY = tempPos.y < -0.15 && tempPos.y > -0.55;
                const isMouthX = Math.abs(tempPos.x) < 0.35;
                const isMouthZ = tempPos.z > 0.1;
                mouthWeights[currentIdx] = (isMouthY && isMouthX && isMouthZ) ? 1.0 : 0.0;

                // Eye region logic for blinking
                const isEyeY = tempPos.y > 0.2 && tempPos.y < 0.45;
                const isEyeX = Math.abs(tempPos.x) > 0.15 && Math.abs(tempPos.x) < 0.5;
                const isEyeZ = tempPos.z > 0.15;
                eyeWeights[currentIdx] = (isEyeY && isEyeX && isEyeZ) ? 1.0 : 0.0;

                currentIdx++;
              }
            });
            return currentIdx;
          };

          let nextIdx = 0;
          nextIdx = sampleGroup(faceMeshes, faceTarget, nextIdx);
          nextIdx = sampleGroup(hairMeshes, hairTarget, nextIdx);
          sampleGroup(otherMeshes, otherTarget, nextIdx);

          const pointGeometry = new THREE.BufferGeometry();
          pointGeometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
          pointGeometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));
          pointGeometry.setAttribute('mouthWeight', new THREE.BufferAttribute(mouthWeights, 1));
          pointGeometry.setAttribute('eyeWeight', new THREE.BufferAttribute(eyeWeights, 1));

          const material = new THREE.PointsMaterial({
            color: 0x22d3ee,
            size: 0.01,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });

          const points = new THREE.Points(pointGeometry, material);
          scene.add(points);
          pointsRef.current = points;

          camera.position.set(0, 0, 7.5);
          camera.lookAt(0, 0, 0);

          // Atmosphere Particles
          const atmosGeo = new THREE.BufferGeometry();
          const atmosPos = new Float32Array(ATMOSPHERE_COUNT * 3);
          for(let i=0; i<ATMOSPHERE_COUNT; i++) {
            atmosPos[i*3] = (Math.random()-0.5)*15;
            atmosPos[i*3+1] = (Math.random()-0.5)*15;
            atmosPos[i*3+2] = (Math.random()-0.5)*15;
          }
          atmosGeo.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
          const atmos = new THREE.Points(atmosGeo, new THREE.PointsMaterial({ 
            color: 0x4ff0ff, 
            size: 0.008, 
            transparent: true, 
            opacity: 0.15,
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
          setError("Visual Node Failure: Archive inaccessible.");
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
            formationProgress.current += 0.01;
          }

          // Blinking Logic
          const blinkCycle = time % 5;
          const isBlinking = blinkCycle > 4.8;

          // Speaking Logic
          const targetMouthMove = speakingRef.current ? Math.sin(time * 20) * 0.03 : 0;
          mouthMovementValue.current += (targetMouthMove - mouthMovementValue.current) * 0.2;

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
            const tx = targets[ix];
            let ty = targets[iy];
            const tz = targets[iz];

            if (mWeights[i] > 0) ty += mouthMovementValue.current;
            if (eWeights[i] > 0 && isBlinking) ty -= 0.05;

            const speed = 0.07 * formationProgress.current;
            positions[ix] += (tx - positions[ix]) * speed;
            positions[iy] += (ty - positions[iy]) * speed;
            positions[iz] += (tz - positions[iz]) * speed;
          }

          points.geometry.attributes.position.needsUpdate = true;
          
          // Subtle horizontal head sway
          points.rotation.y = Math.sin(time * 0.5) * 0.04;
          
          // Subtle vertical float
          points.position.y = Math.sin(time * 0.7) * 0.03;
          
          // Neural Flicker
          if (Math.random() > 0.99) {
            (points.material as THREE.PointsMaterial).opacity = 0.3 + Math.random() * 0.4;
          } else {
            (points.material as THREE.PointsMaterial).opacity += (0.7 - (points.material as THREE.PointsMaterial).opacity) * 0.1;
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
        "relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl",
        className
      )}
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
      
      {/* Subtle CRT / Hologram scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;