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

/**
 * @fileOverview CandidateHologram - GPU Efficiency & Stability Protocol.
 * Removed EffectComposer/Bloom to prevent memory exhaustion.
 * Uses standard materials ONLY to prevent D3D11 shader compiler errors.
 * Strict cleanup prevents WebGL context leaks during hot-reloads.
 */
export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
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
    if (!containerRef.current || !canvasRef.current) return;

    let isMounted = true;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // 1. SCENE SETUP (LITE)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000810); // Deep Space Black
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.0); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      const gltfScene = gltf.scene;
      
      // GEOMETRIC RESET PROTOCOL
      const box = new THREE.Box3().setFromObject(gltfScene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.4 / maxDim;
      gltfScene.scale.setScalar(scale);

      // Recompute AFTER scaling for perfect centering
      const scaledBox = new THREE.Box3().setFromObject(gltfScene);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      
      gltfScene.position.x -= scaledCenter.x;
      gltfScene.position.y -= scaledCenter.y;
      gltfScene.position.z -= scaledCenter.z;

      console.log("[Hologram] Normalized Dimensions:", scaledSize.x.toFixed(2), "x", scaledSize.y.toFixed(2), "x", scaledSize.z.toFixed(2));
      console.log("[Hologram] Final model world position:", gltfScene.position);

      const pointsPool: { pos: THREE.Vector3; type: string }[] = [];
      const HAIR_TOTAL_LIMIT = 1200;
      let hairCount = 0;

      gltfScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          const isFace = name.includes("Face_mush_Face");
          const isMouth = name.includes("Mouth_mush_Mouth");
          const isIris = name.includes("Eye_L_Irises") || name.includes("Eye_R_Irises");
          const isHair = name.includes("Hair_mush");

          // Standard Material Overlay (Face Glow)
          if (isFace || isMouth) {
            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x4ff0ff,
              wireframe: true,
              transparent: true,
              opacity: isMouth ? 0.25 : 0.6,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);

            if (isFace) {
              const fillMaterial = new THREE.MeshBasicMaterial({
                color: 0x001a2e,
                transparent: true,
                opacity: 0.15,
                depthWrite: false
              });
              const fillMesh = new THREE.Mesh(mesh.geometry.clone(), fillMaterial);
              fillMesh.applyMatrix4(mesh.matrixWorld);
              scene.add(fillMesh);
            }
          }

          // SAMPLING
          const tempV = new THREE.Vector3();
          for (let i = 0; i < posAttr.count; i++) {
            tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            tempV.applyMatrix4(mesh.matrixWorld);

            if (isFace) {
              pointsPool.push({ pos: tempV.clone(), type: 'face' });
            } else if (isIris) {
              if (Math.random() < 0.5) pointsPool.push({ pos: tempV.clone(), type: 'eye' });
            } else if (isMouth) {
              if (Math.random() < 0.1) pointsPool.push({ pos: tempV.clone(), type: 'mouth' });
            } else if (isHair) {
              if (hairCount < HAIR_TOTAL_LIMIT && Math.random() < 0.1) {
                pointsPool.push({ pos: tempV.clone(), type: 'hair' });
                hairCount++;
              }
            }
          }
        }
      });

      const totalParticles = pointsPool.length;
      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const mouthIndex = new Float32Array(totalParticles); 

      const faceColor = new THREE.Color(0x4ff0ff);
      const hairColor = new THREE.Color(0x1a5fb4);
      const eyeColor = new THREE.Color(0x006677);

      for (let i = 0; i < totalParticles; i++) {
        const t = pointsPool[i];
        const i3 = i * 3;
        
        positions[i3] = (Math.random() - 0.5) * 5;
        positions[i3 + 1] = (Math.random() - 0.5) * 5;
        positions[i3 + 2] = (Math.random() - 0.5) * 5;

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        if (t.type === 'mouth') mouthIndex[i] = 1.0;

        let col = faceColor;
        if (t.type === 'hair') col = hairColor;
        if (t.type === 'eye') col = eyeColor;
        
        colors[i3] = col.r; colors[i3+1] = col.g; colors[i3+2] = col.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const pointsMaterial = new THREE.PointsMaterial({
        size: 0.022,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, pointsMaterial);
      scene.add(points);

      let time = 0;
      const ease = 0.05;
      const damping = 0.88;

      const animate = () => {
        if (!isMounted) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechIntensity = speaking ? Math.abs(Math.sin(time * 18)) * 0.035 : 0;
        
        for (let i = 0; i < totalParticles; i++) {
          const i3 = i * 3;
          for (let j = 0; j < 3; j++) {
            const idx = i3 + j;
            let target = targetPositions[idx];
            if (j === 1 && mouthIndex[i] > 0.5) {
                target += (Math.random() - 0.5) * speechIntensity;
            }
            const force = (target - pArr[idx]) * ease;
            velocities[idx] = (velocities[idx] + force) * damping;
            pArr[idx] += velocities[idx];
          }
        }
        geometry.attributes.position.needsUpdate = true;

        points.rotation.y += 0.001;
        points.position.y = Math.sin(time * 1.5) * 0.01;

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);
    }, undefined, (err) => {
      console.error("[Hologram] Load Fault:", err);
      setIsLoading(false);
    });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      // AGGRESSIVE MEMORY CLEANUP
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh || (object as THREE.Points).isPoints) {
          const mesh = object as THREE.Mesh | THREE.Points;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
      console.log("[Hologram] WebGL Context Disposed.");
    };
  }, [speaking]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative overflow-hidden bg-[#000810] shadow-[inset_0_0_100px_rgba(34,211,238,0.05)] ${className ?? ""}`}
      style={{ filter: 'drop-shadow(0 0 10px rgba(79, 240, 255, 0.2))' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000810]/80 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Matrix...</p>
        </div>
      )}
    </div>
  );
}
