
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

      // 1. Scene & Camera Setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);

      // 2. Renderer Initialization
      try {
        const renderer = new THREE.WebGLRenderer({ 
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

      // 3. Model Loading & Particle Generation
      const loader = new GLTFLoader();
      loader.load('/models/woman_head.glb', (gltf) => {
        if (!isMounted) return;

        const gltfScene = gltf.scene;

        // Bounding Box Logic (Step-by-Step as specified)
        const boxRaw = new THREE.Box3().setFromObject(gltfScene);
        const sizeRaw = boxRaw.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeRaw.x, sizeRaw.y, sizeRaw.z);
        const scale = 1.4 / maxDim;
        gltfScene.scale.setScalar(scale);

        const newBoundingBox = new THREE.Box3().setFromObject(gltfScene);
        gltfScene.position.sub(newBoundingBox.getCenter(new THREE.Vector3()));

        const facePositions: number[] = [];
        const hairPool: number[] = [];
        const eyePositions: number[] = [];
        const mouthPositions: number[] = [];

        const faceWireGeoList: THREE.BufferGeometry[] = [];
        const mouthWireGeoList: THREE.BufferGeometry[] = [];

        gltfScene.traverse((child) => {
          if ((child as any).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = mesh.name;
            
            if (name.includes("Torso")) return;

            const posAttr = mesh.geometry.attributes.position;
            const tempV = new THREE.Vector3();

            // Category Identification
            const isFace = name.includes("Face_mush_Face");
            const isMouth = name.includes("Mouth_mush_Mouth");
            const isEyes = name.includes("Eye_L_Irises") || name.includes("Eye_R_Irises");
            const isHair = name.includes("Hair_mush");

            // Wireframe Collection
            if (isFace) faceWireGeoList.push(mesh.geometry);
            if (isMouth) mouthWireGeoList.push(mesh.geometry);

            // Vertex Sampling
            for (let i = 0; i < posAttr.count; i++) {
              tempV.fromBufferAttribute(posAttr, i);
              tempV.applyMatrix4(mesh.matrixWorld);

              if (isFace) {
                facePositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isMouth) {
                mouthPositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isEyes) {
                eyePositions.push(tempV.x, tempV.y, tempV.z);
              } else if (isHair) {
                hairPool.push(tempV.x, tempV.y, tempV.z);
              }
            }
          }
        });

        // Hair Sampling (Hard cap at 1200)
        const hairPositions: number[] = [];
        const hairVertexCount = hairPool.length / 3;
        const hairSampleCount = Math.min(hairVertexCount, 1200);
        for (let i = 0; i < hairSampleCount; i++) {
          const idx = Math.floor(Math.random() * hairVertexCount) * 3;
          hairPositions.push(hairPool[idx], hairPool[idx + 1], hairPool[idx + 2]);
        }

        // Materials & Scene Construction
        const faceWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.6 });
        const mouthWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.25 });
        materials.push(faceWireMat, mouthWireMat);

        faceWireGeoList.forEach(geo => {
          const m = new THREE.Mesh(geo, faceWireMat);
          m.position.copy(gltfScene.position);
          m.scale.copy(gltfScene.scale);
          scene.add(m);
        });

        mouthWireGeoList.forEach(geo => {
          const m = new THREE.Mesh(geo, mouthWireMat);
          m.position.copy(gltfScene.position);
          m.scale.copy(gltfScene.scale);
          scene.add(m);
        });

        const createPoints = (pos: number[], color: number, size: number, opacity: number, additive = true) => {
          const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          const mat = new THREE.PointsMaterial({ 
            color, 
            size, 
            transparent: true, 
            opacity, 
            blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
            depthWrite: false 
          });
          geometries.push(geo);
          materials.push(mat);
          scene.add(new THREE.Points(geo, mat));
        };

        createPoints(facePositions, 0x4ff0ff, 0.025, 0.85);
        createPoints(hairPositions, 0x1a5fb4, 0.01, 0.4);
        createPoints(eyePositions, 0x4ff0ff, 0.012, 0.5, false);
        createPoints(mouthPositions, 0x4ff0ff, 0.025, 0.3);

        // 4. Animation Loop
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
