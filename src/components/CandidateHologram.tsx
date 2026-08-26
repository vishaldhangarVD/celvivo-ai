'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

interface CandidateHologramProps {
  active?: boolean;
  speaking?: boolean;
  className?: string;
  isLoader?: boolean;
}

const PARTICLE_COUNT = 55000;
const ATMOS_PARTICLE_COUNT = 2200;

const FORMATION_DURATION = 1800;
const NEXVORO_CYAN = new THREE.Color(0x22d3ee);

const easeOutCubic = (t: number) => {
  return 1 - Math.pow(1 - t, 3);
};

type SpeakingTarget = {
  mesh: THREE.Mesh;
  indices: number[];
  baseScale: THREE.Vector3;
};

const CandidateHologram = memo(
  ({
    active = true,
    speaking = false,
    className = '',
    isLoader = false,
  }: CandidateHologramProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    const modelRef = useRef<THREE.Group | null>(null);
    const pointsRef = useRef<THREE.Points | null>(null);
    const atmosRef = useRef<THREE.Points | null>(null);

    const frameIdRef = useRef<number | null>(null);

    const targetPositionsRef = useRef<Float32Array | null>(null);
    const startPositionsRef = useRef<Float32Array | null>(null);

    const formationStartRef = useRef(0);
    const speakingRef = useRef(speaking);

    const speakingTargetsRef = useRef<SpeakingTarget[]>([]);

    const hologramMaterialsRef = useRef<THREE.Material[]>([]);
    const pointsMaterialRef = useRef<THREE.PointsMaterial | null>(null);

    useEffect(() => {
      speakingRef.current = speaking;
    }, [speaking]);

    useEffect(() => {
      if (!active) return;

      let mounted = true;

      const init = async () => {
        if (!containerRef.current || !canvasRef.current) return;

        try {
          setLoading(true);
          setError(false);

          const width = Math.max(containerRef.current.clientWidth, 1);
          const height = Math.max(containerRef.current.clientHeight, 1);

          // ---------------------------------------------------------
          // SCENE
          // ---------------------------------------------------------

          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x02040a);
          sceneRef.current = scene;

          // ---------------------------------------------------------
          // CAMERA
          // ---------------------------------------------------------

          const camera = new THREE.PerspectiveCamera(
            32,
            width / height,
            0.01,
            100
          );

          camera.position.set(0, 0.05, 5);
          camera.lookAt(0, 0, 0);

          cameraRef.current = camera;

          // ---------------------------------------------------------
          // RENDERER
          // ---------------------------------------------------------

          const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          });

          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

          renderer.outputColorSpace = THREE.SRGBColorSpace;

          rendererRef.current = renderer;

          // ---------------------------------------------------------
          // LIGHTING
          // ---------------------------------------------------------

          const ambientLight = new THREE.AmbientLight(0x6ee7ff, 1.8);
          scene.add(ambientLight);

          const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
          keyLight.position.set(2, 4, 5);
          scene.add(keyLight);

          const cyanLight = new THREE.PointLight(0x22d3ee, 6, 8);
          cyanLight.position.set(0, 0.5, 2.5);
          scene.add(cyanLight);

          const purpleLight = new THREE.PointLight(0x7c3aed, 2.5, 7);
          purpleLight.position.set(-2, 1, 1);
          scene.add(purpleLight);

          // ---------------------------------------------------------
          // LOAD GLB
          // IMPORTANT:
          // public/models/woman_head.glb
          // ---------------------------------------------------------

          const loader = new GLTFLoader();

          const gltf = await new Promise<any>((resolve, reject) => {
            loader.load(
              '/models/woman_head.glb',
              resolve,
              undefined,
              reject
            );
          });

          if (!mounted) return;

          const model = gltf.scene;
          modelRef.current = model;

          model.updateMatrixWorld(true);

          // ---------------------------------------------------------
          // FIND MODEL BOUNDS
          // ---------------------------------------------------------

          const rawBox = new THREE.Box3().setFromObject(model);
          const rawCenter = rawBox.getCenter(new THREE.Vector3());
          const rawSize = rawBox.getSize(new THREE.Vector3());

          const modelHeight = Math.max(rawSize.y, 0.001);

          const targetHeight = 3.55;
          const scale = targetHeight / modelHeight;

          // Normalize model around origin
          model.scale.setScalar(scale);

          model.position.set(
            -rawCenter.x * scale,
            -rawCenter.y * scale - 0.05,
            -rawCenter.z * scale
          );

          model.rotation.y = 0;

          // ---------------------------------------------------------
          // HOLOGRAM MATERIAL
          // ---------------------------------------------------------

          const applyHologramMaterial = (source: THREE.Material) => {
            const material = source.clone() as THREE.Material & {
              transparent?: boolean;
              opacity?: number;
              depthWrite?: boolean;
              depthTest?: boolean;
              blending?: THREE.Blending;
              side?: THREE.Side;
              emissive?: THREE.Color;
              emissiveIntensity?: number;
              color?: THREE.Color;
            };

            material.transparent = true;
            material.opacity = 0.72;
            material.depthWrite = false;
            material.depthTest = true;
            material.blending = THREE.AdditiveBlending;
            material.side = THREE.DoubleSide;

            if (material.emissive instanceof THREE.Color) {
              material.emissive.copy(NEXVORO_CYAN);
              material.emissiveIntensity = 0.55;
            }

            // Keep original texture but push it towards cyan.
            if (material.color instanceof THREE.Color) {
              const original = material.color.clone();

              material.color.lerp(NEXVORO_CYAN, 0.42);

              // Avoid losing all original face detail.
              if (original.getHex() === 0x000000) {
                material.color.set(0x22d3ee);
              }
            }

            material.needsUpdate = true;

            hologramMaterialsRef.current.push(material);

            return material;
          };

          // ---------------------------------------------------------
          // PROCESS MODEL
          // ---------------------------------------------------------

          model.traverse((object: THREE.Object3D) => {
            if (!(object instanceof THREE.Mesh)) return;

            const mesh = object;

            // Keep original geometry.
            mesh.frustumCulled = false;
            mesh.renderOrder = 5;

            // Material can be single OR array.
            if (Array.isArray(mesh.material)) {
              mesh.material = (mesh.material as THREE.Material[]).map(
                (mat: THREE.Material) => applyHologramMaterial(mat)
              );
            } else {
              mesh.material = applyHologramMaterial(mesh.material);
            }

            // -------------------------------------------------------
            // MORPH TARGET DETECTION
            // -------------------------------------------------------

            if (mesh.morphTargetDictionary) {
              const mouthIndices: number[] = [];

              Object.entries(mesh.morphTargetDictionary as Record<string, number>).forEach(
                ([name, index]: [string, number]) => {
                  const lower = name.toLowerCase();

                  if (
                    lower.includes('mouth') ||
                    lower.includes('jaw') ||
                    lower.includes('lip') ||
                    lower.includes('viseme') ||
                    lower.includes('talk')
                  ) {
                    mouthIndices.push(index);
                  }
                }
              );

              if (mouthIndices.length > 0) {
                speakingTargetsRef.current.push({
                  mesh,
                  indices: mouthIndices,
                  baseScale: mesh.scale.clone(),
                });
              }
            }
          });

          scene.add(model);

          // ---------------------------------------------------------
          // PARTICLE SAMPLING
          // ---------------------------------------------------------

          const sourceMeshes: THREE.Mesh[] = [];

          model.traverse((object: THREE.Object3D) => {
            if (!(object instanceof THREE.Mesh)) return;

            const name = object.name.toLowerCase();

            // Don't sample invisible/internal geometry.
            if (
              name.includes('inside') ||
              name.includes('inner') ||
              name.includes('mouth_interior') ||
              name.includes('tongue')
            ) {
              return;
            }

            sourceMeshes.push(object);
          });

          const targetPositions = new Float32Array(
            PARTICLE_COUNT * 3
          );

          const startPositions = new Float32Array(
            PARTICLE_COUNT * 3
          );

          const tempPosition = new THREE.Vector3();
          const tempNormal = new THREE.Vector3();

          let particleIndex = 0;

          // ---------------------------------------------------------
          // SAMPLE EACH MESH
          // ---------------------------------------------------------

          for (const mesh of sourceMeshes) {
            if (particleIndex >= PARTICLE_COUNT) break;

            const geometry = mesh.geometry;

            if (!geometry.attributes.position) continue;

            const samplingGeometry = geometry.index
              ? geometry.toNonIndexed()
              : geometry.clone();

            const samplerMesh = new THREE.Mesh(
              samplingGeometry,
              new THREE.MeshBasicMaterial()
            );

            samplerMesh.updateMatrixWorld(true);

            const sampler = new MeshSurfaceSampler(
              samplerMesh
            ).build();

            const remaining = PARTICLE_COUNT - particleIndex;

            // Give each mesh a proportional amount.
            const meshQuota = Math.max(
              100,
              Math.floor(remaining / Math.max(sourceMeshes.length, 1))
            );

            for (
              let i = 0;
              i < meshQuota && particleIndex < PARTICLE_COUNT;
              i++
            ) {
              sampler.sample(tempPosition, tempNormal);

              // Convert sampled local position to world position.
              tempPosition.applyMatrix4(mesh.matrixWorld);

              const idx = particleIndex * 3;

              targetPositions[idx] = tempPosition.x;
              targetPositions[idx + 1] = tempPosition.y;
              targetPositions[idx + 2] = tempPosition.z;

              // Particles begin far away.
              startPositions[idx] =
                tempPosition.x + (Math.random() - 0.5) * 7;

              startPositions[idx + 1] =
                tempPosition.y + (Math.random() - 0.5) * 7;

              startPositions[idx + 2] =
                tempPosition.z + (Math.random() - 0.5) * 5;

              particleIndex++;
            }

            samplingGeometry.dispose();
            (
              samplerMesh.material as THREE.Material
            ).dispose();
          }

          // ---------------------------------------------------------
          // FILL REMAINING PARTICLES
          // ---------------------------------------------------------

          while (particleIndex < PARTICLE_COUNT) {
            const source =
              Math.floor(Math.random() * Math.max(particleIndex, 1));

            const sourceIdx = source * 3;
            const idx = particleIndex * 3;

            targetPositions[idx] =
              targetPositions[sourceIdx] +
              (Math.random() - 0.5) * 0.015;

            targetPositions[idx + 1] =
              targetPositions[sourceIdx + 1] +
              (Math.random() - 0.5) * 0.015;

            targetPositions[idx + 2] =
              targetPositions[sourceIdx + 2] +
              (Math.random() - 0.5) * 0.015;

            startPositions[idx] =
              targetPositions[idx] +
              (Math.random() - 0.5) * 7;

            startPositions[idx + 1] =
              targetPositions[idx + 1] +
              (Math.random() - 0.5) * 7;

            startPositions[idx + 2] =
              targetPositions[idx + 2] +
              (Math.random() - 0.5) * 5;

            particleIndex++;
          }

          // ---------------------------------------------------------
          // PARTICLE NORMALIZATION
          // ---------------------------------------------------------

          const particleBox = new THREE.Box3();

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            tempPosition.set(
              targetPositions[i * 3],
              targetPositions[i * 3 + 1],
              targetPositions[i * 3 + 2]
            );

            particleBox.expandByPoint(tempPosition);
          }

          const particleCenter =
            particleBox.getCenter(new THREE.Vector3());

          const particleHeight =
            Math.max(
              particleBox.max.y - particleBox.min.y,
              0.001
            );

          const particleScale = targetHeight / particleHeight;

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const ix = i * 3;
            const iy = ix + 1;
            const iz = ix + 2;

            targetPositions[ix] =
              (targetPositions[ix] - particleCenter.x) *
              particleScale;

            targetPositions[iy] =
              (targetPositions[iy] - particleCenter.y) *
              particleScale;

            targetPositions[iz] =
              (targetPositions[iz] - particleCenter.z) *
              particleScale;

            startPositions[ix] =
              (startPositions[ix] - particleCenter.x) *
              particleScale;

            startPositions[iy] =
              (startPositions[iy] - particleCenter.y) *
              particleScale;

            startPositions[iz] =
              (startPositions[iz] - particleCenter.z) *
              particleScale;
          }

          targetPositionsRef.current = targetPositions;
          startPositionsRef.current = startPositions;

          // ---------------------------------------------------------
          // PARTICLE GEOMETRY
          // ---------------------------------------------------------

          const particleGeometry = new THREE.BufferGeometry();

          particleGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
              new Float32Array(startPositions),
              3
            )
          );

          const particleMaterial = new THREE.PointsMaterial({
            color: NEXVORO_CYAN,
            size: 0.009,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.52,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true,
          });

          pointsMaterialRef.current = particleMaterial;

          const particles = new THREE.Points(
            particleGeometry,
            particleMaterial
          );

          particles.frustumCulled = false;
          particles.renderOrder = 10;

          scene.add(particles);

          pointsRef.current = particles;

          // ---------------------------------------------------------
          // ATMOSPHERE PARTICLES
          // ---------------------------------------------------------

          const atmosphereGeometry =
            new THREE.BufferGeometry();

          const atmospherePositions =
            new Float32Array(
              ATMOS_PARTICLE_COUNT * 3
            );

          for (
            let i = 0;
            i < ATMOS_PARTICLE_COUNT;
            i++
          ) {
            atmospherePositions[i * 3] =
              (Math.random() - 0.5) * 9;

            atmospherePositions[i * 3 + 1] =
              (Math.random() - 0.5) * 7;

            atmospherePositions[i * 3 + 2] =
              (Math.random() - 0.5) * 5;
          }

          atmosphereGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(
              atmospherePositions,
              3
            )
          );

          const atmosphereMaterial =
            new THREE.PointsMaterial({
              color: 0x22d3ee,
              size: 0.012,
              transparent: true,
              opacity: 0.18,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });

          const atmosphere = new THREE.Points(
            atmosphereGeometry,
            atmosphereMaterial
          );

          atmosphere.frustumCulled = false;

          scene.add(atmosphere);

          atmosRef.current = atmosphere;

          // ---------------------------------------------------------
          // FORMATION START
          // ---------------------------------------------------------

          formationStartRef.current =
            performance.now();

          setLoading(false);

          // ---------------------------------------------------------
          // ANIMATION
          // ---------------------------------------------------------

          const animate = (time: number) => {
            if (
              !mounted ||
              !rendererRef.current ||
              !sceneRef.current ||
              !cameraRef.current
            ) {
              return;
            }

            const timeSeconds = time * 0.001;

            const elapsed =
              time - formationStartRef.current;

            const progress = Math.min(
              elapsed / FORMATION_DURATION,
              1
            );

            const eased = easeOutCubic(progress);

            // -------------------------------------------------------
            // MODEL IDLE MOTION
            // -------------------------------------------------------

            if (modelRef.current) {
              modelRef.current.position.y =
                -rawCenter.y * scale -
                0.05 +
                Math.sin(timeSeconds * 1.2) * 0.012;

              modelRef.current.rotation.y =
                Math.sin(timeSeconds * 0.35) * 0.035;

              modelRef.current.rotation.x =
                Math.sin(timeSeconds * 0.25) * 0.008;
            }

            // -------------------------------------------------------
            // SPEAKING MORPH
            // -------------------------------------------------------

            const speakingNow =
              speakingRef.current;

            speakingTargetsRef.current.forEach(
              ({ mesh, indices }) => {
                if (!mesh.morphTargetInfluences) return;

                indices.forEach((index, position) => {
                  const wave =
                    speakingNow
                      ? Math.max(
                          0,
                          Math.sin(
                            timeSeconds * 11 +
                              position * 0.8
                          )
                        )
                      : 0;

                  mesh.morphTargetInfluences![index] =
                    speakingNow
                      ? wave * 0.55
                      : THREE.MathUtils.lerp(
                          mesh.morphTargetInfluences![index],
                          0,
                          0.15
                        );
                });
              }
            );

            // -------------------------------------------------------
            // PARTICLES
            // -------------------------------------------------------

            if (
              pointsRef.current &&
              targetPositionsRef.current &&
              startPositionsRef.current
            ) {
              const positionAttribute =
                pointsRef.current.geometry
                  .attributes.position;

              const positionArray =
                positionAttribute.array as Float32Array;

              const targets =
                targetPositionsRef.current;

              const starts =
                startPositionsRef.current;

              for (
                let i = 0;
                i < PARTICLE_COUNT;
                i++
              ) {
                const ix = i * 3;
                const iy = ix + 1;
                const iz = ix + 2;

                if (progress < 1) {
                  positionArray[ix] =
                    starts[ix] +
                    (targets[ix] - starts[ix]) *
                      eased;

                  positionArray[iy] =
                    starts[iy] +
                    (targets[iy] - starts[iy]) *
                      eased;

                  positionArray[iz] =
                    starts[iz] +
                    (targets[iz] - starts[iz]) *
                      eased;
                } else {
                  // Extremely subtle hologram movement.
                  positionArray[ix] =
                    targets[ix] +
                    Math.sin(
                      timeSeconds * 0.8 +
                        i * 0.013
                    ) *
                      0.0007;

                  positionArray[iy] =
                    targets[iy] +
                    Math.cos(
                      timeSeconds * 0.7 +
                        i * 0.011
                    ) *
                      0.0007;

                  positionArray[iz] =
                    targets[iz];

                  // Speaking particle response.
                  if (speakingNow) {
                    positionArray[iy] +=
                      Math.sin(
                        timeSeconds * 18 +
                          i * 0.04
                      ) *
                      0.002;
                  }
                }
              }

              positionAttribute.needsUpdate = true;
            }

            // -------------------------------------------------------
            // PARTICLE OPACITY
            // -------------------------------------------------------

            if (pointsMaterialRef.current) {
              pointsMaterialRef.current.opacity =
                speakingNow ? 0.72 : 0.52;

              pointsMaterialRef.current.size =
                speakingNow ? 0.010 : 0.009;
            }

            // -------------------------------------------------------
            // ATMOSPHERE
            // -------------------------------------------------------

            if (atmosRef.current) {
              const atmosphereArray =
                atmosRef.current.geometry
                  .attributes.position
                  .array as Float32Array;

              for (
                let i = 0;
                i < ATMOS_PARTICLE_COUNT;
                i++
              ) {
                const y = i * 3 + 1;

                atmosphereArray[y] +=
                  0.0015;

                if (atmosphereArray[y] > 4) {
                  atmosphereArray[y] = -4;
                }
              }

              atmosRef.current.geometry.attributes.position.needsUpdate =
                true;
            }

            // -------------------------------------------------------
            // HOLOGRAM MATERIAL PULSE
            // -------------------------------------------------------

            hologramMaterialsRef.current.forEach(
              (material) => {
                const mat = material as THREE.Material & {
                  opacity?: number;
                  emissiveIntensity?: number;
                };

                mat.opacity =
                  speakingNow
                    ? 0.82 +
                      Math.sin(
                        timeSeconds * 8
                      ) *
                        0.03
                    : 0.72;

                if (
                  typeof mat.emissiveIntensity ===
                  'number'
                ) {
                  mat.emissiveIntensity =
                    speakingNow ? 0.8 : 0.55;
                }
              }
            );

            // -------------------------------------------------------
            // CAMERA MICRO MOTION
            // -------------------------------------------------------

            cameraRef.current.position.x =
              Math.sin(timeSeconds * 0.22) *
              0.015;

            cameraRef.current.position.y =
              0.05 +
              Math.sin(timeSeconds * 0.3) *
                0.008;

            cameraRef.current.lookAt(
              0,
              0,
              0
            );

            rendererRef.current.render(
              sceneRef.current,
              cameraRef.current
            );

            frameIdRef.current =
              requestAnimationFrame(animate);
          };

          frameIdRef.current =
            requestAnimationFrame(animate);
        } catch (err) {
          console.error(
            '[CandidateHologram] Initialization failed:',
            err
          );

          if (mounted) {
            setError(true);
            setLoading(false);
          }
        }
      };

      init();

      // -------------------------------------------------------------
      // RESIZE
      // -------------------------------------------------------------

      const handleResize = () => {
        if (
          !containerRef.current ||
          !rendererRef.current ||
          !cameraRef.current
        ) {
          return;
        }

        const width =
          Math.max(
            containerRef.current.clientWidth,
            1
          );

        const height =
          Math.max(
            containerRef.current.clientHeight,
            1
          );

        rendererRef.current.setSize(
          width,
          height
        );

        cameraRef.current.aspect =
          width / height;

        cameraRef.current.updateProjectionMatrix();
      };

      window.addEventListener(
        'resize',
        handleResize
      );

      // -------------------------------------------------------------
      // CLEANUP
      // -------------------------------------------------------------

      return () => {
        mounted = false;

        window.removeEventListener(
          'resize',
          handleResize
        );

        if (frameIdRef.current !== null) {
          cancelAnimationFrame(
            frameIdRef.current
          );
        }

        // Dispose particles.
        if (pointsRef.current) {
          pointsRef.current.geometry.dispose();
        
          const material = pointsRef.current.material;
        
          if (Array.isArray(material)) {
            material.forEach((mat) => mat.dispose());
          } else {
            material.dispose();
          }
        
          pointsRef.current = null;
        }
        
        if (atmosRef.current) {
          atmosRef.current.geometry.dispose();
        
          const material = atmosRef.current.material;
        
          if (Array.isArray(material)) {
            material.forEach((mat) => mat.dispose());
          } else {
            material.dispose();
          }
        
          atmosRef.current = null;
        }

        // Dispose cloned hologram materials.
        hologramMaterialsRef.current.forEach(
          (material) => {
            material.dispose();
          }
        );

        hologramMaterialsRef.current = [];

        // Dispose renderer.
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }

        sceneRef.current = null;
        cameraRef.current = null;
        modelRef.current = null;
      };
    }, [active]);

    return (
      <div
        ref={containerRef}
        className={[
          'relative',
          'w-full',
          'h-full',
          'overflow-hidden',
          'rounded-[2rem]',
          'border',
          'border-cyan-400/10',
          'bg-[#02040a]',
          'shadow-[0_0_80px_rgba(34,211,238,0.08)]',
          className,
        ].join(' ')}
      >
        {/* THREE.JS CANVAS */}
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
        />

        {/* LOADING */}
        {(loading || isLoader) && !error && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#050816]/80 backdrop-blur-md">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-cyan-400/10 border-t-cyan-400 animate-spin" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] animate-pulse" />
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 animate-pulse">
              Synchronizing Neural Persona...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#050816]/95 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-500">
              <span className="text-2xl font-black">
                !
              </span>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-white">
                Hologram Offline
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-widest text-white/40">
                Unable to synthesize 3D persona.
              </p>
            </div>
          </div>
        )}

        {/* SCANLINES */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            opacity-[0.055]
            bg-[linear-gradient(to_bottom,transparent_50%,rgba(34,211,238,0.35)_50%)]
            bg-[length:100%_5px]
          "
        />

        {/* HOLOGRAM GLOW */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.13),transparent_60%)]
          "
        />

        {/* EDGE VIGNETTE */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            shadow-[inset_0_0_100px_rgba(0,0,0,0.65)]
          "
        />

        {/* SPEAKING INDICATOR */}
        {speaking && !loading && !error && (
          <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />

              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-300">
                AI Speaking
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CandidateHologram.displayName =
  'CandidateHologram';

export default CandidateHologram;