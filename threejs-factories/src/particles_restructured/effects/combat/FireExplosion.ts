import * as THREE from "three";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class FireExplosion implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Default configuration
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 150,
      emissionRate: 0,
      emissionDuration: 0.3,
      emissionDelay: 0,
      color: [0xff4400, 0xff8800, 0xffaa00, 0xffffff],
      size: [0.1, 0.5],
      opacity: [1.0, 0.0],
      texture: null,
      velocity: [new THREE.Vector3(-5, 2, -5), new THREE.Vector3(5, 8, 5)],
      acceleration: new THREE.Vector3(0, -9.8, 0),
      gravity: -9.8,
      damping: 0.98,
      lifetime: [0.8, 1.5],
      fadeIn: 0.1,
      fadeOut: 0.8,
      scaleOverTime: 1.5,
      colorOverTime: [],
      spawnArea: { type: "sphere", size: 0.2 },
      worldSpace: true,
      rotationSpeed: 2,
      turbulence: 0.5,
      attractors: [],
      collideGround: false,
      bounceStrength: 0,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      sortParticles: false,
      billboarding: true,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const particleCount = finalConfig.particleCount;

    // Position array (will be updated each frame)
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spawn in sphere around position
      const spawnRadius =
        typeof finalConfig.spawnArea.size === "number"
          ? finalConfig.spawnArea.size
          : 0.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * spawnRadius;

      positions[i3] = position.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = position.y + r * Math.cos(phi);
      positions[i3 + 2] = position.z + r * Math.sin(phi) * Math.sin(theta);

      // Random velocity in explosion pattern
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

      // Initial color (orange-red fire)
      const colorArray = Array.isArray(finalConfig.color)
        ? finalConfig.color
        : [finalConfig.color];
      const colorIndex = Math.floor(Math.random() * colorArray.length);
      const color = new THREE.Color(colorArray[colorIndex]);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Initial opacity
      opacities[i] = 1.0;
    }

    // Set geometry attributes
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

    // Create custom shader material for fire effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        opacity: { value: 1.0 },
        pointTexture: { value: null },
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
          // Create circular particle with soft edges
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - (dist * 2.0);
          alpha = pow(alpha, 2.0) * vOpacity;
          
          // Add some flickering
          float flicker = 0.8 + 0.2 * sin(time * 10.0 + gl_FragCoord.x * 0.1);
          
          gl_FragColor = vec4(vColor * flicker, alpha);
        }
      `,
      blending: finalConfig.blending,
      depthTest: finalConfig.depthTest,
      depthWrite: finalConfig.depthWrite,
      transparent: true,
      vertexColors: true,
    });

    // Create particle system mesh
    const particleMesh = new THREE.Points(geometry, material);
    particleMesh.position.copy(position);

    // Create the particle system
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
        // Reset all particles
        for (let i = 0; i < particleCount; i++) {
          lifetimes[i] = maxLifetimes[i];
        }
        (material as any).uniforms.time.value = 0;
      },

      update(deltaTime: number) {
        if (!this.isActive) return;

        // Update time uniform
        (material as any).uniforms.time.value += deltaTime;

        let activeParticles = 0;

        // Update each particle
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Update lifetime
          lifetimes[i] -= deltaTime;

          if (lifetimes[i] > 0) {
            activeParticles++;

            // Update position with velocity
            positions[i3] += velocities[i3] * deltaTime;
            positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
            positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

            // Apply gravity/acceleration
            velocities[i3 + 1] += finalConfig.acceleration.y * deltaTime;

            // Apply damping
            velocities[i3] *= finalConfig.damping;
            velocities[i3 + 1] *= finalConfig.damping;
            velocities[i3 + 2] *= finalConfig.damping;

            // Fade out over lifetime
            const lifeRatio = lifetimes[i] / maxLifetimes[i];
            opacities[i] = Math.max(0, lifeRatio);

            // Color transition from yellow to red to black
            if (lifeRatio > 0.7) {
              // Yellow to orange
              colors[i3] = 1.0;
              colors[i3 + 1] = 0.8 + 0.2 * lifeRatio;
              colors[i3 + 2] = 0.2;
            } else if (lifeRatio > 0.3) {
              // Orange to red
              colors[i3] = 1.0;
              colors[i3 + 1] = 0.4 + 0.4 * lifeRatio;
              colors[i3 + 2] = 0.1;
            } else {
              // Red to black
              colors[i3] = lifeRatio + 0.3;
              colors[i3 + 1] = lifeRatio * 0.2;
              colors[i3 + 2] = lifeRatio * 0.1;
            }
          } else {
            // Hide dead particles
            opacities[i] = 0;
          }
        }

        // Update geometry attributes
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.opacity.needsUpdate = true;

        // Check if effect is complete
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
