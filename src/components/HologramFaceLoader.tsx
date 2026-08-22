"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HologramFaceLoaderProps {
  isActive?: boolean;
  className?: string;
}

/**
 * @fileOverview HologramFaceLoader - A premium Three.js particle effect for the identity sync screen.
 * Particles materialize into a human face with scanlines and atmospheric glow.
 */

export default function HologramFaceLoader({ isActive = true, className }: HologramFaceLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !isActive) return;

    // 1. Scene & Camera Initialization
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Particle Geometry Setup
    const PARTICLE_COUNT = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // Initial random orbital state
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Default blue color values
      colors[i * 3] = 0.13;     // R
      colors[i * 3 + 1] = 0.83; // G
      colors[i * 3 + 2] = 0.93; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 3. Custom Hologram Shader
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
        varying vec3 vPos;

        void main() {
          vPos = position;
          // Lerp between initial and target
          vec3 currentPos = mix(position, targetPosition, uProgress);
          
          // Subtle hover movement
          currentPos.y += sin(uTime * 0.5 + currentPos.x) * 0.1;
          
          vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
          gl_PointSize = (1.5 + sin(uTime * 2.0 + currentPos.z) * 0.5) * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = uProgress;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying float vAlpha;
        varying vec3 vPos;

        void main() {
          // Scanline effect
          float scanline = mod(vPos.y * 10.0 - uTime * 5.0, 1.0);
          scanline = smoothstep(0.4, 0.5, scanline) - smoothstep(0.5, 0.6, scanline);
          
          vec3 finalColor = mix(uColor, vec3(1.0), scanline * 0.5);
          
          // Soft circle shape
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          gl_FragColor = vec4(finalColor, (1.0 - dist * 2.0) * (0.4 + vAlpha * 0.6));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 4. Projector Beam (Base Ring)
    const ringGeo = new THREE.RingGeometry(1.5, 3.5, 64);
    const ringMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          float dist = distance(vUv, vec2(0.5));
          float opacity = smoothstep(0.5, 0.2, dist) * (0.1 + sin(uTime * 2.0) * 0.05);
          gl_FragColor = vec4(0.13, 0.83, 0.93, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -6;
    scene.add(ring);

    // 5. Model Loading & Surface Sampling
    const loader = new GLTFLoader();
    loader.load('/models/face.glb', 
      (gltf) => {
        let mesh: THREE.Mesh | null = null;
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) mesh = child as THREE.Mesh;
        });

        if (mesh) {
          const sampler = new MeshSurfaceSampler(mesh).build();
          const tempPosition = new THREE.Vector3();
          
          // Normalize scale
          mesh.geometry.computeBoundingBox();
          const box = mesh.geometry.boundingBox!;
          const scale = 8 / (box.max.y - box.min.y);

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            sampler.sample(tempPosition);
            targetPositions[i * 3] = tempPosition.x * scale;
            targetPositions[i * 3 + 1] = tempPosition.y * scale - 4; // Center vertically
            targetPositions[i * 3 + 2] = tempPosition.z * scale;
          }
          geometry.attributes.targetPosition.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.warn("[Hologram] Face model not found at /models/face.glb. Using fallback sphere.");
        // Fallback: simple sphere targets
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
          const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
          targetPositions[i * 3] = 4 * Math.cos(theta) * Math.sin(phi);
          targetPositions[i * 3 + 1] = 4 * Math.sin(theta) * Math.sin(phi);
          targetPositions[i * 3 + 2] = 4 * Math.cos(phi);
        }
        geometry.attributes.targetPosition.needsUpdate = true;
      }
    );

    // 6. Animation Loop
    let time = 0;
    let progress = 0;
    const animate = () => {
      time += 0.016;
      requestRef.current = requestAnimationFrame(animate);

      // Materialize progress
      if (progress < 1.0) progress += 0.005;
      
      material.uniforms.uTime.value = time;
      material.uniforms.uProgress.value = progress;
      ringMat.uniforms.uTime.value = time;

      // Slow Y rotation
      points.rotation.y += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    // 7. Cleanup & Resize
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
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [isActive]);

  return (
    <div className={cn("w-full h-full relative flex flex-col items-center justify-center bg-[#050816]", className)}>
      <div ref={containerRef} className="absolute inset-0 z-10" />
      
      <div className="relative z-20 mt-64 space-y-6 flex flex-col items-center">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <span className="text-xs font-black tracking-[0.5em] text-accent uppercase">
            Synchronizing Identity...
          </span>
        </motion.div>
        
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              animate={{ height: [4, 12, 4], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="w-0.5 bg-accent"
            />
          ))}
        </div>
      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute top-12 left-12 opacity-20 pointer-events-none hidden md:block">
        <div className="flex items-center gap-4 text-[10px] font-mono text-accent">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
          <span>NEURAL_LINK_ESTABLISHED</span>
        </div>
      </div>
    </div>
  );
}
