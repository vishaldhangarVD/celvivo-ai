"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

export default function CandidateHologram({ 
  className,
  isLoader = false
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const initEngine = async () => {
      if (!containerRef.current || !canvasRef.current) return;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        45, 
        containerRef.current.clientWidth / containerRef.current.clientHeight, 
        0.1, 
        100
      );
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ 
          canvas: canvasRef.current, 
          antialias: true, 
          alpha: true, 
          powerPreference: "default" 
        });
        renderer.setPixelRatio(1);
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        rendererRef.current = renderer;
      } catch (err) {
        console.error("[Hologram] WebGL Initialization Fault:", err);
        return;
      }

      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w <= 0 || h <= 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      const loader = new GLTFLoader();
      loader.load('/models/woman_head.glb', (gltf) => {
        if (!isMounted) return;

        const gltfScene = gltf.scene;
        gltfScene.updateMatrixWorld(true);

        const boxRaw = new THREE.Box3().setFromObject(gltfScene);
        const sizeRaw = boxRaw.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeRaw.x, sizeRaw.y, sizeRaw.z);
        const scale = 1.4 / maxDim;
        gltfScene.scale.setScalar(scale);
        gltfScene.updateMatrixWorld(true);

        const newBoundingBox = new THREE.Box3().setFromObject(gltfScene);
        const headCenter = newBoundingBox.getCenter(new THREE.Vector3());
        const headHeight = newBoundingBox.max.y - newBoundingBox.min.y;
        gltfScene.position.sub(headCenter);
        gltfScene.updateMatrixWorld(true);

        const facePool: number[] = [];
        const mouthPool: number[] = [];
        const eyePool: number[] = [];
        const capBackPool: number[] = [];
        const frontPool: number[] = [];
        const sidePool: number[] = [];

        gltfScene.traverse((child) => {
          if ((child as any).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name;
            if (name.includes("Torso")) return;

            const posAttr = mesh.geometry.attributes.position;
            const tempV = new THREE.Vector3();

            const isFace = name.includes("Face_mush_Face");
            const isMouth = name.includes("Mouth_mush_Mouth");
            const isEyes = name.includes("Eye_L_Irises") || name.includes("Eye_R_Irises");
            const isHair = name.includes("Hair_mush");

            for (let i = 0; i < posAttr.count; i++) {
              tempV.fromBufferAttribute(posAttr as THREE.BufferAttribute, i);
              tempV.applyMatrix4(mesh.matrixWorld);
              const worldV = tempV.clone().sub(headCenter);

              if (isFace) facePool.push(worldV.x, worldV.y, worldV.z);
              else if (isMouth) mouthPool.push(worldV.x, worldV.y, worldV.z);
              else if (isEyes) eyePool.push(worldV.x, worldV.y, worldV.z);
              else if (isHair) {
                if (name.includes("Hair_Cap") || name.includes("Back_Mat")) capBackPool.push(worldV.x, worldV.y, worldV.z);
                else if (name.includes("FrontL") || name.includes("FrontR")) frontPool.push(worldV.x, worldV.y, worldV.z);
                else sidePool.push(worldV.x, worldV.y, worldV.z);
              }
            }
          }
        });

        // 1. Calculate Head Radius for Hair Filtering
        let maxFaceDist = 0;
        for (let i = 0; i < facePool.length; i += 3) {
          const d = Math.sqrt(facePool[i]**2 + facePool[i+1]**2 + facePool[i+2]**2);
          if (d > maxFaceDist) maxFaceDist = d;
        }
        const filterRadius = maxFaceDist * 1.15;
        const yCutoff = - (headHeight * 0.2); // Relative to center 0

        // 2. Sample Particles with Jitter Fallback to Ensure Density
        const sampleWithTarget = (pool: number[], target: number, filter = false) => {
          const result: number[] = [];
          const rawCount = pool.length / 3;
          if (rawCount === 0) return result;

          let validPool: number[] = pool;
          if (filter) {
            validPool = [];
            for (let i = 0; i < pool.length; i += 3) {
              const x = pool[i], y = pool[i+1], z = pool[i+2];
              const d = Math.sqrt(x*x + y*y + z*z);
              if (d <= filterRadius && y > yCutoff) {
                validPool.push(x, y, z);
              }
            }
          }

          const currentCount = validPool.length / 3;
          if (currentCount === 0) return result;

          for (let i = 0; i < target; i++) {
            const idx = Math.floor(Math.random() * currentCount) * 3;
            const jitter = (Math.random() - 0.5) * 0.004; // Very tight jitter for structured look
            result.push(validPool[idx] + jitter, validPool[idx + 1] + jitter, validPool[idx + 2] + jitter);
          }
          return result;
        };

        const facePositions = sampleWithTarget(facePool, 6500);
        const mouthPositions = mouthPool; // 100%
        const eyePositions = eyePool; // 100%
        const hairPositions = [
          ...sampleWithTarget(capBackPool, 3600, true),
          ...sampleWithTarget(frontPool, 1200, true),
          ...sampleWithTarget(sidePool, 1200, true)
        ];

        // 3. Create Points with Size Variance Tiers
        const createPoints = (pos: number[], color: number, size: number, opacity: number, variance = 0, additive = true) => {
          if (pos.length === 0) return;
          
          const groups = variance > 0 ? 3 : 1;
          const posPerGroup = Math.floor((pos.length / 3) / groups);

          for (let g = 0; g < groups; g++) {
            const start = g * posPerGroup * 3;
            const end = (g === groups - 1) ? pos.length : (g + 1) * posPerGroup * 3;
            const slice = pos.slice(start, end);
            
            const groupSize = size * (1 + (Math.random() - 0.5) * variance);
            const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(slice, 3));
            const mat = new THREE.PointsMaterial({ 
              color, size: groupSize, transparent: true, opacity, 
              blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
              depthWrite: false 
            });
            geometries.push(geo);
            materials.push(mat);
            scene.add(new THREE.Points(geo, mat));
          }
        };

        // Layers
        createPoints(facePositions, 0x4ff0ff, 0.022, 0.9, 0.15); 
        createPoints(hairPositions, 0x1a5fb4, 0.02, 0.5, 0.1); 
        createPoints(eyePositions, 0x4ff0ff, 0.012, 0.5, 0, false);
        createPoints(mouthPositions, 0x4ff0ff, 0.018, 0.6);

        console.log("[Hologram] Face Scan Matrix Locked. Total Nodes:", (facePositions.length + hairPositions.length) / 3);

        const animate = () => {
          if (!isMounted || !rendererRef.current) return;
          animationRef.current = requestAnimationFrame(animate);
          scene.rotation.y += 0.0015;
          rendererRef.current.render(scene, camera);
        };

        animate();
        setIsLoading(false);
      }, undefined, (err) => {
        console.error("[Hologram] GLTF Load Error:", err);
        setIsLoading(false);
      });

      return () => window.removeEventListener('resize', handleResize);
    };

    initEngine();

    return () => {
      isMounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden bg-[#000810] ${className ?? ""}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {(isLoading || isLoader) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000810]/80 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}
    </div>
  );
}
