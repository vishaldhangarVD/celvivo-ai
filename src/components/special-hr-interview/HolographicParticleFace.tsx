
"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface HolographicParticleFaceProps {
  photoUrl: string;
  isSpeaking: boolean;
  className?: string;
}

/**
 * @fileOverview HolographicParticleFace - A production-quality 3D particle face system.
 * Uses depth-from-brightness reconstruction and custom GLSL shaders for isolated mouth movement.
 */

export default function HolographicParticleFace({ 
  photoUrl, 
  isSpeaking, 
  className 
}: HolographicParticleFaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef(new THREE.Clock());

  const PARTICLE_COUNT = 62500; // 250x250 grid
  const GRID_SIZE = 250;

  useEffect(() => {
    if (!containerRef.current || !photoUrl) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Load Photo and Generate Texture
    const loader = new THREE.TextureLoader();
    loader.load(photoUrl, (texture) => {
      const img = texture.image;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = GRID_SIZE;
      canvas.height = GRID_SIZE;
      ctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
      const pixelData = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

      // 3. Geometry Construction
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const uvs = new Float32Array(PARTICLE_COUNT * 2);
      const masks = new Float32Array(PARTICLE_COUNT * 2); // x=mouth, y=eye

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = (i % GRID_SIZE);
        const y = Math.floor(i / GRID_SIZE);
        
        // Center the face
        positions[i * 3] = (x / GRID_SIZE - 0.5) * 1.5;
        positions[i * 3 + 1] = (0.5 - y / GRID_SIZE) * 1.8; // Flip Y

        // Extract depth from brightness
        const r = pixelData[i * 4];
        const g = pixelData[i * 4 + 1];
        const b = pixelData[i * 4 + 2];
        const brightness = (r + g + b) / (3 * 255);
        
        // Create 3D Volumetric Depth
        // We add a radial falloff to make it more head-shaped
        const normalizedX = (x / GRID_SIZE - 0.5) * 2.0;
        const normalizedY = (y / GRID_SIZE - 0.5) * 2.0;
        const radialFalloff = Math.max(0, 1.0 - (normalizedX * normalizedX + normalizedY * normalizedY));
        positions[i * 3 + 2] = brightness * 0.4 * radialFalloff;

        uvs[i * 2] = x / GRID_SIZE;
        uvs[i * 2 + 1] = 1.0 - y / GRID_SIZE;

        // Define Mouth and Eye Masks (approximate regions based on typical portrait framing)
        // x = 0.4 to 0.6, y = 0.2 to 0.4
        const u = x / GRID_SIZE;
        const v = 1.0 - y / GRID_SIZE;

        // Mouth region mask
        if (u > 0.4 && u < 0.6 && v > 0.25 && v < 0.42) {
          masks[i * 2] = 1.0;
        } else {
          masks[i * 2] = 0.0;
        }

        // Eye region mask
        if ((u > 0.3 && u < 0.45 && v > 0.55 && v < 0.65) || (u > 0.55 && u < 0.7 && v > 0.55 && v < 0.65)) {
          masks[i * 2 + 1] = 1.0;
        } else {
          masks[i * 2 + 1] = 0.0;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setAttribute('aMask', new THREE.BufferAttribute(masks, 2));

      // 4. Custom Shader
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uTime: { value: 0 },
          uMouthOpen: { value: 0 },
          uColor: { value: new THREE.Color(0x00f2ff) }
        },
        vertexShader: `
          uniform float uTime;
          uniform float uMouthOpen;
          attribute vec2 aMask;
          varying float vBrightness;
          varying vec2 vUv;
          varying float vMask;

          void main() {
            vUv = uv;
            vMask = aMask.x;
            vec3 pos = position;

            // MOUTH ANIMATION - Vertical movement only in mouth zone
            if (aMask.x > 0.5) {
              // Expand mouth vertically relative to its center (approx v=0.33)
              float mouthV = 0.33;
              float dist = abs(uv.y - mouthV);
              pos.y += uMouthOpen * 0.06 * (uv.y > mouthV ? 1.0 : -1.0) * (1.0 - dist * 10.0);
            }

            // BLINKING ANIMATION
            if (aMask.y > 0.5) {
              float blink = step(0.98, sin(uTime * 2.5));
              pos.y *= (1.0 - blink * 0.1);
            }

            // Subtle head breathe
            pos.z += sin(uTime * 0.5 + pos.x * 2.0) * 0.01;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (2.2 + sin(uTime + pos.x * 5.0) * 0.5) * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            vBrightness = pos.z;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec3 uColor;
          uniform float uTime;
          varying float vBrightness;
          varying vec2 vUv;
          varying float vMask;

          void main() {
            vec4 texColor = texture2D(uTexture, vUv);
            float gray = (texColor.r + texColor.g + texColor.b) / 3.0;
            
            // Point shape
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;

            // Holographic glow logic
            float glow = 0.1 / dist;
            vec3 finalColor = uColor * gray * glow;
            
            // Add subtle scanlines
            float scanline = mod(gl_FragCoord.y, 4.0) < 2.0 ? 0.8 : 1.0;
            finalColor *= scanline;

            // Intensity based on depth
            float alpha = smoothstep(0.0, 0.5, gray) * (1.0 - dist * 2.0);
            
            gl_FragColor = vec4(finalColor, alpha * 0.8);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, material);
      pointsRef.current = points;
      scene.add(points);

      // Add atmospheric background particles
      const bgGeometry = new THREE.BufferGeometry();
      const bgCount = 500;
      const bgPositions = new Float32Array(bgCount * 3);
      for(let i=0; i<bgCount; i++) {
        bgPositions[i*3] = (Math.random() - 0.5) * 5.0;
        bgPositions[i*3+1] = (Math.random() - 0.5) * 5.0;
        bgPositions[i*3+2] = (Math.random() - 0.5) * 2.0;
      }
      bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
      const bgMaterial = new THREE.PointsMaterial({ color: 0x00f2ff, size: 0.01, transparent: true, opacity: 0.2 });
      const bgPoints = new THREE.Points(bgGeometry, bgMaterial);
      scene.add(bgPoints);
    });

    // 5. Animation Loop
    const animate = () => {
      if (!renderer || !scene || !camera) return;
      requestAnimationFrame(animate);

      const time = clockRef.current.getElapsedTime();
      
      if (pointsRef.current) {
        const material = pointsRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = time;
        
        // Animate mouth based on speaking state
        const targetMouth = isSpeaking ? Math.abs(Math.sin(time * 12.0)) : 0;
        material.uniforms.uMouthOpen.value = THREE.MathUtils.lerp(
          material.uniforms.uMouthOpen.value,
          targetMouth,
          0.2
        );

        // Very subtle idle floating
        pointsRef.current.position.y = Math.sin(time * 0.5) * 0.02;
        pointsRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 6. Cleanup
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [photoUrl, isSpeaking]);

  return (
    <div ref={containerRef} className={cn("w-full h-full relative", className)}>
      {/* HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-accent/20 rounded-[inherit] z-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
      </div>
    </div>
  );
}
