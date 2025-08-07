import * as THREE from "three";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class Sparks implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Default configuration for sparks effect
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 80,
      emissionRate: 0,
      emissionDuration: 0.8,
      emissionDelay: 0,
      color: [0xffffff, 0xffffaa, 0xffaaaa],
      size: [0.05, 0.15],
      opacity: [1.0, 0.0],
      texture: null,
      velocity: [new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 6, 3)],
      acceleration: new THREE.Vector3(0, -12, 0),
      gravity: -12,
      damping: 0.95,
      lifetime: [0.5, 1.2],
      fadeIn: 0.05,
      fadeOut: 0.6,
      scaleOverTime: 0.8,
      colorOverTime: [],
      spawnArea: { type: "sphere", size: 0.1 },
      worldSpace: true,
      rotationSpeed: 0,
      turbulence: 0.2,
      attractors: [],
      collideGround: true,
      bounceStrength: 0.3,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      sortParticles: false,
      billboarding: true,
    };

    const finalConfig = { ...defaultConfig, ...config };
    const particleCount = finalConfig.particleCount;

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    // Initialize spark particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spawn near origin with slight spread
      const spawnRadius =
        typeof finalConfig.spawnArea.size === "number"
          ? finalConfig.spawnArea.size
          : 0.1;

      positions[i3] = position.x + (Math.random() - 0.5) * spawnRadius;
      positions[i3 + 1] = position.y + (Math.random() - 0.5) * spawnRadius;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * spawnRadius;

      // Random velocity in all directions with upward bias
      const velMin = Array.isArray(finalConfig.velocity)
        ? finalConfig.velocity[0]
        : finalConfig.velocity;
      const velMax = Array.isArray(finalConfig.velocity)
        ? finalConfig.velocity[1]
        : finalConfig.velocity;

      velocities[i3] = velMin.x + Math.random() * (velMax.x - velMin.x);
      velocities[i3 + 1] = velMin.y + Math.random() * (velMax.y - velMin.y);
      velocities[i3 + 2] = velMin.z + Math.random() * (velMax.z - velMin.z);

      // Random lifetime
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
      sizes[i] = minSize + Math.random() * (maxSize - minSize);

      // Initial color (bright white/yellow)
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

    // Create sparks material with streaky effect
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
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          // Create elongated spark shape
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          
          // Create streaky effect
          float streak = abs(coord.x) * 0.3 + abs(coord.y);
          if (streak > 0.5) discard;
          
          float alpha = (1.0 - streak * 2.0) * vOpacity;
          alpha = pow(alpha, 1.5);
          
          // Add intensity based on center distance
          float intensity = 1.0 - dist * 2.0;
          intensity = max(0.0, intensity);
          
          gl_FragColor = vec4(vColor * (1.0 + intensity), alpha);
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

    // Ground collision plane for bouncing
    const groundY = position.y - 2; // Assume ground 2 units below

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
        this.onStart?.();
      },

      pause() {
        this.isActive = false;
      },

      stop() {
        this.isActive = false;
        this.onStop?.();
      },

      reset() {
        for (let i = 0; i < particleCount; i++) {
          lifetimes[i] = maxLifetimes[i];
        }
        (material as any).uniforms.time.value = 0;
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

            // Apply gravity
            velocities[i3 + 1] += finalConfig.acceleration.y * deltaTime;

            // Ground collision
            if (finalConfig.collideGround && positions[i3 + 1] <= groundY) {
              positions[i3 + 1] = groundY;
              velocities[i3 + 1] *= -finalConfig.bounceStrength;

              // Add some sparks on ground impact
              velocities[i3] *= 0.7;
              velocities[i3 + 2] *= 0.7;
            }

            // Apply damping
            velocities[i3] *= finalConfig.damping;
            velocities[i3 + 1] *= finalConfig.damping;
            velocities[i3 + 2] *= finalConfig.damping;

            // Fade and color change over lifetime
            const lifeRatio = lifetimes[i] / maxLifetimes[i];
            opacities[i] = Math.max(0, lifeRatio);

            // Color fade from bright white to orange to red
            if (lifeRatio > 0.8) {
              colors[i3] = 1.0;
              colors[i3 + 1] = 1.0;
              colors[i3 + 2] = 1.0;
            } else if (lifeRatio > 0.4) {
              colors[i3] = 1.0;
              colors[i3 + 1] = 0.8;
              colors[i3 + 2] = 0.4;
            } else {
              colors[i3] = 1.0;
              colors[i3 + 1] = 0.3;
              colors[i3 + 2] = 0.1;
            }
          } else {
            opacities[i] = 0;
          }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.opacity.needsUpdate = true;

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
        geometry.dispose();
        material.dispose();
      },
    };

    return system;
  }
}
