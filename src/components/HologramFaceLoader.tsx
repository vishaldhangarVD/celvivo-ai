"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

console.log("HologramFaceLoader.tsx: Module evaluated");

interface HologramFaceLoaderProps {
  isActive?: boolean;
  className?: string;
}

export default function HologramFaceLoader({ isActive = true, className }: HologramFaceLoaderProps) {
  console.log("HologramFaceLoader: Component Function Rendering. isActive:", isActive);

  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    console.log("HologramFaceLoader: useEffect Triggered");
    
    if (!containerRef.current) {
      console.error("HologramFaceLoader: containerRef is NULL");
      return;
    }

    if (!isActive) {
      console.log("HologramFaceLoader: Component inactive, skipping Three.js init");
      return;
    }

    // DIAGNOSTIC STEP 2: Prove dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    console.log("HologramFaceLoader: Container dimensions:", width, "x", height);

    if (width === 0 || height === 0) {
      console.warn("HologramFaceLoader: Container has 0px dimensions! Check parent CSS.");
    }

    const scene = new THREE.Scene();
    
    // DIAGNOSTIC STEP 3: Force bright background
    scene.background = new THREE.Color(0xff00ff); 
    console.log("HologramFaceLoader: Scene background set to MAGENTA for diagnostic");

    const camera = new THREE.PerspectiveCamera(45, width / height || 1, 0.1, 100);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, // Set to false to ensure background color shows
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width || 500, height || 500);
    
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log("HologramFaceLoader: Renderer appended to DOM");

    const PARTICLE_COUNT = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
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
        varying vec3 vPos;
        void main() {
          vPos = position;
          vec3 currentPos = mix(position, targetPosition, uProgress);
          currentPos.y += sin(uTime * 0.5 + currentPos.x) * 0.1;
          vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
          gl_PointSize = (2.0 + sin(uTime * 2.0 + currentPos.z) * 0.5) * (300.0 / -mvPosition.z);
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
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          gl_FragColor = vec4(uColor, (1.0 - dist * 2.0) * (0.4 + vAlpha * 0.6));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const loader = new GLTFLoader();
    const applyFallbackTarget = () => {
      console.warn("HologramFaceLoader: Using procedural fallback sphere targets.");
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
        const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
        targetPositions[i * 3] = 4 * Math.cos(theta) * Math.sin(phi);
        targetPositions[i * 3 + 1] = 4 * Math.sin(theta) * Math.sin(phi);
        targetPositions[i * 3 + 2] = 4 * Math.cos(phi);
      }
      geometry.attributes.targetPosition.needsUpdate = true;
    };

    loader.load('/models/face.glb', 
      (gltf) => {
        console.log("HologramFaceLoader: GLB Loaded Successfully");
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
            targetPositions[i * 3 + 1] = tempPosition.y * scale - 4;
            targetPositions[i * 3 + 2] = tempPosition.z * scale;
          }
          geometry.attributes.targetPosition.needsUpdate = true;
        } else {
          console.error("HologramFaceLoader: No mesh found in GLB");
          applyFallbackTarget();
        }
      },
      undefined,
      (err) => {
        console.error("HologramFaceLoader: GLB Load ERROR:", err);
        applyFallbackTarget();
      }
    );

    let time = 0;
    let progress = 0;
    const animate = () => {
      time += 0.016;
      requestRef.current = requestAnimationFrame(animate);
      if (progress < 1.0) progress += 0.005;
      material.uniforms.uTime.value = time;
      material.uniforms.uProgress.value = progress;
      points.rotation.y += 0.002;
      if (rendererRef.current) {
        rendererRef.current.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      console.log("HologramFaceLoader: Resizing to", w, "x", h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log("HologramFaceLoader: Cleaning up effect");
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
    };
  }, [isActive]);

  return (
    <div className={cn("w-full h-full relative flex flex-col items-center justify-center bg-[#050816]", className)}>
      {/* DIAGNOSTIC STEP 1: Prove mounting */}
      <div style={{ 
        border: '10px solid red', 
        color: 'red', 
        backgroundColor: 'rgba(255,255,255,0.9)',
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        padding: '20px',
        zIndex: 9999,
        fontWeight: 'bold',
        fontSize: '20px'
      }}>
        HOLOGRAM COMPONENT MOUNTED
      </div>

      <div ref={containerRef} className="absolute inset-0 z-10 w-full h-full" />
      
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
      </div>
    </div>
  );
}
