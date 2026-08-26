'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram - High-Fidelity 3D Particle Hologram.
 * Fixed for WebGL stability and GLB compatibility.
 */
const CandidateHologram: React.FC<CandidateHologramProps> = memo(({
  active = true,
  speaking = false,
  className = '',
  isLoader = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Refs for animation state to prevent re-renders
  const speakingRef = useRef(speaking);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!active || !canvasRef.current || !containerRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let points: THREE.Points;
    let particlesAtmos: THREE.Points;
    
    const TOTAL_PARTICLES = 35000;
    const ATMOS_PARTICLES = 600;
    const FORMATION_DURATION = 2000;
    const startTime = Date.now();

    const init = async () => {
      try {
        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;

        // 1. Setup Core
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
        camera.position.set(0, 0, 5);

        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        rendererRef.current = renderer;

        // 2. Load Model & Extract Geometry
        const loader = new GLTFLoader();
        let finalGeometry: THREE.BufferGeometry;

        try {
          const gltf = await loader.loadAsync('/models/woman_head.glb');
          const geometries: THREE.BufferGeometry[] = [];
          
          gltf.scene.updateMatrixWorld(true);
          gltf.scene.traverse((node: any) => {
            if (node.isMesh) {
              const name = node.name.toLowerCase();
              // Exclude interior noisy geometry
              if (!/eye|cornea|iris|pupil|sclera|teeth|tongue|inner|mouth/.test(name)) {
                const geom = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
                geom.applyMatrix4(node.matrixWorld);
                geometries.push(geom);
              }
            }
          });

          if (geometries.length > 0) {
            finalGeometry = BufferGeometryUtils.mergeGeometries(geometries);
            // Center and scale
            finalGeometry.computeBoundingBox();
            const box = finalGeometry.boundingBox!;
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size = new THREE.Vector3();
            box.getSize(size);
            const scale = 3.5 / size.y;
            finalGeometry.translate(-center.x, -center.y, -center.z);
            finalGeometry.scale(scale, scale, scale);
          } else {
            throw new Error('No valid geometry');
          }

          // Cleanup original GLTF resources immediately
          gltf.scene.traverse((node: any) => {
            if (node.isMesh) {
              node.geometry.dispose();
              if (node.material) {
                if (Array.isArray(node.material)) node.material.forEach((m: any) => m.dispose());
                else node.material.dispose();
              }
            }
          });
        } catch (loadErr) {
          console.warn('[Hologram] Using fallback silhouette');
          // Fallback simple silhouette if GLB fails
          const headGeom = new THREE.SphereGeometry(1, 32, 32);
          const shouldersGeom = new THREE.SphereGeometry(1.2, 32, 32);
          shouldersGeom.scale(1.5, 0.6, 0.8);
          shouldersGeom.translate(0, -1.5, 0);
          finalGeometry = BufferGeometryUtils.mergeGeometries([headGeom, shouldersGeom]);
        }

        // 3. Sample Surface
        const dummyMesh = new THREE.Mesh(finalGeometry);
        const sampler = new MeshSurfaceSampler(dummyMesh).build();
        
        const posArray = new Float32Array(TOTAL_PARTICLES * 3);
        const targetArray = new Float32Array(TOTAL_PARTICLES * 3);
        const randomArray = new Float32Array(TOTAL_PARTICLES);
        const tempVec = new THREE.Vector3();

        for (let i = 0; i < TOTAL_PARTICLES; i++) {
          sampler.sample(tempVec);
          targetArray[i * 3] = tempVec.x;
          targetArray[i * 3 + 1] = tempVec.y;
          targetArray[i * 3 + 2] = tempVec.z;
          
          // Initial scattered state
          posArray[i * 3] = tempVec.x + (Math.random() - 0.5) * 10;
          posArray[i * 3 + 1] = tempVec.y + (Math.random() - 0.5) * 10;
          posArray[i * 3 + 2] = tempVec.z + (Math.random() - 0.5) * 10;
          
          randomArray[i] = Math.random();
        }

        const pointGeom = new THREE.BufferGeometry();
        pointGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        pointGeom.setAttribute('targetPos', new THREE.BufferAttribute(targetArray, 3));
        pointGeom.setAttribute('random', new THREE.BufferAttribute(randomArray, 1));

        const material = new THREE.PointsMaterial({
          color: 0x22d3ee,
          size: 0.007,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true
        });

        points = new THREE.Points(pointGeom, material);
        scene.add(points);

        // 4. Atmos
        const atmosPos = new Float32Array(ATMOS_PARTICLES * 3);
        for (let i = 0; i < ATMOS_PARTICLES; i++) {
          atmosPos[i * 3] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
          atmosPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }
        const atmosGeom = new THREE.BufferGeometry();
        atmosGeom.setAttribute('position', new THREE.BufferAttribute(atmosPos, 3));
        particlesAtmos = new THREE.Points(atmosGeom, new THREE.PointsMaterial({
          color: 0x22d3ee,
          size: 0.005,
          transparent: true,
          opacity: 0.15,
          blending: THREE.AdditiveBlending
        }));
        scene.add(particlesAtmos);

        setLoading(false);
        animate();
      } catch (err) {
        console.error('[Hologram Error]:', err);
        setError(true);
        setLoading(false);
      }
    };

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / FORMATION_DURATION, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const positions = points.geometry.attributes.position.array as Float32Array;
      const targets = points.geometry.attributes.targetPos.array as Float32Array;
      const randoms = points.geometry.attributes.random.array as Float32Array;
      
      const timeSec = elapsed / 1000;

      for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const i3 = i * 3;
        
        // 1. Formation Lerp
        if (progress < 1) {
          positions[i3] += (targets[i3] - positions[i3]) * ease * 0.1;
          positions[i3 + 1] += (targets[i3 + 1] - positions[i3 + 1]) * ease * 0.1;
          positions[i3 + 2] += (targets[i3 + 2] - positions[i3 + 2]) * ease * 0.1;
        } else {
          // 2. Idle movement
          positions[i3] = targets[i3] + Math.sin(timeSec * 0.5 + randoms[i] * 10) * 0.002;
          positions[i3 + 1] = targets[i3 + 1] + Math.cos(timeSec * 0.7 + randoms[i] * 10) * 0.002;
          
          // 3. Speaking movement (Mouth area mask: y between -0.5 and -1.2, x centered)
          if (speakingRef.current && targets[i3+1] < -0.5 && targets[i3+1] > -1.2 && Math.abs(targets[i3]) < 0.4) {
            positions[i3 + 1] += Math.sin(timeSec * 15 + i) * 0.006;
          }
        }
      }
      
      points.geometry.attributes.position.needsUpdate = true;
      particlesAtmos.rotation.y += 0.001;

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    init();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
            else obj.material.dispose();
          }
        });
      }
    };
  }, [active]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#010208] rounded-[2rem] overflow-hidden border border-white/5 ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {(loading || isLoader) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/90 backdrop-blur-xl z-50">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin" />
            <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.6em] text-accent animate-pulse">
            Synchronizing Neural Persona...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/95 p-12 text-center z-50">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
            <span className="text-2xl font-black">!</span>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Visual Node Failure</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
            The neural visualizer encountered a critical shader fault. Falling back to base silhouette.
          </p>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)] z-10" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';

export default CandidateHologram;
