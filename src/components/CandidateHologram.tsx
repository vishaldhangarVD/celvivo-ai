
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
 * @fileOverview CandidateHologram v26.0 - Axial Alignment & Frame Optimization.
 * Hard-codes front-facing rotation, increases scale to fill panel, and enforces centering.
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
    
    // Get actual container dimensions
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    console.log(`[Hologram] Initializing Matrix: ${width}x${height}`);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    // Frame the face tightly
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 2.2); // Moved closer from 2.8 -> 2.2
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
    manager.onError = (url) => console.warn(`[Hologram] Resource failed: ${url}`); 

    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      // AXIAL ALIGNMENT PROTOCOL
      // Adjust this value if the model is not looking directly at the camera
      gltf.scene.rotation.y = -0.12; 
      console.log(`[Hologram] Applied fixed rotation: ${gltf.scene.rotation.y}`);

      // NORMALIZATION & CENTERING
      const wholeBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = wholeBox.getCenter(new THREE.Vector3());
      const size = wholeBox.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetHeight = 1.8; // Increased from 1.6 to fill panel more
      const baseScale = targetHeight / maxDim;

      // Reset position to origin and scale
      gltf.scene.position.sub(center);
      gltf.scene.scale.setScalar(baseScale);
      
      const normalizedBox = new THREE.Box3().setFromObject(gltf.scene);
      const finalSize = normalizedBox.getSize(new THREE.Vector3());
      console.log(`[Hologram] Normalized Dimensions: ${finalSize.x.toFixed(2)}x${finalSize.y.toFixed(2)}x${finalSize.z.toFixed(2)}`);

      // PARTICLE RECONSTRUCTION
      const pointsPool: { pos: THREE.Vector3; type: string }[] = [];

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          const isFace = name.includes("Face_mush_Face");
          const isMouth = name.includes("Mouth_mush_Mouth");
          const isIris = name.includes("Eye_") && name.includes("Irises");
          const isHairCap = name === "Hair_mush_Hair_Cap_0";
          const isHairOther = name.includes("Hair_mush");

          if (name.includes("Torso")) return;

          // SOLIDITY LAYER: Fill behind wireframe
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
            fillMesh.scale.multiplyScalar(0.99);
            scene.add(fillMesh);

            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x22d3ee,
              transparent: true,
              opacity: 0.2,
              wireframe: true,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);
          }

          // PARTICLE SAMPLING
          for (let i = 0; i < posAttr.count; i++) {
            const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            v.applyMatrix4(mesh.matrixWorld);

            let shouldSample = false;
            let type = 'face';

            if (isFace) shouldSample = true;
            else if (isIris) { shouldSample = true; type = 'eye'; }
            else if (isMouth) { shouldSample = Math.random() > 0.6; type = 'mouth'; }
            else if (isHairCap) { shouldSample = Math.random() > 0.4; type = 'hair'; }
            else if (isHairOther) { shouldSample = Math.random() > 0.95; type = 'hair'; }

            if (shouldSample) {
              pointsPool.push({ pos: v, type });
            }
          }
        }
      });

      const finalPool = pointsPool.sort(() => Math.random() - 0.5).slice(0, 15000);
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

        positions[i3] = (Math.random() - 0.5) * 4.0;
        positions[i3 + 1] = (Math.random() - 0.5) * 4.0;
        positions[i3 + 2] = (Math.random() - 0.5) * 4.0;

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
            gl_PointSize = size * (350.0 / -mvPosition.z);
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
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001a2e]/60 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initializing Matrix...</p>
        </div>
      )}
    </div>
  );
}
