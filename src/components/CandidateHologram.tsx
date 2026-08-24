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
  
  // Animation System Refs
  const eyeMaterialsRef = useRef<THREE.PointsMaterial[]>([]);
  const nextBlinkTime = useRef<number>(Date.now() + 3000);
  const isBlinking = useRef<boolean>(false);
  const blinkStartTime = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    const initEngine = async () => {
      if (!containerRef.current || !canvasRef.current) return;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
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

        // 1. Geometric Normalization Protocol
        const boxRaw = new THREE.Box3().setFromObject(gltfScene);
        const sizeRaw = boxRaw.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeRaw.x, sizeRaw.y, sizeRaw.z);
        const scale = 1.4 / maxDim;
        gltfScene.scale.setScalar(scale);
        gltfScene.updateMatrixWorld(true);

        // 2. Absolute Centering
        const newBoundingBox = new THREE.Box3().setFromObject(gltfScene);
        gltfScene.position.sub(newBoundingBox.getCenter(new THREE.Vector3()));
        gltfScene.updateMatrixWorld(true);

        // 3. Raw Data Buffers
        const facePositions: number[] = [];
        const hairCapPool: number[] = [];
        const hairFrontPool: number[] = [];
        const hairSidePool: number[] = [];
        const eyePositions: number[] = [];
        const mouthPositions: number[] = [];

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

              if (isFace) facePositions.push(tempV.x, tempV.y, tempV.z);
              else if (isMouth) mouthPositions.push(tempV.x, tempV.y, tempV.z);
              else if (isEyes) eyePositions.push(tempV.x, tempV.y, tempV.z);
              else if (isHair) {
                if (name.includes("Hair_Cap") || name.includes("Back_Mat")) hairCapPool.push(tempV.x, tempV.y, tempV.z);
                else if (name.includes("FrontL") || name.includes("FrontR")) hairFrontPool.push(tempV.x, tempV.y, tempV.z);
                else hairSidePool.push(tempV.x, tempV.y, tempV.z);
              }
            }
          }
        });

        // 4. Volumetric Filtering for Hair
        const faceAvg = new THREE.Vector3();
        for(let i=0; i<facePositions.length; i+=3) faceAvg.add(new THREE.Vector3(facePositions[i], facePositions[i+1], facePositions[i+2]));
        faceAvg.divideScalar(facePositions.length/3);
        
        let maxDist = 0;
        for(let i=0; i<facePositions.length; i+=3) {
           const d = faceAvg.distanceTo(new THREE.Vector3(facePositions[i], facePositions[i+1], facePositions[i+2]));
           if(d > maxDist) maxDist = d;
        }
        const filterRadius = maxDist * 1.15;
        const headHeight = newBoundingBox.max.y - newBoundingBox.min.y;
        const yCutoff = faceAvg.y - (headHeight * 0.2);

        const filterPool = (pool: number[]) => {
          const res: number[] = [];
          for(let i=0; i<pool.length; i+=3) {
            const v = new THREE.Vector3(pool[i], pool[i+1], pool[i+2]);
            if (v.distanceTo(faceAvg) <= filterRadius && v.y > yCutoff) {
              res.push(pool[i], pool[i+1], pool[i+2]);
            }
          }
          return res;
        };

        const fCap = filterPool(hairCapPool);
        const fFront = filterPool(hairFrontPool);
        const fSide = filterPool(hairSidePool);

        const sampleHair = (pool: number[], target: number) => {
          const res: number[] = [];
          const count = pool.length / 3;
          if (count === 0) return res;
          for(let i=0; i<target; i++) {
            const idx = Math.floor(Math.random() * count) * 3;
            const jitter = (Math.random() - 0.5) * 0.004;
            res.push(pool[idx] + jitter, pool[idx+1] + jitter, pool[idx+2] + jitter);
          }
          return res;
        };

        const hairPositions = [...sampleHair(fCap, 3600), ...sampleHair(fFront, 1200), ...sampleHair(fSide, 1200)];

        // 5. Point Creation Factory
        const createPoints = (pos: number[], color: number, size: number, opacity: number, type?: string) => {
          if (pos.length === 0) return;
          const groups = 3;
          const posPerGroup = Math.floor((pos.length / 3) / groups);

          for (let g = 0; g < groups; g++) {
            const start = g * posPerGroup * 3;
            const end = (g === groups - 1) ? pos.length : (g + 1) * posPerGroup * 3;
            const slice = pos.slice(start, end);
            
            const groupSize = size * (0.85 + Math.random() * 0.3);
            const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(slice, 3));
            const mat = new THREE.PointsMaterial({ 
              color, size: groupSize, transparent: true, opacity, 
              blending: THREE.AdditiveBlending,
              depthWrite: false 
            });

            if (type === 'eye') eyeMaterialsRef.current.push(mat);

            geometries.push(geo);
            materials.push(mat);
            scene.add(new THREE.Points(geo, mat));
          }
        };

        createPoints(facePositions, 0x4ff0ff, 0.022, 0.9);
        createPoints(hairPositions, 0x1a5fb4, 0.02, 0.5);
        createPoints(eyePositions, 0x4ff0ff, 0.012, 0.5, 'eye');
        createPoints(mouthPositions, 0x4ff0ff, 0.018, 0.6);

        // 6. Animation Protocol
        const animate = () => {
          if (!isMounted || !rendererRef.current) return;
          animationRef.current = requestAnimationFrame(animate);

          // Blinking eye logic
          const now = Date.now();
          if (isBlinking.current) {
            if (now - blinkStartTime.current > 150) {
              isBlinking.current = false;
              eyeMaterialsRef.current.forEach(m => m.opacity = 0.5);
              nextBlinkTime.current = now + 3000 + Math.random() * 3000;
            }
          } else if (now > nextBlinkTime.current) {
            isBlinking.current = true;
            blinkStartTime.current = now;
            eyeMaterialsRef.current.forEach(m => m.opacity = 0);
            console.log("[Hologram] Blink");
          }

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
