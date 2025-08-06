import * as THREE from "three";
import { gsap } from "gsap";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class MagicSparkles implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Default configuration for magical sparkles
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 100,
      emissionRate: 50,
      emissionDuration: -1, // Continuous
      emissionDelay: 0,
      color: [0xff00ff, 0x00ffff, 0xffff00, 0xff66ff, 0x66ffff],
      size: [0.05, 0.15],
      opacity: [1.0, 0.0],
      texture: null,
      velocity: [new THREE.Vector3(-2, -1, -2), new THREE.Vector3(2, 3, 2)],
      acceleration: new THREE.Vector3(0, 1, 0),
      gravity: 1,
      damping: 0.99,
      lifetime: [1.5, 3.0],
      fadeIn: 0.2,
      fadeOut: 1.0,
      scaleOverTime: 1.2,
      colorOverTime: [],
      spawnArea: { type: "sphere", size: 0.5 },
      worldSpace: true,
      rotationSpeed: 3,
      turbulence: 0.3,
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
    const particleCount = finalConfig.particleCount;

    // Create sparkle geometry
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const initialSizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const opacities = new Float32Array(particleCount);
    const rotations = new Float32Array(particleCount);
    const rotationSpeeds = new Float32Array(particleCount);

    // Initialize magical sparkle particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Spawn in sphere around position
      const spawnRadius =
        typeof finalConfig.spawnArea.size === "number"
          ? finalConfig.spawnArea.size
          : 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = Math.random() * spawnRadius;

      positions[i3] = position.x + r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = position.y + r * Math.cos(phi);
      positions[i3 + 2] = position.z + r * Math.sin(phi) * Math.sin(theta);

      // Gentle floating motion
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

      // Size with pulsing
      const minSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[0]
        : finalConfig.size;
      const maxSize = Array.isArray(finalConfig.size)
        ? finalConfig.size[1]
        : finalConfig.size;
      initialSizes[i] = minSize + Math.random() * (maxSize - minSize);
      sizes[i] = initialSizes[i];

      // Magical colors
      const colorArray = Array.isArray(finalConfig.color)
        ? finalConfig.color
        : [finalConfig.color];
      const colorIndex = Math.floor(Math.random() * colorArray.length);
      const color = new THREE.Color(colorArray[colorIndex]);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      opacities[i] = 1.0;

      // Rotation
      rotations[i] = Math.random() * Math.PI * 2;
      rotationSpeeds[i] = (Math.random() - 0.5) * finalConfig.rotationSpeed;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute("rotation", new THREE.BufferAttribute(rotations, 1));

    // Magic sparkle material with star/plus shape
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        opacity: { value: 1.0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float rotation;
        attribute vec3 color;
        
        varying vec3 vColor;
        varying float vOpacity;
        varying float vRotation;
        
        void main() {
          vColor = color;
          vOpacity = opacity;
          vRotation = rotation;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vColor;
        varying float vOpacity;
        varying float vRotation;
        
        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          
          // Apply rotation
          float cosR = cos(vRotation);
          float sinR = sin(vRotation);
          vec2 rotCoord = vec2(
            coord.x * cosR - coord.y * sinR,
            coord.x * sinR + coord.y * cosR
          );
          
          // Create star/sparkle shape
          float dist = length(rotCoord);
          float angle = atan(rotCoord.y, rotCoord.x);
          
          // Create 4-pointed star
          float star = abs(cos(angle * 2.0)) * 0.3 + abs(sin(angle * 2.0)) * 0.3;
          float sparkle = smoothstep(0.5, 0.0, dist) * smoothstep(0.0, 0.2, star);
          
          // Add center glow
          float center = 1.0 - smoothstep(0.0, 0.3, dist);
          
          float alpha = (sparkle + center * 0.5) * vOpacity;
          if (alpha < 0.01) discard;
          
          // Add twinkling effect
          float twinkle = 0.8 + 0.2 * sin(time * 8.0 + gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
          
          gl_FragColor = vec4(vColor * twinkle, alpha);
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

    // GSAP timeline for magical floating animation
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline.to(particleMesh.position, {
      duration: 2,
      y: position.y + 0.5,
      ease: "power2.inOut",
    });

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
        timeline.play();
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
          lifetimes[i] = maxLifetimes[i] * Math.random();
        }
        (material as any).uniforms.time.value = 0;
        timeline.restart();
      },

      update(deltaTime: number) {
        if (!this.isActive) return;

        (material as any).uniforms.time.value += deltaTime;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          lifetimes[i] -= deltaTime;

          // Respawn sparkles continuously
          if (lifetimes[i] <= 0) {
            // Reset to spawn area
            const spawnRadius =
              typeof finalConfig.spawnArea.size === "number"
                ? finalConfig.spawnArea.size
                : 0.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * spawnRadius;

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.cos(phi);
            positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            // New random color
            const colorArray = Array.isArray(finalConfig.color)
              ? finalConfig.color
              : [finalConfig.color];
            const colorIndex = Math.floor(Math.random() * colorArray.length);
            const color = new THREE.Color(colorArray[colorIndex]);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            lifetimes[i] = maxLifetimes[i];
          }

          // Gentle floating motion
          positions[i3] += velocities[i3] * deltaTime;
          positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
          positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

          // Add swirling motion
          const time = (material as any).uniforms.time.value;
          const swirl = Math.sin(time + i * 0.1) * 0.5;
          positions[i3] += Math.cos(time * 2 + i) * swirl * deltaTime;
          positions[i3 + 2] += Math.sin(time * 2 + i) * swirl * deltaTime;

          // Pulsing size
          const pulse = 1.0 + Math.sin(time * 4 + i * 0.5) * 0.3;
          sizes[i] = initialSizes[i] * pulse;

          // Rotation
          rotations[i] += rotationSpeeds[i] * deltaTime;

          // Fade based on lifetime
          const lifeRatio = lifetimes[i] / maxLifetimes[i];
          if (lifeRatio < 0.2) {
            opacities[i] = lifeRatio * 5; // Fade out
          } else if (lifeRatio > 0.8) {
            opacities[i] = (1.0 - lifeRatio) * 5; // Fade in
          } else {
            opacities[i] = 1.0;
          }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.opacity.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;
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
