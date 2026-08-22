
"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from "@/lib/utils";
import { Loader2, VideoOff } from "lucide-react";

interface CandidateHologramProps {
  stream: MediaStream | null;
  isCameraOn: boolean;
  className?: string;
}

/**
 * @fileOverview CandidateHologram - Real-time 3D Particle Hologram.
 * Processes live camera feed into a volumetric particle cloud.
 * Features audio-reactive mouth movement and strictly isolated animation masks.
 */

export default function CandidateHologram({ 
  stream, 
  isCameraOn, 
  className 
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const GRID_SIZE = 250;
  const PARTICLE_COUNT = GRID_SIZE * GRID_SIZE;

  // 1. Setup Audio Analysis for Candidate Speech
  useEffect(() => {
    if (!stream || !isCameraOn) return;

    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (e) {
      console.warn("[Candidate Hologram] Audio analysis initialization failed:", e);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isCameraOn]);

  // 2. Main Three.js Engine
  useEffect(() => {
    if (!containerRef.current || !stream) return;

    // Video Setup
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 3;
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

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    // Geometry Construction
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const uvs = new Float32Array(PARTICLE_COUNT * 2);
    const masks = new Float32Array(PARTICLE_COUNT * 2); // x=mouth, y=eye

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (i % GRID_SIZE);
      const y = Math.floor(i / GRID_SIZE);
      
      // Standard normalized grid
      positions[i * 3] = (x / GRID_SIZE - 0.5) * 2.0;
      positions[i * 3 + 1] = (0.5 - y / GRID_SIZE) * 2.0;
      positions[i * 3 + 2] = 0;

      const u = x / GRID_SIZE;
      const v = 1.0 - y / GRID_SIZE;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;

      // Define Region Masks (Centered assume for front-facing camera)
      // Mouth: Center-bottom
      if (u > 0.42 && u < 0.58 && v > 0.28 && v < 0.42) {
        masks[i * 2] = 1.0;
      }
      // Eyes
      if ((u > 0.32 && u < 0.45 && v > 0.55 && v < 0.65) || (u > 0.55 && u < 0.68 && v > 0.55 && v < 0.65)) {
        masks[i * 2 + 1] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('aMask', new THREE.BufferAttribute(masks, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uVideo: { value: videoTexture },
        uTime: { value: 0 },
        uVocalAmplitude: { value: 0 },
        uColor: { value: new THREE.Color(0x00f2ff) },
        uIsActive: { value: 1.0 }
      },
      vertexShader: `
        uniform sampler2D uVideo;
        uniform float uTime;
        uniform float uVocalAmplitude;
        attribute vec2 aMask;
        varying float vBrightness;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec4 videoColor = texture2D(uVideo, uv);
          float brightness = (videoColor.r + videoColor.g + videoColor.b) / 3.0;
          
          vec3 pos = position;

          // 3D Reconstruct: Map luminosity to depth
          // We mirror X because it's a selfie feed usually
          pos.x *= -1.0; 
          
          // Realistic Volumetric Depth
          float radialFalloff = 1.0 - distance(uv, vec2(0.5, 0.5)) * 1.5;
          pos.z = brightness * 0.5 * clamp(radialFalloff, 0.0, 1.0);

          // MOUTH ANIMATION: Strictly isolated to mouth mask
          if (aMask.x > 0.5) {
            float mouthV = 0.35;
            float dist = abs(uv.y - mouthV);
            pos.y += uVocalAmplitude * 0.08 * (uv.y > mouthV ? 1.0 : -1.0) * (1.0 - dist * 8.0);
          }

          // BLINKING: Eye mask
          if (aMask.y > 0.5) {
            float blink = step(0.98, sin(uTime * 3.0));
            pos.y *= (1.0 - blink * 0.1);
          }

          // GLOBAL IDLE FLOATING (Very subtle)
          pos.y += sin(uTime * 0.5) * 0.01;
          pos.x += cos(uTime * 0.3) * 0.005;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (2.2 + sin(uTime + pos.x * 10.0) * 0.5) * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vBrightness = brightness;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying float vBrightness;
        varying vec2 vUv;

        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;

          // Holographic Core
          float glow = 0.1 / dist;
          vec3 color = uColor * vBrightness * glow;

          // Scanlines
          float scanline = mod(gl_FragCoord.y + uTime * 20.0, 6.0) < 2.0 ? 0.8 : 1.0;
          color *= scanline;

          // Edge Glow
          float edge = smoothstep(0.0, 0.5, vBrightness);
          
          gl_FragColor = vec4(color, edge * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    pointsRef.current = points;
    scene.add(points);

    // Decorative Ground Projection
    const circleGeom = new THREE.RingGeometry(0.8, 0.82, 64);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(circleGeom, circleMat);
    circle.rotation.x = Math.PI / 2;
    circle.position.y = -1.2;
    scene.add(circle);

    // Floating Noise Particles
    const noiseGeom = new THREE.BufferGeometry();
    const noiseCount = 400;
    const noisePos = new Float32Array(noiseCount * 3);
    for(let i=0; i<noiseCount; i++) {
      noisePos[i*3] = (Math.random() - 0.5) * 4.0;
      noisePos[i*3+1] = (Math.random() - 0.5) * 4.0;
      noisePos[i*3+2] = (Math.random() - 0.5) * 2.0;
    }
    noiseGeom.setAttribute('position', new THREE.BufferAttribute(noisePos, 3));
    const noiseMat = new THREE.PointsMaterial({ color: 0x00f2ff, size: 0.01, transparent: true, opacity: 0.1 });
    const noisePoints = new THREE.Points(noiseGeom, noiseMat);
    scene.add(noisePoints);

    // Animation Loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      requestAnimationFrame(animate);

      const time = clockRef.current.getElapsedTime();
      
      // Update Amplitude for Mouth
      let amplitude = 0;
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        amplitude = sum / dataArray.length / 255;
      }

      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = time;
        mat.uniforms.uVocalAmplitude.value = THREE.MathUtils.lerp(mat.uniforms.uVocalAmplitude.value, amplitude * 5.0, 0.2);
        
        // Very subtle rotation
        pointsRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
      }

      noisePoints.position.y = Math.sin(time * 0.2) * 0.1;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    setIsInitializing(false);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [stream]);

  if (!isCameraOn) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#050816] z-30">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <VideoOff className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Visual Feed Deactivated</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("w-full h-full relative bg-[#010206] cursor-default", className)}>
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 glass backdrop-blur-xl flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Initialising Neural Matrix...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
      </div>
    </div>
  );
}
