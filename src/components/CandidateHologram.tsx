
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
 * @fileOverview CandidateHologram v15.0 - Final High-Fidelity Polish.
 * Implements hard-capped hair sampling, tiered vertex sizes, and chromatic focal separation.
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

    // 1. Scene & Camera Setup (Calibrated Framing)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 2.6);
    camera.lookAt(0, 0, 0);

    // 2. Renderer & Post-Processing (Soft Cyan Glow)
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

    // 3. Model Loading & Weighted Attribute Protocol
    const manager = new THREE.LoadingManager();
    // Suppress harmless texture warnings
    manager.onError = (url) => {
      if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return;
      console.warn("[Hologram] Load Fault:", url);
    };

    const loader = new GLTFLoader(manager);
    
    loader.load('/models/woman_head.glb', (gltf) => {
      if (!isMounted) return;

      const facePool: { pos: THREE.Vector3; type: 'face' }[] = [];
      const hairPool: { pos: THREE.Vector3; type: 'hair' }[] = [];

      // Extract raw data for normalization
      const wholeBox = new THREE.Box3().setFromObject(gltf.scene);
      const center = wholeBox.getCenter(new THREE.Vector3());
      const size = wholeBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.6 / maxDim; // Normalize to 1.6 units

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name;

          const isFace = name.includes("Face_mush_Face") || 
                        name.includes("Mouth_mush_Mouth") || 
                        name.includes("Eye_") || 
                        name.includes("Cornea_") || 
                        name.includes("Eyelashes");
          
          const isHair = name.includes("Hair_mush");
          const isExcluded = name.includes("Torso");

          if (isExcluded) return;

          if (isFace || isHair) {
            for (let i = 0; i < posAttr.count; i++) {
              const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
              v.applyMatrix4(mesh.matrixWorld);
              v.sub(center).multiplyScalar(scale);

              if (isFace) {
                facePool.push({ pos: v, type: 'face' });
              } else {
                hairPool.push({ pos: v, type: 'hair' });
              }
            }
          }
        }
      });

      // Hair Hard-Cap Protocol (Random sampling to exactly 1800 points)
      const hairTargetCount = 1800;
      const sampledHair = [];
      for (let i = 0; i < Math.min(hairTargetCount, hairPool.length); i++) {
        const randIdx = Math.floor(Math.random() * hairPool.length);
        sampledHair.push(hairPool[randIdx]);
      }

      const combinedPool = [...facePool, ...sampledHair];
      const totalParticles = combinedPool.length;

      console.log(`[Hologram] Final Polish Breakdown - Face: ${facePool.length}, Hair: ${sampledHair.length}, Total: ${totalParticles}`);
      console.log(`[Hologram] Normalized Box: ${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}`);

      // 4. Initialize Particle Attributes (Dual Tier: Face vs Hair)
      const positions = new Float32Array(totalParticles * 3);
      const targetPositions = new Float32Array(totalParticles * 3);
      const velocities = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const sizes = new Float32Array(totalParticles); 
      const isMouthArray = new Float32Array(totalParticles); 

      const faceColor = new THREE.Color(0x4ff0ff); // Bright Electric Cyan
      const hairColor = new THREE.Color(0x1a5fb4); // Recessed Cobalt Blue

      for (let i = 0; i < totalParticles; i++) {
        const t = combinedPool[i];
        const i3 = i * 3;

        // Spawn in orbital sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.2;
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        targetPositions[i3] = t.pos.x;
        targetPositions[i3 + 1] = t.pos.y;
        targetPositions[i3 + 2] = t.pos.z;

        // Vocal Matrix Mask (Y-range calibrated for normalized 1.6 height)
        if (t.type === 'face' && t.pos.y > -0.35 && t.pos.y < -0.15 && Math.abs(t.pos.x) < 0.15 && t.pos.z > 0.1) {
          isMouthArray[i] = 1.0;
        }

        if (t.type === 'face') {
            colors[i3] = faceColor.r;
            colors[i3 + 1] = faceColor.g;
            colors[i3 + 2] = faceColor.b;
            sizes[i] = 0.03; // Bold Face Points
        } else {
            colors[i3] = hairColor.r;
            colors[i3 + 1] = hairColor.g;
            colors[i3 + 2] = hairColor.b;
            sizes[i] = 0.018; // Fine Hair Wisps
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      // 5. Custom Shader for Tiered Sizing & Blending
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
          }
        `,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, particleMaterial);
      scene.add(points);

      // 6. Physics Animation Loop
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
            
            // Vocal Jitter on Mouth Nodes
            if (j === 1 && isMouthArray[i] > 0.5) {
                target += (Math.random() - 0.5) * speechIntensity;
            }

            const force = (target - pArr[idx]) * ease;
            velocities[idx] = (velocities[idx] + force) * damping;
            pArr[idx] += velocities[idx];
          }
        }
        geometry.attributes.position.needsUpdate = true;

        points.rotation.y += 0.0015; // Slow Idle Rotation
        points.position.y = Math.sin(time * 2.0) * 0.02; // Vertical Bob

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
