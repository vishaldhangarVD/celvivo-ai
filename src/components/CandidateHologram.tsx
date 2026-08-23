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
        gltfScene.position.sub(newBoundingBox.getCenter(new THREE.Vector3()));
        gltfScene.updateMatrixWorld(true);

        const facePositions: number[] = [];
        const eyePositions: number[] = [];
        const mouthPositions: number[] = [];
        
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

              if (isFace) facePositions.push(tempV.x, tempV.y, tempV.z);
              else if (isMouth) mouthPositions.push(tempV.x, tempV.y, tempV.z);
              else if (isEyes) eyePositions.push(tempV.x, tempV.y, tempV.z);
              else if (isHair) {
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

        // Compute Head Center for Flow Bias
        const headCenter = new THREE.Vector3();
        const facePtsCount = facePositions.length / 3;
        for (let i = 0; i < facePositions.length; i += 3) {
          headCenter.x += facePositions[i];
          headCenter.y += facePositions[i+1];
          headCenter.z += facePositions[i+2];
        }
        headCenter.divideScalar(facePtsCount);

        const sampleAndFlow = (pool: number[], target: number) => {
          const result = [];
          const count = pool.length / 3;
          if (count === 0) return result;
          for (let i = 0; i < target; i++) {
            const idx = Math.floor(Math.random() * count) * 3;
            let px = pool[idx];
            let py = pool[idx+1];
            let pz = pool[idx+2];
            
            // Jitter reuse if pool is smaller than target
            if (i >= count) {
              px += (Math.random() - 0.5) * 0.01;
              py += (Math.random() - 0.5) * 0.01;
              pz += (Math.random() - 0.5) * 0.01;
            }

            // Directional Elongation: Outward from center + Downward gravity
            const pVec = new THREE.Vector3(px, py, pz);
            const dirOut = new THREE.Vector3().subVectors(pVec, headCenter).normalize();
            const flowMag = 0.01 + Math.random() * 0.01;
            pVec.addScaledVector(dirOut, flowMag);
            pVec.y -= flowMag;
            
            result.push(pVec.x, pVec.y, pVec.z);
          }
          return result;
        };

        const finalHairNodes = [
          ...sampleAndFlow(capBackPool, 5500),
          ...sampleAndFlow(frontPool, 1800),
          ...sampleAndFlow(sidePool, 1700)
        ];

        const faceWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.35 });
        const mouthWireMat = new THREE.MeshBasicMaterial({ color: 0x4ff0ff, wireframe: true, transparent: true, opacity: 0.25 });
        materials.push(faceWireMat, mouthWireMat);

        faceWireGeoList.forEach(geo => { geometries.push(geo); scene.add(new THREE.Mesh(geo, faceWireMat)); });
        mouthWireGeoList.forEach(geo => { geometries.push(geo); scene.add(new THREE.Mesh(geo, mouthWireMat)); });

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
        
        // Stratified Hair Materials for realistic variance
        const hairChunks = [
          finalHairNodes.slice(0, 9000), // Tier Alpha
          finalHairNodes.slice(9000, 18000), // Tier Beta
          finalHairNodes.slice(18000) // Tier Gamma
        ];
        
        // Group nodes for 3 distinct material properties
        const ptsA = [], ptsB = [], ptsC = [];
        for (let i = 0; i < finalHairNodes.length; i += 3) {
          const r = Math.random();
          if (r < 0.33) ptsA.push(finalHairNodes[i], finalHairNodes[i+1], finalHairNodes[i+2]);
          else if (r < 0.66) ptsB.push(finalHairNodes[i], finalHairNodes[i+1], finalHairNodes[i+2]);
          else ptsC.push(finalHairNodes[i], finalHairNodes[i+1], finalHairNodes[i+2]);
        }

        createPoints(ptsA, 0x1a5fb4, 0.014, 0.4);
        createPoints(ptsB, 0x1a5fb4, 0.02, 0.5);
        createPoints(ptsC, 0x1a5fb4, 0.026, 0.6);

        createPoints(eyePositions, 0x4ff0ff, 0.012, 0.5, false);
        createPoints(mouthPositions, 0x4ff0ff, 0.02, 0.3);

        console.log("[Hologram] Total Nodes:", (facePositions.length + finalHairNodes.length + eyePositions.length + mouthPositions.length) / 3);
        console.log("[Hologram] Hair Nodes:", finalHairNodes.length / 3);

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
