
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
  audioElement?: HTMLAudioElement | null;
}

/**
 * @fileOverview CandidateHologram - Audio-Reactive Holographic Reconstruction Engine v6.0.
 * Features: Depth-reconstruction, Neural Spring Physics, Bloom, Scan-lines, 
 * and Audio-Reactive Vocal Jitter.
 */

export default function CandidateHologram({ 
  active = true, 
  speaking = false, 
  className,
  isLoader = false,
  audioElement = null
}: CandidateHologramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Audio Analysis Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let isMounted = true;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001a2e); 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 2.8);
    camera.lookAt(0, 0, 0);

    // 2. Renderer & Post-Processing
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
      0.55, // Strength
      0.4,  // Radius
      0.12  // Threshold
    );
    bloomPassRef.current = bloomPass;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 3. Particle System Data
    const PARTICLE_COUNT = 8000;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const masks = new Float32Array(PARTICLE_COUNT); // 1.0 = mouth region

    // Initial random spawn in a loose sphere
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Default procedural face fallback (Faceted Ellipsoid)
      const pPhi = Math.acos(2.0 * Math.random() - 1.0);
      const pTheta = 2.0 * Math.PI * Math.random();
      let rx = 0.55 * Math.sin(pPhi) * Math.cos(pTheta);
      let ry = 0.75 * Math.sin(pPhi) * Math.sin(pTheta);
      let rz = 0.45 * Math.cos(pPhi);

      // Indent eye sockets (y ~ 0.25, x ~ +/- 0.2)
      const dEyeL = Math.sqrt(Math.pow(rx - 0.2, 2) + Math.pow(ry - 0.25, 2));
      const dEyeR = Math.sqrt(Math.pow(rx + 0.2, 2) + Math.pow(ry - 0.25, 2));
      if (dEyeL < 0.12 || dEyeR < 0.12) rz -= 0.08;

      // Indent mouth (y ~ -0.35, x ~ 0)
      const dMouth = Math.sqrt(Math.pow(rx, 2) * 2.0 + Math.pow(ry + 0.35, 2));
      if (dMouth < 0.15) {
        rz -= 0.06;
        masks[i] = 1.0; // Tag as mouth
      }

      targetPositions[i * 3] = rx;
      targetPositions[i * 3 + 1] = ry;
      targetPositions[i * 3 + 2] = rz;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aMask', new THREE.BufferAttribute(masks, 1));

    // Custom Shader for Scanline, Coloring, and Vocal Jitter
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScanY: { value: 0 },
        uMouthOpen: { value: 0 },
        uColor1: { value: new THREE.Color(0x00eaff) },
        uColor2: { value: new THREE.Color(0x4facfe) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScanY;
        uniform float uMouthOpen;
        attribute float aMask;
        varying float vScan;
        varying vec3 vColor;
        
        void main() {
          vec3 pos = position;
          
          // VOCAL JITTER: Move mouth particles vertically based on volume
          if (aMask > 0.5) {
            float jitter = sin(uTime * 50.0 + pos.x * 100.0) * 0.02 * uMouthOpen;
            pos.y += jitter;
          }
          
          // Scanline intensity based on height
          float distToScan = abs(pos.y - uScanY);
          vScan = smoothstep(0.12, 0.0, distToScan);
          
          // Gradient based on Y
          vColor = mix(vec3(0.0, 0.9, 1.0), vec3(0.3, 0.6, 1.0), (pos.y + 0.8) / 1.6);
          vColor += vScan * 0.4;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 0.025 * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vScan;
        varying vec3 vColor;
        
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.1, d) * 0.85;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, particleMaterial);
    scene.add(points);

    // 4. Base Projector Ring
    const ringGeo = new THREE.RingGeometry(0.4, 0.45, 64);
    const ringMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          float d = distance(vUv, vec2(0.5));
          float ring = sin(d * 50.0 - uTime * 4.0) * 0.5 + 0.5;
          gl_FragColor = vec4(0.0, 0.9, 1.0, ring * 0.2);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.9;
    scene.add(ring);

    // 5. Ambient Atmospheric Particles
    const ambCount = 30;
    const ambGeo = new THREE.BufferGeometry();
    const ambPos = new Float32Array(ambCount * 3);
    for(let i=0; i<ambCount; i++) {
      ambPos[i*3] = (Math.random() - 0.5) * 3;
      ambPos[i*3+1] = (Math.random() - 0.5) * 3;
      ambPos[i*3+2] = (Math.random() - 0.5) * 2;
    }
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
    const ambMat = new THREE.PointsMaterial({ color: 0x00eaff, size: 0.01, transparent: true, opacity: 0.15 });
    const ambPoints = new THREE.Points(ambGeo, ambMat);
    scene.add(ambPoints);

    // 6. Model Loading Logic
    const loader = new GLTFLoader();
    loader.load('/models/face-female.glb', (gltf) => {
      if (!isMounted) return;
      
      const targetPool: THREE.Vector3[] = [];
      const isMouth: boolean[] = [];

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const posAttr = mesh.geometry.attributes.position;
          const name = child.name.toLowerCase();
          
          let density = 1.0;
          if (name.includes('hair')) density = 0.25;
          if (name.includes('body') || name.includes('cloth') || child.position.y < -0.5) density = 0;

          if (density > 0) {
            for (let i = 0; i < posAttr.count; i++) {
              if (Math.random() > density) continue;
              const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
              v.applyMatrix4(mesh.matrixWorld);
              targetPool.push(v);
            }
          }
        }
      });

      if (targetPool.length > 0) {
        const box = new THREE.Box3().setFromPoints(targetPool);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 1.6 / size.y;

        // Face Orientation Detection
        let forwardPoints = 0;
        targetPool.forEach(v => { if (v.z - center.z > 0) forwardPoints++; });
        const rotationY = forwardPoints < targetPool.length / 2 ? Math.PI : 0;

        const maskAttr = geometry.attributes.aMask;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const v = targetPool[i % targetPool.length].clone();
          v.sub(center).multiplyScalar(scale);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
          
          targetPositions[i * 3] = v.x;
          targetPositions[i * 3 + 1] = v.y;
          targetPositions[i * 3 + 2] = v.z;

          // Mouth detection logic (Y range approx)
          maskAttr.array[i] = (v.y > -0.5 && v.y < -0.2 && Math.abs(v.x) < 0.2) ? 1.0 : 0.0;
        }
        maskAttr.needsUpdate = true;
      }
      setIsLoading(false);
    }, undefined, () => {
      setIsLoading(false);
    });

    // 7. Physics Animation Loop
    let time = 0;
    const ease = 0.045;
    const damping = 0.90;

    const animate = () => {
      if (!isMounted) return;
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Handle Audio Reactivity
      let volume = 0;
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for(let i=0; i<dataArrayRef.current.length; i++) sum += dataArrayRef.current[i];
        volume = (sum / dataArrayRef.current.length) / 255;
      } else if (speaking) {
        // Simulate volume peaks if we only have boolean
        volume = (Math.sin(time * 15.0) * 0.5 + 0.5) * (Math.random() * 0.5 + 0.5);
      }

      // Uniform Updates
      particleMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uScanY.value = Math.sin(time * 1.5) * 1.2;
      particleMaterial.uniforms.uMouthOpen.value = THREE.MathUtils.lerp(
        particleMaterial.uniforms.uMouthOpen.value, 
        volume, 
        0.3
      );
      ringMat.uniforms.uTime.value = time;

      // React bloom to volume
      if (bloomPassRef.current) {
        bloomPassRef.current.strength = 0.55 + volume * 0.4;
      }

      // Spring Physics Loop
      const posAttr = geometry.attributes.position;
      const pArr = posAttr.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        for (let j = 0; j < 3; j++) {
          const idx = i3 + j;
          const force = (targetPositions[idx] - pArr[idx]) * ease;
          velocities[idx] = (velocities[idx] + force) * damping;
          pArr[idx] += velocities[idx];
        }
      }
      posAttr.needsUpdate = true;

      // Ambient Movement
      const ambArr = ambPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < ambCount; i++) {
        ambArr[i * 3 + 1] += 0.002;
        if (ambArr[i * 3 + 1] > 1.5) ambArr[i * 3 + 1] = -1.5;
      }
      ambPoints.geometry.attributes.position.needsUpdate = true;

      points.rotation.y += 0.0015;
      points.position.y = Math.sin(time * 2.0) * 0.02;

      composer.render();
    };

    animate();

    // 8. Lifecycle Management
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
      
      geometry.dispose();
      particleMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ambGeo.dispose();
      ambMat.dispose();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Audio Context Initialization
  useEffect(() => {
    if (!audioElement || !active) return;

    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        try {
          sourceRef.current = audioCtxRef.current.createMediaElementSource(audioElement);
          sourceRef.current.connect(analyser);
          analyser.connect(audioCtxRef.current.destination);
        } catch (e) {
          console.warn("[Hologram] Audio source already connected or origin blocked.");
        }
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    // Initialize on prop change or interaction
    initAudio();
    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, [audioElement, active]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative overflow-hidden bg-[#001a2e] ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Cinematic Overlays */}
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

        {/* Audio Active Indicator */}
        {speaking && (
           <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 glass rounded-lg border-accent/20">
             <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
             <span className="text-[8px] font-black text-accent uppercase tracking-widest">Neural Voice Link</span>
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
