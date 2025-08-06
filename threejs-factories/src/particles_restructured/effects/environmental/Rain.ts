import * as THREE from "three";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class Rain implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Default configuration for rain effect
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 300,
      emissionRate: 100,
      emissionDuration: -1, // Continuous
      emissionDelay: 0,
      color: [0x77aaff, 0x5588dd],
      size: [0.02, 0.05],
      opacity: [0.6, 0.3],
      texture: null,
      velocity: [new THREE.Vector3(-1, -15, -1), new THREE.Vector3(1, -25, 1)],
      acceleration: new THREE.Vector3(0, -2, 0),
      gravity: -2,
      damping: 1.0,
      lifetime: [2, 4],
      fadeIn: 0.1,
      fadeOut: 0.2,
      scaleOverTime: 1.0,
      colorOverTime: [],
      spawnArea: { type: "box", size: new THREE.Vector3(20, 0.5, 20) },
      worldSpace: true,
      rotationSpeed: 0,
      turbulence: 0.1,
      attractors: [],
      collideGround: true,
      bounceStrength: 0,
      blending: THREE.NormalBlending,
      depthTest: true,
      depthWrite: false,
      sortParticles: true,
      billboarding: false, // Rain drops are streaks
    };

    const finalConfig = { ...defaultConfig, ...config };
    const particleCount = finalConfig.particleCount;

    // Create rain geometry
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);
    const streakLengths = new Float32Array(particleCount);

    // Initialize rain particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spawn in area above the scene
      const spawnSize = finalConfig.spawnArea.size as THREE.Vector3;
      positions[i3] = position.x + (Math.random() - 0.5) * spawnSize.x;
      positions[i3 + 1] = position.y + 10 + Math.random() * spawnSize.y;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * spawnSize.z;

      // Downward velocity with slight randomness
      const velMin = Array.isArray(finalConfig.velocity)
        ? finalConfig.velocity[0]
        : finalConfig.velocity;
      const velMax = Array.isArray(finalConfig.velocity)
        ? finalConfig.velocity[1]
        : finalConfig.velocity;

      velocities[i3] = velMin.x + Math.random() * (velMax.x - velMin.x);
      velocities[i3 + 1] = velMin.y + Math.random() * (velMax.y - velMin.y);
      velocities[i3 + 2] = velMin.z + Math.random() * (velMax.z - velMin.z);

      // Lifetime
      const minLife = Array.isArray(finalConfig.lifetime)
        ? finalConfig.lifetime[0]
        : finalConfig.lifetime;
      const maxLife = Array.isArray(finalConfig.lifetime)
        ? finalConfig.lifetime[1]
        : finalConfig.lifetime;
      maxLifetimes[i] = minLife + Math.random() * (maxLife - minLife);
      lifetimes[i] = maxLifetimes[i] * Math.random(); // Stagger initial lifetimes

      // Size
      const minSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[0]
        : finalConfig.size;
      const maxSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[1]
        : finalConfig.size;
      sizes[i] = minSize + Math.random() * (maxSize - minSize);

      // Color (blue tints)
      const colorArray = Array.isArray(finalConfig.color)
        ? finalConfig.color
        : [finalConfig.color];
      const colorIndex = Math.floor(Math.random() * colorArray.length);
      const color = new THREE.Color(colorArray[colorIndex]);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Opacity
      const minOpacity = Array.isArray(finalConfig.opacity)
        ? finalConfig.opacity[0]
        : finalConfig.opacity;
      const maxOpacity = Array.isArray(finalConfig.opacity)
        ? finalConfig.opacity[1]
        : finalConfig.opacity;
      opacities[i] = minOpacity + Math.random() * (maxOpacity - minOpacity);

      // Streak length based on velocity
      streakLengths[i] = Math.abs(velocities[i3 + 1]) * 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

    // Rain material with streak effect
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
        varying float vSize;
        
        void main() {
          vColor = color;
          vOpacity = opacity;
          vSize = size;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        varying float vSize;
        
        void main() {
          // Create vertical streak for raindrops
          vec2 coord = gl_PointCoord - vec2(0.5);
          
          // Vertical streak
          float streak = abs(coord.x) * 3.0 + abs(coord.y) * 0.5;
          if (streak > 0.5) discard;
          
          float alpha = (1.0 - streak * 2.0) * vOpacity;
          alpha = pow(alpha, 0.8);
          
          // Slight blue tint and transparency
          gl_FragColor = vec4(vColor, alpha * 0.7);
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

    const groundY = position.y - 5;

    const system: ParticleSystem = {
      mesh: particleMesh,
      geometry: geometry,
      material: material,
      id: "",
      isActive: false,
      particleCount: particleCount,
      emissionRate: finalConfig.emissionRate,
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
          lifetimes[i] = maxLifetimes[i] * Math.random();
        }
        (material as any).uniforms.time.value = 0;
      },

      update(deltaTime: number) {
        if (!this.isActive) return;

        (material as any).uniforms.time.value += deltaTime;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          lifetimes[i] -= deltaTime;

          // Respawn rain drops continuously
          if (lifetimes[i] <= 0) {
            // Reset to top
            const spawnSize = finalConfig.spawnArea.size as THREE.Vector3;
            positions[i3] = position.x + (Math.random() - 0.5) * spawnSize.x;
            positions[i3 + 1] = position.y + 10 + Math.random() * spawnSize.y;
            positions[i3 + 2] =
              position.z + (Math.random() - 0.5) * spawnSize.z;

            // Reset velocity
            const velMin = Array.isArray(finalConfig.velocity)
              ? finalConfig.velocity[0]
              : finalConfig.velocity;
            const velMax = Array.isArray(finalConfig.velocity)
              ? finalConfig.velocity[1]
              : finalConfig.velocity;

            velocities[i3] = velMin.x + Math.random() * (velMax.x - velMin.x);
            velocities[i3 + 1] =
              velMin.y + Math.random() * (velMax.y - velMin.y);
            velocities[i3 + 2] =
              velMin.z + Math.random() * (velMax.z - velMin.z);

            lifetimes[i] = maxLifetimes[i];
          }

          // Update position
          positions[i3] += velocities[i3] * deltaTime;
          positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
          positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

          // Apply acceleration
          velocities[i3 + 1] += finalConfig.acceleration.y * deltaTime;

          // Ground collision - respawn
          if (positions[i3 + 1] <= groundY) {
            lifetimes[i] = 0; // Trigger respawn
          }

          // Add subtle wind effect
          velocities[i3] +=
            Math.sin((material as any).uniforms.time.value * 2 + i) *
            0.5 *
            deltaTime;
        }

        geometry.attributes.position.needsUpdate = true;
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
