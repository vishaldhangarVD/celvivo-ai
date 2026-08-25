'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';

/**
 * @fileOverview CandidateHologram - Futuristic 3D Binary Particle Hologram.
 * 
 * IMPLEMENTATION PROTOCOL:
 * 1. Bypasses GLTFLoader to avoid texture/material "blob" errors.
 * 2. Parses binary POSITION attributes directly from woman_head.glb.
 * 3. Synthesizes a stable, high-fidelity 20,000 node particle matrix.
 * 4. Zero dependencies on framer-motion, AnimatePresence, or external utils.
 */

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
}

const PARTICLE_COUNT = 20000;
const FORMATION_SPEED = 0.05;
const HEX_CYAN = 0x22d3ee;

const CandidateHologram = memo(({ 
  active = true, 
  speaking = false, 
  className 
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Three.js Core Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);
  const speakingRef = useRef(speaking);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  /**
   * BINARY GLB GEOMETRY PARSER
   * Reads raw positional data without triggering texture/material loaders.
   */
  const parseGeometry = async (buffer: ArrayBuffer): Promise<Float32Array | null> => {
    try {
      const view = new DataView(buffer);
      
      // 1. Validate Header (Magic: 'glTF')
      if (view.getUint32(0, true) !== 0x46546C67) throw new Error("Invalid GLB Magic");
      
      // 2. Locate JSON chunk
      const jsonLen = view.getUint32(12, true);
      const jsonStr = new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen));
      const gltf = JSON.parse(jsonStr);

      // 3. Locate BIN chunk
      const binHeaderOffset = 20 + jsonLen;
      const binDataOffset = binHeaderOffset + 8;

      // 4. Find POSITION Accessor
      const mesh = gltf.meshes?.[0];
      const primitive = mesh?.primitives?.[0];
      const posAccessorIdx = primitive?.attributes?.POSITION;
      
      if (posAccessorIdx === undefined) throw new Error("No POSITION data found");
      
      const accessor = gltf.accessors[posAccessorIdx];
      const bufferView = gltf.bufferViews[accessor.bufferView];
      
      const start = binDataOffset + (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
      const count = accessor.count;
      
      return new Float32Array(buffer, start, count * 3);
    } catch (e) {
      console.error("[BinaryParser] Error:", e);
      return null;
    }
  };

  useEffect(() => {
    if (!active) return;

    let isMounted = true;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // 1. SCENE SETUP
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      cameraRef.current = camera;
      camera.position.set(0, 0.15, 3.5);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: false, // Performance optimized
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      rendererRef.current = renderer;

      try {
        // 2. DATA ACQUISITION
        const response = await fetch('/models/woman_head.glb');
        if (!response.ok) throw new Error("Model not found");
        const arrayBuffer = await response.arrayBuffer();
        
        const rawVertices = await parseGeometry(arrayBuffer);
        if (!rawVertices || !isMounted) throw new Error("Parsing failure");

        // 3. NORMALIZATION & CENTERING
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < rawVertices.length; i += 3) {
          minX = Math.min(minX, rawVertices[i]);
          minY = Math.min(minY, rawVertices[i+1]);
          minZ = Math.min(minZ, rawVertices[i+2]);
          maxX = Math.max(maxX, rawVertices[i]);
          maxY = Math.max(maxY, rawVertices[i+1]);
          maxZ = Math.max(maxZ, rawVertices[i+2]);
        }

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;
        const midZ = (minZ + maxZ) / 2;
        const scale = 1.8 / Math.max(maxX - minX, maxY - minY);

        // 4. PARTICLE SYNTHESIS
        const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
        const currentPositions = new Float32Array(PARTICLE_COUNT * 3);
        const vertexCount = rawVertices.length / 3;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ix = i * 3;
          // Sample existing vertices or synthesize between them
          const vIdx = (Math.floor(Math.random() * vertexCount)) * 3;
          
          // Target (Stable Face)
          targetPositions[ix] = (rawVertices[vIdx] - midX) * scale;
          targetPositions[ix+1] = (rawVertices[vIdx+1] - midY) * scale;
          targetPositions[ix+2] = (rawVertices[vIdx+2] - midZ) * scale;

          // Initial (Scattered Cloud)
          currentPositions[ix] = (Math.random() - 0.5) * 5;
          currentPositions[ix+1] = (Math.random() - 0.5) * 5;
          currentPositions[ix+2] = (Math.random() - 0.5) * 5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
        geometry.setAttribute('targetPos', new THREE.BufferAttribute(targetPositions, 3));

        const material = new THREE.PointsMaterial({
          color: HEX_CYAN,
          size: 0.007,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        pointsRef.current = points;

        setLoading(false);
        
        // 5. ANIMATION LOOP
        const animate = () => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !isMounted) return;
          const time = performance.now() * 0.001;

          if (pointsRef.current) {
            const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
            const tar = pointsRef.current.geometry.attributes.targetPos.array as Float32Array;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
              
              // Smooth Convergence
              pos[ix] += (tar[ix] - pos[ix]) * FORMATION_SPEED;
              pos[iy] += (tar[iy] - pos[iy]) * FORMATION_SPEED;
              pos[iz] += (tar[iz] - pos[iz]) * FORMATION_SPEED;

              // Subtle Vibration / Speak Sync
              if (speakingRef.current) {
                // If lower face region (heuristic based on normalized Y)
                if (tar[iy] < -0.1 && Math.abs(tar[ix]) < 0.2) {
                   pos[iy] += Math.sin(time * 25 + i) * 0.002;
                }
              }

              // Atmospheric float
              pos[iy] += Math.sin(time + i * 0.5) * 0.0002;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
            
            // Subtle vertical float for head
            pointsRef.current.position.y = Math.sin(time * 0.8) * 0.01;
            
            // Neural Flicker
            if (Math.random() > 0.99) {
              (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.4;
            } else {
              (pointsRef.current.material as THREE.PointsMaterial).opacity += (0.8 - (pointsRef.current.material as THREE.PointsMaterial).opacity) * 0.1;
            }
          }

          rendererRef.current.render(sceneRef.current, cameraRef.current);
          frameIdRef.current = requestAnimationFrame(animate);
        };
        animate();

      } catch (err: any) {
        if (isMounted) {
          console.error("[Hologram] Critical Failure:", err.message);
          setError("Visual Node Failure");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [active]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-[#02040a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050816]/60 backdrop-blur-xl z-50">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Geometry...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050816]/90 z-50 p-6 text-center">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-2">!</div>
           <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{error}</p>
        </div>
      )}
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;
