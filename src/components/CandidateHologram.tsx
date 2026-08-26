'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * Realistic Cyan Particle Hologram
 * Extracts geometry from GLB and renders as a dense point cloud.
 * Implements GPU-accelerated formation and speaking animations.
 */
const CandidateHologram: React.FC<CandidateHologramProps> = memo(({
  active = true,
  speaking = false,
  className = '',
  isLoader = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation and Three.js Refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const speakingRef = useRef(speaking);

  useEffect(() => {
    speakingRef.current = speaking;
    if (materialRef.current) {
      materialRef.current.uniforms.uSpeaking.value = speaking ? 1.0 : 0.0;
    }
  }, [speaking]);

  useEffect(() => {
    if (!active || !canvasRef.current || !containerRef.current) return;

    let mounted = true;
    const container = containerRef.current;

    // --- 1. SETUP RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    // --- 2. DEFINE SHADERS ---
    const vertexShader = `
      uniform float uTime;
      uniform float uFormation;
      uniform float uSpeaking;
      attribute vec3 aTargetPosition;
      attribute float aSize;
      varying float vOpacity;

      void main() {
        // Morph from random sphere to face
        vec3 pos = mix(position, aTargetPosition, uFormation);
        
        // Subtle breathing & jitter
        pos.y += sin(uTime * 0.5 + aTargetPosition.x * 10.0) * 0.01;
        pos.x += cos(uTime * 0.3 + aTargetPosition.y * 10.0) * 0.005;

        // Speaking movement (mouth region)
        if (uSpeaking > 0.5) {
          // Identify mouth area in normalized space (approx)
          if (aTargetPosition.y < -0.1 && aTargetPosition.y > -0.4 && aTargetPosition.z > 0.3) {
            float mouthMove = sin(uTime * 25.0) * 0.015;
            pos.y += mouthMove;
            pos.z += mouthMove * 0.5;
          }
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        
        vOpacity = 0.5 + sin(uTime * 2.0 + position.y * 5.0) * 0.1;
      }
    `;

    const fragmentShader = `
      varying float vOpacity;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        // Cyan color with varying opacity
        gl_FragColor = vec4(0.13, 0.83, 0.93, vOpacity * (1.0 - d * 2.0));
      }
    `;

    // --- 3. LOAD MODEL & EXTRACT GEOMETRY ---
    const loadingManager = new THREE.LoadingManager();
    // Silently ignore texture errors as we don't need them
    loadingManager.onError = () => {}; 
    
    const loader = new GLTFLoader(loadingManager);
    
    const count = window.innerWidth < 768 ? 45000 : 75000;

    loader.load(
      '/models/woman_head.glb',
      (gltf) => {
        if (!mounted) return;

        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const m = node as THREE.Mesh;
            const name = m.name.toLowerCase();
            // Skip interior geometry that muddies the hologram
            if (name.includes('eye') || name.includes('teeth') || name.includes('inner') || name.includes('tongue')) return;
            
            m.updateMatrixWorld(true);
            meshes.push(m);
          }
        });

        if (meshes.length === 0) {
          setError('No valid geometry found in model');
          setLoading(false);
          return;
        }

        // Merge all geometries into one point-sampling source
        const geometries = meshes.map(m => {
          const g = m.geometry.clone();
          g.applyMatrix4(m.matrixWorld);
          return g;
        });

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
        const mergedMesh = new THREE.Mesh(mergedGeometry);

        // Normalize geometry to fit in our viewport
        mergedGeometry.computeBoundingBox();
        const box = mergedGeometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;
        
        mergedGeometry.translate(-center.x, -center.y, -center.z);
        mergedGeometry.scale(scale, scale, scale);

        // Sample surface
        const sampler = new MeshSurfaceSampler(mergedMesh).build();
        const positions = new Float32Array(count * 3);
        const targetPositions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const tempPos = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
          sampler.sample(tempPos);
          targetPositions.set([tempPos.x, tempPos.y, tempPos.z], i * 3);
          
          // Random start positions for formation animation
          positions.set([
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
          ], i * 3);

          sizes[i] = 0.005 + Math.random() * 0.015;
        }

        // Clean up GLB resources immediately
        mergedGeometry.dispose();
        geometries.forEach(g => g.dispose());
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const m = node as THREE.Mesh;
            m.geometry.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach(mat => mat.dispose());
            } else {
              m.material.dispose();
            }
          }
        });

        // --- 4. CREATE PARTICLE SYSTEM ---
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointsGeometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
        pointsGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

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
          depthWrite: false,
        });
        materialRef.current = material;

        const points = new THREE.Points(pointsGeometry, material);
        scene.add(points);

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('GLB Load Error:', err);
        setError('Critical: Model handshake failed.');
        setLoading(false);
      }
    );

    // --- 5. ANIMATION LOOP ---
    let startTime = Date.now();
    const animate = () => {
      if (!mounted) return;
      const elapsed = (Date.now() - startTime) / 1000;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsed;
        // Formation ease-out
        const formationDuration = 2.5;
        const t = Math.min(elapsed / formationDuration, 1.0);
        // Cubic ease out
        materialRef.current.uniforms.uFormation.value = 1 - Math.pow(1 - t, 3);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- 6. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. CLEANUP ---
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      // Extensive disposal to prevent context loss
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, [active]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#010208] rounded-[2rem] overflow-hidden border border-white/5 ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {(loading || isLoader) && !error && (
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
