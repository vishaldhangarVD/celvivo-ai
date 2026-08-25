'use client';

import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview CandidateHologram - High-Fidelity Neural Face Hologram v2.0.
 * 
 * Generates a realistic, cinematic 3D hologram of the candidate by projecting
 * the live camera feed into a high-density luminous particle cloud with
 * neural depth mapping.
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // THREE engine refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;

    // --- PHASE 1: SENSORY INPUT HANDSHAKE ---
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
          },
          audio: false
        });
        
        if (!isMounted) return;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.play();
        
        videoRef.current = video;
        streamRef.current = stream;
        
        // Wait for video to be ready before starting THREE
        video.onloadedmetadata = () => {
          if (isMounted) initNeuralEngine(video);
        };
      } catch (err) {
        console.error('[Hologram] Webcam acquisition failed:', err);
        if (isMounted) initNeuralEngine(null);
      }
    };

    // --- PHASE 2: NEURAL ENGINE INITIALIZATION ---
    const initNeuralEngine = (source: HTMLVideoElement | null) => {
      if (!canvasRef.current || !containerRef.current) return;

      const width = containerRef.current.clientWidth || 400;
      const height = containerRef.current.clientHeight || 400;

      // Setup Environment
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.z = 2.4;
      cameraRef.current = camera;

      // Renderer Calibration
      try {
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        rendererRef.current = renderer;
      } catch (e) {
        console.error('[Hologram] WebGL context creation failure');
        return;
      }

      // Geometry Synthesis (approx 32,400 points)
      const res = 180; 
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(res * res * 3);
      const uvArr = new Float32Array(res * res * 2);

      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const idx = i * res + j;
          // Grid layout
          posArr[idx * 3] = (j / res) * 2 - 1;
          posArr[idx * 3 + 1] = (i / res) * 2 - 1;
          posArr[idx * 3 + 2] = 0;
          // UV mapping
          uvArr[idx * 2] = j / res;
          uvArr[idx * 2 + 1] = i / res;
        }
      }

      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

      // Neural Texture
      const videoTexture = source ? new THREE.VideoTexture(source) : null;
      if (videoTexture) {
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
      }

      // Material Calibration (Cinematic Hologram Shader)
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          tVideo: { value: videoTexture },
          uTime: { value: 0 },
          uSpeaking: { value: 0.0 },
          uActive: { value: source ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vLum;
          uniform sampler2D tVideo;
          uniform float uTime;
          uniform float uSpeaking;
          uniform float uActive;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float lum = 0.2;
            if (uActive > 0.5) {
              vec4 col = texture2D(tVideo, uv);
              lum = (col.r + col.g + col.b) / 3.0;
            } else {
              // Idle noise pattern
              lum = sin(uv.x * 20.0 + uTime) * 0.05 + 0.15;
            }
            vLum = lum;

            // Neural Depth Mapping
            // Luminous parts of face project forward
            float depth = lum * 0.7;

            // Face Isolation Mask (keep it head-shaped)
            float dist = distance(uv, vec2(0.5, 0.5));
            float mask = smoothstep(0.48, 0.25, dist);
            
            pos.z += depth * mask;

            // Head Sway Animation
            pos.x += sin(uTime * 0.45) * 0.025 * mask;
            pos.y += cos(uTime * 0.35) * 0.015 * mask;

            // Speaking Protocol (Mouth Warping)
            if (uSpeaking > 0.5) {
              float mouthStrength = smoothstep(0.12, 0.0, distance(uv, vec2(0.5, 0.35)));
              pos.z += sin(uTime * 18.0) * 0.06 * mouthStrength;
            }

            // Depth-based size scaling
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = (16.0 / -mvPos.z) * (0.8 + lum * 1.2);
            gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying float vLum;
          uniform float uTime;

          void main() {
            // High-def particle shape
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;

            // Nexvoro Core Color Matrix (Cyan/Electric Blue)
            vec3 color = vec3(0.0, 0.85, 1.0);
            
            // Scanline synthesis
            float sl = sin(vUv.y * 300.0 - uTime * 6.0) * 0.08 + 0.92;
            
            // Brightness Pulse
            float pulse = sin(uTime * 2.5) * 0.05 + 0.95;

            // Alpha calibration
            float alpha = (1.0 - d * 2.0) * vLum * 1.8;
            
            // Cinematic Edge Glow
            float edge = smoothstep(0.42, 0.5, distance(vUv, vec2(0.5)));
            color += edge * vec3(0.0, 0.3, 1.0);

            gl_FragColor = vec4(color * sl * pulse, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);
      pointsRef.current = points;

      // Start Temporal Processing
      beginTemporalLoop();
    };

    const beginTemporalLoop = () => {
      const loop = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        const time = performance.now() * 0.001;
        
        if (pointsRef.current) {
          const m = pointsRef.current.material as THREE.ShaderMaterial;
          m.uniforms.uTime.value = time;
          m.uniforms.uSpeaking.value = speaking ? 1.0 : 0.0;
          
          // Micro-movement
          pointsRef.current.rotation.y = Math.sin(time * 0.35) * 0.06;
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        frameIdRef.current = requestAnimationFrame(loop);
      };
      loop();
    };

    initializeWebcam();

    // CLEANUP PROTOCOL
    return () => {
      isMounted = false;
      cancelAnimationFrame(frameIdRef.current);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.ShaderMaterial).dispose();
      }
    };
  }, [active, speaking]);

  // Responsive Grid Re-calibration
  useEffect(() => {
    const handleReScale = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleReScale);
    return () => window.removeEventListener('resize', handleReScale);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative w-full h-full bg-black/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Holographic Matrix Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dynamic Matrix Grain */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[length:4px_4px]" />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        
        {/* Identity Signal Status */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
           <div className={cn("w-2 h-2 rounded-full", active ? 'bg-accent animate-pulse shadow-[0_0_10px_#22d3ee]' : 'bg-red-500')} />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Neural Identity {active ? 'Synced' : 'Lost'}</span>
        </div>
      </div>

      {/* Loading Handshake */}
      {isLoader && (
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
