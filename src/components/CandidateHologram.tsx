'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview CandidateHologram - Stable Particle Face implementation.
 * RESTORED VERSION: Uses /models/face.glb with surface sampling.
 */

interface CandidateHologramProps {
  className?: string;
  active?: boolean;
  speaking?: boolean;
  isLoader?: boolean;
}

const CandidateHologram = memo(({ 
  className,
  active = true,
  speaking = false,
  isLoader = false
}: CandidateHologramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;

    const init = async () => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.z = 6;
      cameraRef.current = camera;

      // 2. Renderer
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        rendererRef.current = renderer;
      } catch (e) {
        console.error('[Hologram] WebGL context failed');
        return;
      }

      // 3. Load & Sample
      const loader = new GLTFLoader();
      
      loader.load(
        '/models/face.glb',
        (gltf) => {
          if (!isMounted) return;

          let faceMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              faceMesh = child as THREE.Mesh;
            }
          });

          if (!faceMesh) {
            setLoading(false);
            return;
          }

          faceMesh.geometry.center();
          
          const sampler = new MeshSurfaceSampler(faceMesh).build();
          const count = 20000;
          const positions = new Float32Array(count * 3);
          const tempPosition = new THREE.Vector3();

          for (let i = 0; i < count; i++) {
            sampler.sample(tempPosition);
            positions[i * 3] = tempPosition.x;
            positions[i * 3 + 1] = tempPosition.y;
            positions[i * 3 + 2] = tempPosition.z;
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

          const material = new THREE.PointsMaterial({
            color: 0x22d3ee, // Nexvoro Cyan
            size: 0.012,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });

          const points = new THREE.Points(geometry, material);
          
          // Fit check
          const box = new THREE.Box3().setFromObject(points);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 4.5 / maxDim;
          points.scale.set(scale, scale, scale);
          
          scene.add(points);
          pointsRef.current = points;
          
          setLoading(false);
          animate();
        },
        undefined,
        (err) => {
          console.error('[Hologram] Face GLB load error', err);
          setLoading(false);
        }
      );
    };

    const animate = () => {
      const loop = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        const time = performance.now() * 0.001;

        if (pointsRef.current) {
          // Stable rotation/sway
          pointsRef.current.rotation.y = Math.sin(time * 0.5) * 0.12;
          pointsRef.current.position.y = Math.sin(time * 0.8) * 0.06;
          
          // Speaking animation pulse
          if (speaking) {
            const s = 1 + Math.sin(time * 20) * 0.01;
            pointsRef.current.scale.set(
              pointsRef.current.scale.x * s,
              pointsRef.current.scale.y * s,
              pointsRef.current.scale.z * s
            );
          }
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameIdRef.current = requestAnimationFrame(loop);
      };
      loop();
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
  }, [active, speaking]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full bg-[#050816]/40 rounded-[2rem] overflow-hidden border border-white/5 ${className || ''}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {(loading || isLoader) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-2xl z-50">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Establishing Neural Link...</p>
        </div>
      )}
    </div>
  );
});

CandidateHologram.displayName = 'CandidateHologram';
export default CandidateHologram;