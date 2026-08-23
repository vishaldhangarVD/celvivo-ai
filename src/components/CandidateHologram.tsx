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

        // 1. Geometric Normalization
        const boxRaw = new THREE.Box3().setFromObject(gltfScene);
        const sizeRaw = boxRaw.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeRaw.x, sizeRaw.y, sizeRaw.z);
        const scale = 1.4 / maxDim;
        gltfScene.scale.setScalar(scale);
        gltfScene.updateMatrixWorld(true);

        // 2. Absolute Centering
        const newBoundingBox = new THREE.Box3().setFromObject(gltfScene);
        const headCenter = newBoundingBox.getCenter(new THREE.Vector3());
        gltfScene.position.sub(headCenter);
        gltfScene.updateMatrixWorld(true);

        const facePool: number[] = [];
        const eyePool: number[] = [];
        const mouthPool: number[] = [];
        
        // Hair categorization pools
        const hairCapPool: number[] = [];
        const hairFrontPool: number[] = [];
        const hairSidePool: number[] = [];

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

              if (isFace) facePool.push(tempV.x, tempV.y, tempV.z);
              else if (isMouth) mouthPool.push(tempV.x, tempV.y, tempV.z);
              else if (isEyes) eyePool.push(tempV.x, tempV.y, tempV.z);
              else if (isHair) {
                if (name.includes("Hair_Cap") || name.includes("Back_Mat")) {
                  hairCapPool.push(tempV.x, tempV.y, tempV.z);
                } else if (name.includes("FrontL") || name.includes("FrontR")) {
                  hairFrontPool.push(tempV.x, tempV.y, tempV.z);
                } else {
                  hairSidePool.push(tempV.x, tempV.y, tempV.z);
                }
              }
            }
          }
        });

        // 3. Volumetric Constraints for Hair
        const headRadius = (sizeRaw.x * scale) / 2;
        const filterRadius = headRadius * 1.15;
        const headHeight = newBoundingBox.max.y - newBoundingBox.min.y;
        const yCutoff = - (headHeight * 0.2); // Shoulder line purge

        const filterPool = (pool: number[]) => {
          const filtered: number[] = [];
          for (let i = 0; i < pool.length; i += 3) {
            const x = pool[i], y = pool[i+1], z = pool[i+2];
            const dist = Math.sqrt(x*x + y*y + z*z);
            if (dist <= filterRadius && y > yCutoff) {
              filtered.push(x, y, z);
            }
          }
          return filtered;
        };

        const fCap = filterPool(hairCapPool);
        const fFront = filterPool(hairFrontPool);
        const fSide = filterPool(hairSidePool);

        // 4. Weighted Sampling with Jitter-Duplication for fuller hair
        const sampleNodes = (pool: number[], target: number) => {
          const result: number[] = [];
          const count = pool.length / 3;
          if (count === 0) return result;
          
          for (let i = 0; i < target; i++) {
            const idx = Math.floor(Math.random() * count) * 3;
            // Duplication jitter to avoid sparse looks at high targets
            const jitter = (Math.random() - 0.5) * 0.002;
            result.push(pool[idx] + jitter, pool[idx + 1] + jitter, pool[idx + 2] + jitter);
          }
          return result;
        };

        const hairPositions = [
          ...sampleNodes(fCap, 3600),
          ...sampleNodes(fFront, 1200),
          ...sampleNodes(fSide, 1200)
        ];

        // 5. Creation Protocol (Points Only)
        const createPoints = (pos: number[], color: number, size: number, opacity: number, variance = 0, additive = true) => {
          if (pos.length === 0) return;
          
          // Split into 3 groups for organic size variance
          const groups = 3;
          const posPerGroup = Math.floor((pos.length / 3) / groups);

          for (let g = 0; g < groups; g++) {
            const start = g * posPerGroup * 3;
            const end = (g === groups - 1) ? pos.length : (g + 1) * posPerGroup * 3;
            const slice = pos.slice(start, end);
            
            // Apply size variance per group
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

        // Render Matrix (100% vertex sampling for face/eyes/mouth)
        createPoints(facePool, 0x4ff0ff, 0.022, 0.9, 0.15); // Organic Face
        createPoints(hairPositions, 0x1a5fb4, 0.02, 0.5, 0.1); // Volumetric Hair
        createPoints(eyePool, 0x4ff0ff, 0.012, 0.5, 0, false);
        createPoints(mouthPool, 0x4ff0ff, 0.018, 0.6);

        console.log("[Hologram] Face Nodes:", facePool.length / 3, "Hair Nodes:", hairPositions.length / 3);

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
