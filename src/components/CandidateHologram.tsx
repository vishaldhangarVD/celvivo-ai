
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * @fileOverview CandidateHologram v10.0 - Weighted Neural Reconstruction.
 * Optimized for woman_head.glb with specific mesh-name sampling and normalization.
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
  const composerRef = useRef<EffectComposer | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let isMounted = true;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer & Post-Processing
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.55, // Strength
      0.4,  // Radius
      0.12  // Threshold
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 3. Model Loading & Weighted Sampling
    const loader = new GLTFLoader();
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      const targetPool: { pos: THREE.Vector3, type: 'face' | 'hair' }[] = [];
      let faceCount = 0;
      let hairCount = 0;

      // Extract raw data for normalization
      const wholeBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = wholeBox.getCenter(new THREE.Vector3());
      const size = wholeBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.6 / maxDim; // Target 1.6 units height

      console.log(`[Hologram] Initial Box: ${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}`);

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          // Categorization Protocol
          const isFace = name.includes("Face_mush_Face") || 
                        name.includes("Mouth_mush_Mouth") || 
                        name.includes("Eye_") || 
                        name.includes("Cornea_") || 
                        name.includes("Eyelashes");
          
          const isHair = name.includes("Hair_mush");
          const isExcluded = name.includes("Torso");

          if (isExcluded) return;

          // Weighted Density Logic
          // Face: 100% (1.0), Hair: 8% (0.08)
          const density = isFace ? 1.0 : (isHair ? 0.08 : 0.0);

          if (density > 0) {
            for (let i = 0; i < posAttr.count; i++) {
              if (Math.random() > density) continue;

              const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
              v.applyMatrix4(mesh.matrixWorld);
              
              // Normalize and Center
              v.sub(center).multiplyScalar(scale);

              targetPool.push({ pos: v, type: isFace ? 'face' : 'hair' });
              if (isFace) faceCount++; else hairCount++;
            }
          }
        }
      });

      const totalParticles = targetPool.length;
      console.log(`[Hologram] Breakdown - Face: ${faceCount}, Hair: ${hairCount}, Total: ${totalParticles}`);
      
      // Secondary Scale Verification
      const finalPositions = targetPool.map(t => t.pos);
      const finalBox = new THREE.Box3().setFromPoints(finalPositions);
      const finalSize = finalBox.getSize(new THREE.Vector3());
      console.log(`[Hologram] Normalized Box: ${finalSize.x.toFixed(2)}x${finalSize.y.toFixed(2)}x${finalSize.z.toFixed(2)}`);

      // 4. Initialize Particle System
      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const isMouthArray = new Float32Array(totalParticles); // 1.0 if mouth particle

      for (let i = 0; i < totalParticles; i++) {
        const t = targetPool[i];
        const i3 = i * 3;

        // Spawn randomly in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.2;
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        // Mask for mouth movement (approx Y range for woman_head)
        // Adjusting based on normalized 1.6 height centered at 0
        if (t.pos.y > -0.4 && t.pos.y < -0.2 && Math.abs(t.pos.x) < 0.15 && t.pos.z > 0.1) {
          isMouthArray[i] = 1.0;
        }

        const color = new THREE.Color();
        if (t.type === 'face') {
            color.setHSL(0.52, 0.9, 0.6 + t.pos.y * 0.1); // Bright Cyan
        } else {
            color.setHSL(0.6, 0.8, 0.4); // Deeper Blue for hair
        }
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.025,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });

      const points = new THREE.Points(geometry, particleMaterial);
      scene.add(points);

      // 5. Physics Animation Loop
      let time = 0;
      const ease = 0.045;
      const damping = 0.90;

      const animate = () => {
        if (!isMounted) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechIntensity = speaking ? Math.abs(Math.sin(time * 12)) * 0.03 : 0;

        for (let i = 0; i < totalParticles; i++) {
          const i3 = i * 3;
          for (let j = 0; j < 3; j++) {
            const idx = i3 + j;
            let target = targetPositions[idx];
            
            // Apply Speech Jitter to Mouth Particles
            if (j === 1 && isMouthArray[i] > 0.5) {
                target += (Math.random() - 0.5) * speechIntensity;
            }

            const force = (target - pArr[idx]) * ease;
            velocities[idx] = (velocities[idx] + force) * damping;
            pArr[idx] += velocities[idx];
          }
        }
        geometry.attributes.position.needsUpdate = true;

        points.rotation.y += 0.0015;
        points.position.y = Math.sin(time * 2.0) * 0.02;

        composer.render();
      };

      animate();
      setIsLoading(false);
    }, undefined, (err) => {
      console.error("[Hologram] Critical Load Fault:", err);
      setIsLoading(false);
    });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      
      scene.clear();
      rendererRef.current?.dispose();
    };
  }, [speaking]);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden bg-[#001a2e] ${className ?? ""}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Identity Handshake Overlays */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        
        {isLoader && (
          <div className="absolute inset-x-0 bottom-12 z-50 flex flex-col items-center gap-4">
            <div className="text-center animate-pulse">
              <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase">
                Synchronizing Identity...
              </span>
            </div>
          </div>
        )}
      </div>

      {isLoading && !isLoader && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001a2e]/60 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix...</p>
        </div>
      )}
    </div>
  );
}
