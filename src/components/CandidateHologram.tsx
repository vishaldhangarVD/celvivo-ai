
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
 * @fileOverview CandidateHologram - High-Fidelity Holographic Projection Engine v7.0.
 * Optimized for woman_head.glb with weighted mesh sampling and neural spring physics.
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
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
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
    camera.position.set(0, 0.1, 2.8);
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
    bloomPassRef.current = bloomPass;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 3. Particle System Data
    const PARTICLE_COUNT = 8000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // Initial random spawn in a loose sphere
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Default positions before model loads
      targetPositions[i * 3] = positions[i * 3];
      targetPositions[i * 3 + 1] = positions[i * 3 + 1];
      targetPositions[i * 3 + 2] = positions[i * 3 + 2];
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

    // 4. Model Loading Logic
    const loader = new GLTFLoader();
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;
      
      console.log("[Hologram] Scene Graph:", gltf.scene);
      
      const meshNames: string[] = [];
      const targetPool: THREE.Vector3[] = [];

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          meshNames.push(child.name);
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name.toLowerCase();
          
          // Weighted Sampling
          let density = 1.0;
          if (name.includes('hair')) density = 0.25;
          if (name.includes('body') || name.includes('cloth') || child.position.y < -0.5) density = 0;

          if (density > 0) {
            for (let i = 0; i < posAttr.count; i++) {
              if (Math.random() > density) continue;
              const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
              v.applyMatrix4(mesh.matrixWorld);
              targetPool.push(v);
            }
          }
        }
      });

      console.log("Mesh names:", meshNames);
      console.log("Vertex count:", targetPool.length);

      if (targetPool.length > 0) {
        const box = new THREE.Box3().setFromPoints(targetPool);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.log("Bounding box size:", size);

        const scale = 1.6 / size.y;

        // Face Orientation Detection (Positive Z facing camera)
        let forwardPoints = 0;
        targetPool.forEach(v => { if (v.z - center.z > 0) forwardPoints++; });
        const rotationY = forwardPoints < targetPool.length / 2 ? Math.PI : 0;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const v = targetPool[i % targetPool.length].clone();
          v.sub(center).multiplyScalar(scale);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
          
          targetPositions[i * 3] = v.x;
          targetPositions[i * 3 + 1] = v.y;
          targetPositions[i * 3 + 2] = v.z;

          // Apply Gradient Color
          const color = new THREE.Color();
          color.setHSL(0.5 + v.y * 0.1, 0.9, 0.6); // Cyan to blue based on Y
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        geometry.attributes.color.needsUpdate = true;
      }

      setIsLoading(false);
    }, undefined, (err) => {
      console.error("[Hologram] GLB Load Failed:", err);
      setIsLoading(false);
    });

    // 5. Physics Animation Loop
    let time = 0;
    const ease = 0.045;
    const damping = 0.90;

    const animate = () => {
      if (!isMounted) return;
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      const posAttr = geometry.attributes.position;
      const pArr = posAttr.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        for (let j = 0; j < 3; j++) {
          const idx = i3 + j;
          const force = (targetPositions[idx] - pArr[idx]) * ease;
          velocities[idx] = (velocities[idx] + force) * damping;
          pArr[idx] += velocities[idx];
        }
      }
      posAttr.needsUpdate = true;

      // Subtle Idle Movement
      points.rotation.y += 0.0015;
      points.position.y = Math.sin(time * 2.0) * 0.02;

      composer.render();
    };

    animate();

    // 6. Cleanup
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
      
      geometry.dispose();
      particleMaterial.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative overflow-hidden bg-[#001a2e] ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Cinematic Overlays */}
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
