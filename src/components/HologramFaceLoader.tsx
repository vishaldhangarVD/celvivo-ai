
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { motion } from "framer-motion";

interface HologramFaceLoaderProps {
  isActive?: boolean;
  className?: string;
}

/**
 * @fileOverview HologramFaceLoader - Final Stable Rebuild.
 * Resolves:
 * 1. ReferenceErrors (motion/cn).
 * 2. Unmount crashes (isMounted guard).
 * 3. Double-loop issues (cancelAnimationFrame).
 * 4. Procedural fallback (always renders even if GLB is missing).
 */

export default function HologramFaceLoader({ isActive = true, className }: HologramFaceLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    let isMounted = true;
    const scene = new THREE.Scene();
    
    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    
    try {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      
      // Clear previous instances to prevent duplicates in dev
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const PARTICLE_COUNT = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);

      // 1. Initial Cloud State
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const r = 8 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        
        // Cyan color palette
        colors[i * 3] = 0.13;
        colors[i * 3 + 1] = 0.83;
        colors[i * 3 + 2] = 0.93;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uColor: { value: new THREE.Color(0x22d3ee) }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uProgress;
          attribute vec3 targetPosition;
          varying float vAlpha;
          void main() {
            vec3 currentPos = mix(position, targetPosition, uProgress);
            currentPos.y += sin(uTime * 0.5 + currentPos.x) * 0.1;
            vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
            gl_PointSize = (2.0 + sin(uTime * 2.0 + currentPos.z) * 0.5) * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = uProgress;
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            float glow = 1.0 - dist * 2.0;
            gl_FragColor = vec4(uColor, glow * (0.3 + vAlpha * 0.7));
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // 2. Procedural Fallback (Generates target points in sphere)
      const applyProceduralTargets = () => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
          const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
          targetPositions[i * 3] = 4 * Math.cos(theta) * Math.sin(phi);
          targetPositions[i * 3 + 1] = 4 * Math.sin(theta) * Math.sin(phi);
          targetPositions[i * 3 + 2] = 4 * Math.cos(phi);
        }
        geometry.attributes.targetPosition.needsUpdate = true;
      };

      // 3. Attempt Model Load
      const loader = new GLTFLoader();
      loader.load('/models/face.glb', 
        (gltf) => {
          if (!isMounted) return;
          let mesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) mesh = child as THREE.Mesh;
          });
          
          if (mesh) {
            const sampler = new MeshSurfaceSampler(mesh).build();
            const tempPosition = new THREE.Vector3();
            mesh.geometry.computeBoundingBox();
            const box = mesh.geometry.boundingBox!;
            const scale = 8 / (box.max.y - box.min.y);
            
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              sampler.sample(tempPosition);
              targetPositions[i * 3] = tempPosition.x * scale;
              targetPositions[i * 3 + 1] = (tempPosition.y * scale) - 3;
              targetPositions[i * 3 + 2] = tempPosition.z * scale;
            }
            geometry.attributes.targetPosition.needsUpdate = true;
          } else {
            applyProceduralTargets();
          }
          setIsLoading(false);
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.warn("[Hologram] Using procedural fallback:", err.message);
          applyProceduralTargets();
          setIsLoading(false);
        }
      );

      // 4. Animation Cycle
      let time = 0;
      let progress = 0;
      const animate = () => {
        if (!isMounted) return;
        time += 0.016;
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (progress < 1.0) progress += 0.005;
        
        material.uniforms.uTime.value = time;
        material.uniforms.uProgress.value = progress;
        points.rotation.y += 0.002;
        
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!containerRef.current || !isMounted) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        isMounted = false;
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameRef.current);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    } catch (err) {
      console.error("[Hologram] Render initialization fault:", err);
    }
  }, [isActive]);

  return (
    <div className={`w-full h-full relative bg-[#050816] overflow-hidden ${className ?? ""}`}>
      <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full" />
      
      <div className="absolute inset-x-0 bottom-12 z-20 flex flex-col items-center gap-4">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <span className="text-[10px] font-black tracking-[0.6em] text-accent uppercase">
            Synchronizing Identity...
          </span>
        </motion.div>
        
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1 h-1 bg-accent rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Grid HUD Overlay */}
      <div className="absolute inset-0 z-15 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>
    </div>
  );
}
