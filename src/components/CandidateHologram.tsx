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
 * @fileOverview CandidateHologram v65.0 - PRECISION VERTICAL CENTERING.
 * Locked at 0.9 unit height with a 1.6 camera distance.
 * Applied a 0.15 unit downward nudge for perfect panel alignment.
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
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    console.log(`[Hologram] Canvas Initialized: ${width}x${height}`);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, -0.15, 1.6); // Lowered to 0.15 for final alignment
    camera.lookAt(0, -0.15, 0);

    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    manager.onError = () => {}; // Silently suppress texture warnings

    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      const gltfScene = gltf.scene;

      // 1. AXIAL ALIGNMENT (Hard-coded for front-facing symmetry)
      gltfScene.rotation.y = -0.12; 

      // 2. PRECISION SCALING (Stable 0.9 target)
      const box = new THREE.Box3().setFromObject(gltfScene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.9 / maxDim;
      gltfScene.scale.setScalar(scale);

      // 3. POST-SCALE CENTERING + INCREASED VERTICAL NUDGE
      const scaledBox = new THREE.Box3().setFromObject(gltfScene);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      
      gltfScene.position.x -= scaledCenter.x;
      gltfScene.position.y -= (scaledCenter.y + 0.15); // Nudged down further
      gltfScene.position.z -= scaledCenter.z;

      console.log(`[Hologram] Normalized Dimensions: ${scaledSize.x.toFixed(2)}x${scaledSize.y.toFixed(2)}x${scaledSize.z.toFixed(2)}`);

      const pointsPool: { pos: THREE.Vector3; type: string }[] = [];
      let counts = { face: 0, hair: 0, eye: 0, mouth: 0 };
      const HAIR_TOTAL_LIMIT = 1200;

      gltfScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          const isFace = name.includes("Face_mush_Face");
          const isMouth = name.includes("Mouth_mush_Mouth");
          const isIris = name.includes("Eye_L_Irises") || name.includes("Eye_R_Irises");
          const isHairCap = name === "Hair_mush_Hair_Cap_0";
          const isHairOther = name.includes("Hair_mush") && !isHairCap;
          const isTorso = name.includes("Torso");

          if (isTorso) return;

          // Wireframe Layer
          if (isFace || isMouth) {
            const wireMaterial = new THREE.MeshBasicMaterial({
              color: 0x22d3ee,
              wireframe: true,
              transparent: true,
              opacity: isMouth ? 0.25 : 0.6,
              depthWrite: false
            });
            const wireMesh = new THREE.Mesh(mesh.geometry.clone(), wireMaterial);
            wireMesh.applyMatrix4(mesh.matrixWorld);
            scene.add(wireMesh);

            // Volumetric Solid Fill
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
              scene.add(fillMesh);
            }
          }

          // SAMPLING PROTOCOL
          const tempV = new THREE.Vector3();
          for (let i = 0; i < posAttr.count; i++) {
            tempV.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            tempV.applyMatrix4(mesh.matrixWorld);

            let shouldSample = false;
            let type = 'face';

            if (isFace) {
              shouldSample = true;
              counts.face++;
            } else if (isIris) {
              if (counts.eye < 400 && Math.random() < 0.8) {
                shouldSample = true;
                type = 'eye';
                counts.eye++;
              }
            } else if (isMouth) {
              if (Math.random() < 0.1) {
                shouldSample = true;
                type = 'mouth';
                counts.mouth++;
              }
            } else if (isHairCap || isHairOther) {
              if (counts.hair < HAIR_TOTAL_LIMIT && Math.random() < 0.2) {
                shouldSample = true;
                type = isHairCap ? 'hair-cap' : 'hair-side';
                counts.hair++;
              }
            }

            if (shouldSample) {
              pointsPool.push({ pos: tempV.clone(), type });
            }
          }
        }
      });

      const totalParticles = pointsPool.length;
      console.log("FINAL COUNTS - Face:", counts.face, "Hair:", counts.hair, "Eyes:", counts.eye, "Mouth:", counts.mouth, "TOTAL PARTICLES:", totalParticles);

      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles); 
      const alphas = new Float32Array(totalParticles);
      const isMouthArray = new Float32Array(totalParticles); 

      const faceColor = new THREE.Color(0x4ff0ff);
      const hairColor = new THREE.Color(0x1a5fb4);

      for (let i = 0; i < totalParticles; i++) {
        const t = pointsPool[i];
        const i3 = i * 3;

        // Random orbital spawn
        const radius = 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        if (t.type === 'mouth') isMouthArray[i] = 1.0;

        if (t.type.includes('hair')) {
          colors[i3] = hairColor.r; colors[i3+1] = hairColor.g; colors[i3+2] = hairColor.b;
          sizes[i] = 0.01;
          alphas[i] = 0.4;
          targetPositions[i3 + 1] += (Math.random() - 0.5) * 0.01; // Jitter
        } else if (t.type === 'eye') {
          colors[i3] = faceColor.r; colors[i3+1] = faceColor.g; colors[i3+2] = faceColor.b;
          sizes[i] = 0.012;
          alphas[i] = 0.5;
        } else {
          colors[i3] = faceColor.r; colors[i3+1] = faceColor.g; colors[i3+2] = faceColor.b;
          sizes[i] = 0.025;
          alphas[i] = t.type === 'mouth' ? 0.3 : 0.85;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: { 
          uTime: { value: 0 },
          uScanY: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          attribute float alpha;
          varying vec3 vColor;
          varying float vDepth;
          varying float vScan;
          varying float vAlpha;
          uniform float uScanY;
          void main() {
            vColor = color;
            vAlpha = alpha;
            vDepth = smoothstep(-0.2, 0.4, position.z);
            vScan = smoothstep(0.05, 0.0, abs(position.y - uScanY));
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (350.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vDepth;
          varying float vScan;
          varying float vAlpha;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            float intensity = (0.6 + (vDepth * 0.4)) + (vScan * 0.5);
            gl_FragColor = vec4(vColor * intensity, vAlpha);
          }
        `,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, particleMaterial);
      scene.add(points);

      // BASE PROJECTOR RING
      const ringGeom = new THREE.RingGeometry(0.5, 0.7, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.8;
      scene.add(ring);

      // ANIMATION LOOP
      let time = 0;
      const ease = 0.045;
      const damping = 0.90;

      const animate = () => {
        if (!isMounted) return;
        animationRef.current = requestAnimationFrame(animate);
        time += 0.016;

        const pArr = geometry.attributes.position.array as Float32Array;
        const speechIntensity = speaking ? Math.abs(Math.sin(time * 15)) * 0.03 : 0;
        
        particleMaterial.uniforms.uTime.value = time;
        particleMaterial.uniforms.uScanY.value = Math.sin(time * 0.8) * 1.5;

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
        points.position.y = Math.sin(time * 1.2) * 0.012;
        ring.scale.setScalar(1 + Math.sin(time * 2) * 0.05);

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
      composerRef.current?.dispose();
    };
  }, [speaking]);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden bg-[#001a2e] ${className ?? ""}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#001a2e]/60 backdrop-blur-md">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Synchronizing Matrix...</p>
        </div>
      )}
    </div>
  );
}
