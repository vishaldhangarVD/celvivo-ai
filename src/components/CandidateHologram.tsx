
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
 * @fileOverview CandidateHologram v25.0 - Anatomical Realism & Volumetric Pass.
 * Fixes proportions, hair volume, and skeletal look via fill layering and prioritized sampling.
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

    // 1. Scene & Camera Setup (Portrait Matrix)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 2.5);
    camera.lookAt(0, 0, 0);

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

    const manager = new THREE.LoadingManager();
    manager.onError = () => {}; 

    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      // PROPORTION CORRECTION: Identify the face mesh to calibrate ratios
      let faceMesh: THREE.Mesh | null = null;
      gltf.scene.traverse((child) => {
        if (child.name === "Face_mush_Face_0") faceMesh = child as THREE.Mesh;
      });

      // Align model rotation (baked offset compensation)
      gltf.scene.rotation.y = -0.12; 

      // NORMALIZATION & PROPORTION PROTOCOL
      const wholeBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = wholeBox.getCenter(new THREE.Vector3());
      const size = wholeBox.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 1.6 / maxDim;

      // Apply initial centering and scaling
      gltf.scene.position.sub(center);
      gltf.scene.scale.setScalar(baseScale);

      // NON-UNIFORM PROPORTION FIX: Check if head is too egg-shaped
      if (faceMesh) {
        const faceBox = new THREE.Box3().setFromObject(faceMesh);
        const faceSize = faceBox.getSize(new THREE.Vector3());
        const hwRatio = faceSize.x / faceSize.y;
        console.log(`[Hologram] Proportion Audit - Ratio: ${hwRatio.toFixed(2)}`);
        
        // If ratio is too low (thin head), reduce Y scale slightly to round it out
        if (hwRatio < 0.7) {
          gltf.scene.scale.y *= 0.88;
          console.log("[Hologram] Proportions Adjusted: Applied Y-compression.");
        }
      }

      const pointsPool: { pos: THREE.Vector3; type: string }[] = [];

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          // Categorization
          const isFace = name === "Face_mush_Face_0";
          const isMouth = name === "Mouth_mush_Mouth_0";
          const isIris = name.includes("Eye_L_Irises") || name.includes("Eye_R_Irises");
          const isHairCap = name === "Hair_mush_Hair_Cap_0";
          const isHairFringe = name.includes("Back_Mat") || name.includes("FrontL_Mat") || name.includes("FrontR_Mat");
          const isHairSides = name.includes("SideL_Mat") || name.includes("SideR_Mat") || name.includes("SideL_f_Mat") || name.includes("SideR_f_Mat");

          // Skip torso
          if (name.includes("Torso")) return;

          // SOLIDITY LAYER: Add translucent fill behind wireframe for the face only
          if (isFace) {
            const fillMaterial = new THREE.MeshBasicMaterial({
              color: 0x003344,
              transparent: true,
              opacity: 0.15,
              depthWrite: false,
              side: THREE.FrontSide
            });
            const fillMesh = new THREE.Mesh(mesh.geometry.clone(), fillMaterial);
            fillMesh.applyMatrix4(mesh.matrixWorld);
            fillMesh.scale.multiplyScalar(0.99); // Slightly smaller to prevent Z-fighting with wireframe
            scene.add(fillMesh);

            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x22d3ee,
              transparent: true,
              opacity: 0.25,
              wireframe: true,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);
          }

          // MOUTH WIREFRAME: Subdued for cleaner lips
          if (isMouth) {
            const mouthWire = new THREE.MeshBasicMaterial({
              color: 0x22d3ee,
              transparent: true,
              opacity: 0.15,
              wireframe: true,
              depthWrite: false
            });
            const mouthMesh = new THREE.Mesh(mesh.geometry.clone(), mouthWire);
            mouthMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(mouthMesh);
          }

          // PARTICLE SAMPLING
          for (let i = 0; i < posAttr.count; i++) {
            const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            v.applyMatrix4(mesh.matrixWorld);

            // Per-mesh sampling density
            let shouldSample = false;
            let type = 'face';

            if (isFace) shouldSample = true;
            else if (isIris) { shouldSample = Math.random() > 0.4; type = 'eye'; }
            else if (isMouth) { shouldSample = Math.random() > 0.85; type = 'mouth'; } // Outline only
            else if (isHairCap) { shouldSample = Math.random() > 0.5; type = 'hair'; } // Prioritize top volume
            else if (isHairFringe) { shouldSample = Math.random() > 0.85; type = 'hair'; }
            else if (isHairSides) { shouldSample = Math.random() > 0.96; type = 'hair'; } // Minimal sides

            if (shouldSample) {
              pointsPool.push({ pos: v, type });
            }
          }
        }
      });

      // Cap and shuffle
      const finalPool = pointsPool.sort(() => Math.random() - 0.5).slice(0, 14000);
      const totalParticles = finalPool.length;

      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles); 
      const isMouthArray = new Float32Array(totalParticles); 

      const faceColor = new THREE.Color(0x4ff0ff);
      const hairColor = new THREE.Color(0x1a5fb4);

      for (let i = 0; i < totalParticles; i++) {
        const t = finalPool[i];
        const i3 = i * 3;

        // Scatter spawn
        positions[i3] = (Math.random() - 0.5) * 3.0;
        positions[i3 + 1] = (Math.random() - 0.5) * 3.0;
        positions[i3 + 2] = (Math.random() - 0.5) * 3.0;

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        if (t.type === 'mouth') isMouthArray[i] = 1.0;

        if (t.type === 'hair') {
          colors[i3] = hairColor.r; colors[i3+1] = hairColor.g; colors[i3+2] = hairColor.b;
          sizes[i] = 0.016;
        } else {
          colors[i3] = faceColor.r; colors[i3+1] = faceColor.g; colors[i3+2] = faceColor.b;
          sizes[i] = t.type === 'eye' ? 0.035 : 0.028;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          varying float vDepth;
          void main() {
            vColor = color;
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

      // Animation loop
      let time = 0;
      const ease = 0.045;
      const damping = 0.90;

      const animate = () => {
        if (!isMounted) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechIntensity = speaking ? Math.abs(Math.sin(time * 15)) * 0.03 : 0;

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
        points.position.y = Math.sin(time * 1.5) * 0.015;

        composer.render();
      };

      animate();
      setIsLoading(false);
      console.log(`[Hologram] Reconstruction Complete - Matrix Count: ${totalParticles}`);
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
