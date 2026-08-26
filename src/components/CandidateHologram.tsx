'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

/**
 * High-Fidelity 3D Particle Hologram
 * Extracts raw geometry from woman_head.glb and renders as a dense point cloud.
 * Disposes of original GLB resources immediately to prevent shader/texture errors.
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

  // Use refs for Three.js objects to avoid re-renders and closure issues
  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    animationFrame: null as number | null,
    material: null as THREE.ShaderMaterial | null,
    speaking: speaking,
    startTime: Date.now()
  });

  // Sync speaking state to shader uniform without re-renders
  useEffect(() => {
    stateRef.current.speaking = speaking;
    if (stateRef.current.material) {
      stateRef.current.material.uniforms.uSpeaking.value = speaking ? 1.0 : 0.0;
    }
  }, [speaking]);

  useEffect(() => {
    if (!active || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // --- 1. RENDERER SETUP ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    stateRef.current.renderer = renderer;

    const scene = new THREE.Scene();
    stateRef.current.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 4);
    stateRef.current.camera = camera;

    // --- 2. CUSTOM SHADERS ---
    const vertexShader = `
      uniform float uTime;
      uniform float uFormation;
      uniform float uSpeaking;
      attribute vec3 aTargetPosition;
      attribute float aSize;
      varying float vOpacity;

      void main() {
        // Morph from random sphere to face shape
        vec3 pos = mix(position, aTargetPosition, uFormation);
        
        // Subtle holographic float
        pos.y += sin(uTime * 0.4 + aTargetPosition.x * 5.0) * 0.008;
        
        // Speaking jitter (mouth area detection in normalized space)
        if (uSpeaking > 0.5 && aTargetPosition.y < -0.1 && aTargetPosition.y > -0.4 && aTargetPosition.z > 0.3) {
          pos.y += sin(uTime * 20.0) * 0.015;
          pos.z += cos(uTime * 15.0) * 0.01;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        
        vOpacity = 0.4 + (sin(uTime * 1.5 + position.y * 10.0) * 0.2);
      }
    `;

    const fragmentShader = `
      varying float vOpacity;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        // Cyber Cyan
        gl_FragColor = vec4(0.13, 0.83, 0.93, vOpacity * (1.0 - d * 2.0));
      }
    `;

    // --- 3. MODEL LOADING & GEOMETRY EXTRACTION ---
    const loadingManager = new THREE.LoadingManager();
    // Ignore texture errors as we don't need them
    loadingManager.onError = () => {}; 
    
    const loader = new GLTFLoader(loadingManager);
    const TOTAL_PARTICLES = 75000;

    loader.load(
      '/models/woman_head.glb',
      (gltf) => {
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            const name = mesh.name.toLowerCase();
            // Filter out interior geometry that messes up the scan look
            if (!name.includes('eye') && !name.includes('teeth') && !name.includes('inner')) {
              mesh.updateMatrixWorld(true);
              meshes.push(mesh);
            }
          }
        });

        if (meshes.length === 0) {
          setError('Handshake failed: Geometry not found.');
          setLoading(false);
          return;
        }

        // Merge all geometry into one sampler source
        const geometries = meshes.map(m => {
          const g = m.geometry.clone();
          g.applyMatrix4(m.matrixWorld);
          return g;
        });
        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
        const mergedMesh = new THREE.Mesh(mergedGeometry);

        // Normalize bounds
        mergedGeometry.computeBoundingBox();
        const box = mergedGeometry.boundingBox!;
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 2.2 / Math.max(size.x, size.y, size.z);
        mergedGeometry.translate(-center.x, -center.y, -center.z);
        mergedGeometry.scale(scale, scale, scale);

        // Sample surface for points
        const sampler = new MeshSurfaceSampler(mergedMesh).build();
        const positions = new Float32Array(TOTAL_PARTICLES * 3);
        const targetPositions = new Float32Array(TOTAL_PARTICLES * 3);
        const sizes = new Float32Array(TOTAL_PARTICLES);

        const tempPos = new THREE.Vector3();
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
          sampler.sample(tempPos);
          targetPositions.set([tempPos.x, tempPos.y, tempPos.z], i * 3);
          
          // Initial scattered explosion state
          positions.set([
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ], i * 3);

          sizes[i] = 0.004 + Math.random() * 0.012;
        }

        // DISPOSE ORIGINAL RESOURCES IMMEDIATELY
        mergedGeometry.dispose();
        geometries.forEach(g => g.dispose());
        gltf.scene.traverse((node) => {
          const m = node as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
            else if (m.material) m.material.dispose();
          }
        });

        // --- 4. BUILD POINTS SYSTEM ---
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointsGeometry.setAttribute('aTargetPosition', new THREE.BufferAttribute(targetPositions, 3));
        pointsGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uFormation: { value: 0 },
            uSpeaking: { value: speaking ? 1.0 : 0.0 }
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        stateRef.current.material = material;

        const points = new THREE.Points(pointsGeometry, material);
        scene.add(points);

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Neural Load Error:', err);
        setError('Critical: Protocol Handshake Failed.');
        setLoading(false);
      }
    );

    // --- 5. ANIMATION LOOP ---
    const animate = () => {
      const elapsed = (Date.now() - stateRef.current.startTime) / 1000;

      if (stateRef.current.material) {
        stateRef.current.material.uniforms.uTime.value = elapsed;
        
        // Smooth formation transition
        const t = Math.min(elapsed / 2.5, 1.0);
        stateRef.current.material.uniforms.uFormation.value = 1.0 - Math.pow(1.0 - t, 3.0); // Ease Out Cubic
      }

      renderer.render(scene, camera);
      stateRef.current.animationFrame = requestAnimationFrame(animate);
    };
    animate();

    // --- 6. RESIZE HANDLER ---
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. CLEANUP PROTOCOL ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (stateRef.current.animationFrame) cancelAnimationFrame(stateRef.current.animationFrame);
      
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) obj.material.dispose();
        }
      });

      stateRef.current.renderer = null;
      stateRef.current.scene = null;
      stateRef.current.material = null;
    };
  }, [active]);

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-[#010208] rounded-[2rem] overflow-hidden border border-white/5 ${className}`}>
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {(loading || isLoader) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050816]/90 backdrop-blur-xl z-50">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
            <div className="absolute inset-0 border-b-2 border-accent rounded-full animate-spin" />
            <div className="absolute inset-4 glass rounded-full flex items-center justify-center">
               <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.6em] text-accent animate-pulse">
            Synchronizing Neural Persona...
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
