
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
 * @fileOverview CandidateHologram v18.0 - Anatomical Precision Pass.
 * Implements specific mesh sampling for eyes/mouth and depth-based shading for facial contours.
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

    // 1. Scene & Camera Setup (Normalized Portrait Framing)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.4);
    camera.lookAt(0, -0.05, 0);

    // 2. Renderer & Post-Processing (Cyan Bloom Protocol)
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
      0.55, 
      0.4,  
      0.12  
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 3. Model Loading & Anatomical Sampling Protocol
    const manager = new THREE.LoadingManager();
    manager.onError = () => {}; // Silently handle texture errors

    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      const facePool: THREE.Vector3[] = [];
      const eyePool: THREE.Vector3[] = [];
      const mouthPool: THREE.Vector3[] = [];
      const hairPool: THREE.Vector3[] = [];

      // Extract raw data for normalization
      const wholeBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = wholeBox.getCenter(new THREE.Vector3());
      const size = wholeBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.6 / maxDim;

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          // Exclusion check
          if (name.includes("Torso")) return;

          // Mesh Classification
          const isFace = name === "Face_mush_Face_0";
          const isMouth = name === "Mouth_mush_Mouth_0";
          const isIris = name === "Eye_L_Irises_0" || name === "Eye_R_Irises_0";
          const isHair = name.includes("Hair_mush");

          for (let i = 0; i < posAttr.count; i++) {
            // Sampling Filters
            if (isMouth && Math.random() > 0.35) continue; // Decimate mouth grid
            if (isHair && Math.random() > 0.1) continue;   // Initial hair reduction

            const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            v.applyMatrix4(mesh.matrixWorld);
            v.sub(center).multiplyScalar(scale);

            if (isFace) facePool.push(v);
            else if (isMouth) mouthPool.push(v);
            else if (isIris) eyePool.push(v);
            else if (isHair) hairPool.push(v);
          }
        }
      });

      // Cap Protocols
      const sampledEyes = eyePool.sort(() => Math.random() - 0.5).slice(0, 400);
      const sampledHair = hairPool.sort(() => Math.random() - 0.5).slice(0, 1800);

      const combinedPoints = [
        ...facePool.map(p => ({ pos: p, type: 'face' })),
        ...mouthPool.map(p => ({ pos: p, type: 'mouth' })),
        ...sampledEyes.map(p => ({ pos: p, type: 'eye' })),
        ...sampledHair.map(p => ({ pos: p, type: 'hair' }))
      ];

      const totalParticles = combinedPoints.length;

      console.log(`[Hologram] Precise Breakdown - Face: ${facePool.length}, Mouth: ${mouthPool.length}, Eyes: ${sampledEyes.length}, Hair: ${sampledHair.length}`);

      // 4. Initialize Particle Attributes
      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles); 
      const isMouthArray = new Float32Array(totalParticles); 

      const faceColor = new THREE.Color(0x4ff0ff);
      const hairColor = new THREE.Color(0x1a5fb4);

      for (let i = 0; i < totalParticles; i++) {
        const t = combinedPoints[i];
        const i3 = i * 3;

        // Random orbital spawn
        const r = 2.5;
        positions[i3] = (Math.random() - 0.5) * r;
        positions[i3 + 1] = (Math.random() - 0.5) * r;
        positions[i3 + 2] = (Math.random() - 0.5) * r;

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        if (t.type === 'mouth') isMouthArray[i] = 1.0;

        if (t.type === 'face' || t.type === 'eye' || t.type === 'mouth') {
            colors[i3] = faceColor.r;
            colors[i3 + 1] = faceColor.g;
            colors[i3 + 2] = faceColor.b;
            sizes[i] = t.type === 'eye' ? 0.035 : 0.03; 
        } else {
            colors[i3] = hairColor.r;
            colors[i3 + 1] = hairColor.g;
            colors[i3 + 2] = hairColor.b;
            sizes[i] = 0.018;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // 5. Shading Logic: Depth-Based Intensity
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          varying float vDepth;
          void main() {
            vColor = color;
            // Particles at the front (+Z) get 1.0 intensity, back gets 0.6
            vDepth = smoothstep(-0.2, 0.4, position.z);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vDepth;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            float intensity = 0.6 + (vDepth * 0.4);
            gl_FragColor = vec4(vColor * intensity, 1.0);
          }
        `,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, particleMaterial);
      scene.add(points);

      // 6. Physics Loop
      let time = 0;
      const ease = 0.045;
      const damping = 0.90;

      const animate = () => {
        if (!isMounted) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechIntensity = speaking ? Math.abs(Math.sin(time * 12)) * 0.04 : 0;

        for (let i = 0; i < totalParticles; i++) {
          const i3 = i * 3;
          for (let j = 0; j < 3; j++) {
            const idx = i3 + j;
            let target = targetPositions[idx];
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001a2e]/60 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix...</p>
        </div>
      )}
    </div>
  );
}

