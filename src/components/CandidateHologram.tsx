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
        gltfScene.position.sub(newBoundingBox.getCenter(new THREE.Vector3()));
        gltfScene.updateMatrixWorld(true);

        const facePositions: number[] = [];
        const eyePositions: number[] = [];
        const mouthPositions: number[] = [];
        
        // Tiered Hair Pools
        const capBackPool: number[] = [];
        const frontPool: number[] = [];
        const sidePool: number[] = [];

        const faceWireGeoList: THREE.BufferGeometry[] = [];
        const mouthWireGeoList: THREE.BufferGeometry[] = [];

        const bakedGeometry = (mesh: THREE.Mesh) => {
          const geo = mesh.geometry.clone();
          geo.applyMatrix4(mesh.matrixWorld);
          return geo;
        };

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

            if (isFace) faceWireGeoList.push(bakedGeometry(mesh));
            if (isMouth) mouthWireGeoList.push(bakedGeometry(mesh));

            for (let i = 0; i < posAttr.count; i++) {
              tempV.fromBufferAttribute(posAttr as THREE.BufferAttribute, i);
              tempV.applyMatrix4(mesh.matrixWorld);

              if (isFace) {
                facePositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isMouth) {
                mouthPositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isEyes) {
                eyePositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isHair) {
                if (name.includes("Hair_Cap") || name.includes("Back_Mat")) {
                  capBackPool.push(tempV.x, tempV.y, tempV.z);
                } else if (name.includes("FrontL") || name.includes("FrontR")) {
                  frontPool.push(tempV.x, tempV.y, tempV.z);
                } else {
                  sidePool.push(tempV.x, tempV.y, tempV.z);
                }
              }
            }
          }
        });

        // Compute Head Center and Radius for Hair Filtering
        const headCenter = new THREE.Vector3();
        const faceVertCount = facePositions.length / 3;
        for (let i = 0; i < facePositions.length; i += 3) {
          headCenter.x += facePositions[i];
          headCenter.y += facePositions[i+1];
          headCenter.z += facePositions[i+2];
        }
        headCenter.divideScalar(faceVertCount);

        let maxFaceDist = 0;
        for (let i = 0; i < facePositions.length; i += 3) {
          const d = headCenter.distanceTo(new THREE.Vector3(facePositions[i], facePositions[i+1], facePositions[i+2]));
          if (d > maxFaceDist) maxFaceDist = d;
        }
        const headRadius = maxFaceDist * 1.4;

        // Filtering and Weighted Sampling Function
        const filterAndSample = (pool: number[], targetCount: number) => {
          const filtered = [];
          for (let i = 0; i < pool.length; i += 3) {
            const v = new THREE.Vector3(pool[i], pool[i+1], pool[i+2]);
            if (v.distanceTo(headCenter) <= headRadius) {
              filtered.push(pool[i], pool[i+1], pool[i+2]);
            }
          }
          
          const count = filtered.length / 3;
          if (count === 0) return [];
          if (count <= targetCount) return filtered;

          const sampled = [];
          for (let i = 0; i < targetCount; i++) {
            const idx = Math.floor(Math.random() * count) * 3;
            sampled.push(filtered[idx], filtered[idx+1], filtered[idx+2]);
          }
          return sampled;
        };

        const finalCapBack = filterAndSample(capBackPool, 1800);
        const finalFront = filterAndSample(frontPool, 600);
        const finalSide = filterAndSample(sidePool, 600);
        
        const hairPositions = [...finalCapBack, ...finalFront, ...finalSide];

        console.log("Hair breakdown - Cap/Back:", finalCapBack.length / 3, "Front:", finalFront.length / 3, "Side:", finalSide.length / 3, "Total:", hairPositions.length / 3);

        const faceWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.35 });
        const mouthWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.25 });
        materials.push(faceWireMat, mouthWireMat);

        faceWireGeoList.forEach(geo => {
          geometries.push(geo);
          scene.add(new THREE.Mesh(geo, faceWireMat));
        });

        mouthWireGeoList.forEach(geo => {
          geometries.push(geo);
          scene.add(new THREE.Mesh(geo, mouthWireMat));
        });

        const createPoints = (pos: number[], color: number, size: number, opacity: number, additive = true) => {
          if (pos.length === 0) return;
          const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          const mat = new THREE.PointsMaterial({ 
            color, size, transparent: true, opacity, 
            blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
            depthWrite: false 
          });
          geometries.push(geo);
          materials.push(mat);
          scene.add(new THREE.Points(geo, mat));
        };

        createPoints(facePositions, 0x4ff0ff, 0.025, 0.9);
        createPoints(hairPositions, 0x1a5fb4, 0.02, 0.55);
        createPoints(eyePositions, 0x4ff0ff, 0.012, 0.5, false);
        createPoints(mouthPositions, 0x4ff0ff, 0.02, 0.3);

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
