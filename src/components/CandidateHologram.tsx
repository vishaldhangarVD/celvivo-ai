'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { cn } from '@/lib/utils';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

const FORMATION_DURATION = 2200; // ms

const vertexShader = `
  uniform float uTime;
  uniform float uFormation;
  uniform float uSpeaking;
  attribute vec3 aTargetPosition;
  attribute float aSize;
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    // Morph from random scattered sphere to target face
    vec3 pos = mix(position, aTargetPosition, uFormation);
    
    // Subtle breathing/floating movement
    pos.y += sin(uTime * 0.4 + aTargetPosition.x * 5.0) * 0.015;
    pos.x += cos(uTime * 0.3 + aTargetPosition.z * 5.0) * 0.005;
    
    // Neural shimmer jitter
    pos += (fract(sin(aTargetPosition * 100.0 + uTime) * 43758.5453) - 0.5) * 0.002;
    
    // Speaking effect: Subtly displace mouth/jaw area based on Y and Z coords
    // Target mouth is roughly at y: -0.1 to -0.25 in normalized space
    if (uSpeaking > 0.1 && aTargetPosition.y < -0.05 && aTargetPosition.y > -0.3 && aTargetPosition.z > 0.05) {
        float mouthWave = sin(uTime * 18.0) * uSpeaking * 0.008;
        pos.y += mouthWave * 0.5;
        pos.z += mouthWave;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (350.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vOpacity = uFormation * (0.6 + sin(uTime * 2.0 + aTargetPosition.y * 10.0) * 0.1);
    vColor = vec3(0.13, 0.83, 0.93); // Cyan
  }
`;

const fragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    
    float strength = 1.0 - (d * 2.0);
    gl_FragColor = vec4(vColor, vOpacity * strength);
  }
`;

const CandidateHologram = memo(({
  active = true,
  speaking = false,
  className = '',
  isLoader = false
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Three.js Refs for Cleanup
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Speaking state ref for shader updates
  const speakingIntensityRef = useRef(0);

  useEffect(() => {
    speakingIntensityRef.current = speaking ? 1.0 : 0;
  }, [speaking]);

  useEffect(() => {
    if (!active || !containerRef.current || !canvasRef.current) return;

    let mounted = true;
    
    // 1. Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    // Determine particle count based on hardware
    const getParticleCount = () => {
      const gl = renderer.getContext();
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 50000;
      const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
      if (gpu.includes('nvidia') || gpu.includes('amd') || gpu.includes('apple')) return 80000;
      return 45000;
    };
    const count = getParticleCount();

    // 2. Loading & Extraction
    const manager = new THREE.LoadingManager();
    manager.onError = (url) => console.warn('[Hologram] Texture error (ignored):', url);
    
    const loader = new GLTFLoader(manager);
    loader.load(
      '/models/woman_head.glb',
      (gltf) => {
        if (!mounted) return;

        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
            const name = child.name.toLowerCase();
            // Filter interior geometry
            if (name.includes('eye') || name.includes('teeth') || name.includes('tongue') || name.includes('inner')) return;
            
            child.updateMatrixWorld();
            meshes.push(child as THREE.Mesh);
          }
        });

        if (meshes.length === 0) {
          setError('No valid geometry found in model.');
          setLoading(false);
          return;
        }

        // Sampling
        const targetPositions = new Float32Array(count * 3);
        const startPositions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        let sampledTotal = 0;
        meshes.forEach((mesh, idx) => {
          const sampler = new MeshSurfaceSampler(mesh).build();
          const meshQuota = idx === meshes.length - 1 ? count - sampledTotal : Math.floor(count / meshes.length);
          
          const tempPos = new THREE.Vector3();
          const tempNormal = new THREE.Vector3();

          for (let i = 0; i < meshQuota; i++) {
            sampler.sample(tempPos, tempNormal);
            tempPos.applyMatrix4(mesh.matrixWorld);
            
            const pIdx = (sampledTotal + i) * 3;
            targetPositions[pIdx] = tempPos.x;
            targetPositions[pIdx + 1] = tempPos.y;
            targetPositions[pIdx + 2] = tempPos.z;

            // Initial scatter
            const r = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            startPositions[pIdx] = r * Math.sin(phi) * Math.cos(theta);
            startPositions[pIdx + 1] = r * Math.sin(phi) * Math.sin(theta);
            startPositions[pIdx + 2] = r * Math.cos(phi);

            sizes[sampledTotal + i] = 0.005 + Math.random() * 0.015;
          }
          sampledTotal += meshQuota;
        });

        // Normalize and Center
        const box = new THREE.Box3();
        for(let i=0; i<count; i++) box.expandByPoint(new THREE.Vector3(targetPositions[i*3], targetPositions[i*3+1], targetPositions[i*3+2]));
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2.0 / Math.max(size.x, size.y, size.z);

        for (let i = 0; i < count; i++) {
          const ix = i * 3;
          targetPositions[ix] = (targetPositions[ix] - center.x) * scale;
          targetPositions[iy] = (targetPositions[iy] - center.y) * scale; // Wait pIdx fix
        }
        // Correcting loop index logic
        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            targetPositions[ix] = (targetPositions[ix] - center.x) * scale;
            targetPositions[ix + 1] = (targetPositions[ix + 1] - center.y) * scale;
            targetPositions[ix + 2] = (targetPositions[ix + 2] - center.z) * scale;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(startPositions, 3));
        geometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uFormation: { value: 0 },
            uSpeaking: { value: 0 }
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        materialRef.current = material;

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        // Cleanup temporary GLB resources
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            (node as THREE.Mesh).geometry.dispose();
            const mat = (node as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat.dispose();
          }
        });

        setLoading(false);
        setInternalLoading(false);
      },
      undefined,
      (err) => {
        console.error('[Hologram] Load failed:', err);
        setError('Hologram interface failed to initialize.');
        setLoading(false);
      }
    );

    // 3. Animation Loop
    const startTime = Date.now();
    const animate = () => {
      if (!mounted) return;
      const elapsed = Date.now() - startTime;
      
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsed / 1000;
        materialRef.current.uniforms.uFormation.value = Math.min(elapsed / FORMATION_DURATION, 1.0);
        
        // Smoothly transition speaking intensity
        materialRef.current.uniforms.uSpeaking.value = THREE.MathUtils.lerp(
          materialRef.current.uniforms.uSpeaking.value,
          speakingIntensityRef.current,
          0.1
        );
      }

      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 4. Resize Handler
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
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [active]);

  const [internalLoading, setInternalLoading] = useState(true);

  return (
    <div ref={containerRef} className={cn(
      "relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-opacity duration-1000",
      loading ? "opacity-50" : "opacity-100",
      className
    )}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {(internalLoading || isLoader) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/80 backdrop-blur-md z-50">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin" />
            <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">
            Neural Handshake...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/95 p-12 text-center z-50">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
            <span className="text-2xl font-black">!</span>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Visual Node Failure</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {/* Holographic Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent_70%)] z-10" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';

export default CandidateHologram;