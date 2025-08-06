import * as THREE from "three";
import { gsap } from "gsap";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class ClickBurst implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Default configuration for UI click burst
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 20,
      emissionRate: 0,
      emissionDuration: 0.5,
      emissionDelay: 0,
      color: [0xffffff, 0x00ff88, 0x0088ff],
      size: [0.08, 0.15],
      opacity: [1.0, 0.0],
      texture: null,
      velocity: [new THREE.Vector3(-3, -3, -3), new THREE.Vector3(3, 3, 3)],
      acceleration: new THREE.Vector3(0, 0, 0),
      gravity: 0,
      damping: 0.92,
      lifetime: [0.3, 0.6],
      fadeIn: 0.05,
      fadeOut: 0.4,
      scaleOverTime: 1.5,
      colorOverTime: [],
      spawnArea: { type: "point" },
      worldSpace: false, // UI space
      rotationSpeed: 5,
      turbulence: 0,
      attractors: [],
      collideGround: false,
      bounceStrength: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      sortParticles: false,
      billboarding: true,
    };

    const finalConfig = { ...defaultConfig, ...config };
    const particleCount = finalConfig.particleCount;

    // Create click burst geometry
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const initialSizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    // Initialize click burst particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // All start at click position
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;

      // Radial velocity pattern
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;

      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.sin(angle) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 2;

      // Short lifetime for snappy UI feedback
      const minLife = Array.isArray(finalConfig.lifetime)
        ? finalConfig.lifetime[0]
        : finalConfig.lifetime;
      const maxLife = Array.isArray(finalConfig.lifetime)
        ? finalConfig.lifetime[1]
        : finalConfig.lifetime;
      maxLifetimes[i] = minLife + Math.random() * (maxLife - minLife);
      lifetimes[i] = maxLifetimes[i];

      // Size
      const minSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[0]
        : finalConfig.size;
      const maxSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[1]
        : finalConfig.size;
      initialSizes[i] = minSize + Math.random() * (maxSize - minSize);
      sizes[i] = initialSizes[i];

      // UI colors (bright and clean)
      const colorArray = Array.isArray(finalConfig.color)
        ? finalConfig.color
        : [finalConfig.color];
      const colorIndex = Math.floor(Math.random() * colorArray.length);
      const color = new THREE.Color(colorArray[colorIndex]);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      opacities[i] = 1.0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

    // Clean UI particle material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        opacity: { value: 1.0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vColor = color;
          vOpacity = opacity;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          // Clean circular particle
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft edge falloff
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vOpacity;
          
          // Slight pulsing
          float pulse = 1.0 + sin(time * 20.0) * 0.1;
          
          gl_FragColor = vec4(vColor * pulse, alpha);
        }
      `,
      blending: finalConfig.blending,
      depthTest: finalConfig.depthTest,
      depthWrite: finalConfig.depthWrite,
      transparent: true,
      vertexColors: true,
    });

    const particleMesh = new THREE.Points(geometry, material);
    particleMesh.position.copy(position);

    // GSAP animation for burst effect
    const timeline = gsap.timeline();
    timeline.from(particleMesh.scale, {
      duration: 0.1,
      x: 0.5,
      y: 0.5,
      z: 0.5,
      ease: "back.out(2)",
    });

    const system: ParticleSystem = {
      mesh: particleMesh,
      geometry: geometry,
      material: material,
      id: "",
      isActive: false,
      particleCount: particleCount,
      emissionRate: 0,
      lifetime: finalConfig.emissionDuration,

      play() {
        this.isActive = true;
        timeline.restart();
        this.onStart?.();
      },

      pause() {
        this.isActive = false;
        timeline.pause();
      },

      stop() {
        this.isActive = false;
        timeline.kill();
        this.onStop?.();
      },

      reset() {
        for (let i = 0; i < particleCount; i++) {
          lifetimes[i] = maxLifetimes[i];

          // Reset positions
          const i3 = i * 3;
          positions[i3] = position.x;
          positions[i3 + 1] = position.y;
          positions[i3 + 2] = position.z;
        }
        (material as any).uniforms.time.value = 0;
        timeline.restart();
      },

      update(deltaTime: number) {
        if (!this.isActive) return;

        (material as any).uniforms.time.value += deltaTime;

        let activeParticles = 0;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          lifetimes[i] -= deltaTime;

          if (lifetimes[i] > 0) {
            activeParticles++;

            // Update position
            positions[i3] += velocities[i3] * deltaTime;
            positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
            positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

            // Apply damping for smooth deceleration
            velocities[i3] *= finalConfig.damping;
            velocities[i3 + 1] *= finalConfig.damping;
            velocities[i3 + 2] *= finalConfig.damping;

            // Scale and fade over lifetime
            const lifeRatio = lifetimes[i] / maxLifetimes[i];

            // Scale grows then shrinks
            if (lifeRatio > 0.7) {
              sizes[i] = initialSizes[i] * (1.0 + (1.0 - lifeRatio) * 2);
            } else {
              sizes[i] = initialSizes[i] * lifeRatio * 2;
            }

            // Quick fade out
            opacities[i] = Math.pow(lifeRatio, 0.5);
          } else {
            opacities[i] = 0;
          }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.opacity.needsUpdate = true;

        // Complete when all particles are done
        if (activeParticles === 0) {
          this.stop();
          this.onComplete?.();
        }
      },

      setPosition(newPosition: THREE.Vector3) {
        particleMesh.position.copy(newPosition);
      },

      setEmissionRate(rate: number) {
        this.emissionRate = rate;
      },

      setParticleCount(count: number) {
        this.particleCount = count;
      },

      dispose() {
        timeline.kill();
        geometry.dispose();
        material.dispose();
      },
    };

    return system;
  }
}
