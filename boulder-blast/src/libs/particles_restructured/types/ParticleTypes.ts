import * as THREE from "three";

/**
 * Base interface for all particle effects
 * Simple contract - create and return a particle system
 */
export interface IParticleEffect {
  /**
   * Create and return the particle system
   * @param position - Initial position for the effect
   * @param config - Optional configuration override
   */
  create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem>;
}

/**
 * Configuration for particle effects
 */
export interface ParticleConfig {
  // Emission properties
  particleCount?: number;
  emissionRate?: number;
  emissionDuration?: number;
  emissionDelay?: number;

  // Visual properties
  color?: THREE.ColorRepresentation | THREE.ColorRepresentation[];
  size?: number | [number, number]; // min, max or single value
  opacity?: number | [number, number];
  texture?: THREE.Texture | string | null;

  // Physics properties
  velocity?: THREE.Vector3 | [THREE.Vector3, THREE.Vector3]; // initial or min/max
  acceleration?: THREE.Vector3;
  gravity?: number;
  damping?: number;

  // Animation properties
  lifetime?: number | [number, number]; // seconds
  fadeIn?: number; // fade in duration
  fadeOut?: number; // fade out duration
  scaleOverTime?: number; // scale multiplier over lifetime
  colorOverTime?: THREE.Color[]; // color animation keyframes

  // Spatial properties
  spawnArea?: ParticleSpawnArea;
  worldSpace?: boolean; // true = world space, false = local space

  // Behavior properties
  rotationSpeed?: number;
  turbulence?: number;
  attractors?: ParticleAttractor[];
  collideGround?: boolean;
  bounceStrength?: number;

  // Advanced properties
  blending?: THREE.Blending;
  depthTest?: boolean;
  depthWrite?: boolean;
  sortParticles?: boolean;
  billboarding?: boolean;
}

/**
 * Spawn area configuration
 */
export interface ParticleSpawnArea {
  type: "point" | "sphere" | "box" | "circle" | "line";
  size?: number | THREE.Vector3; // radius for sphere/circle, dimensions for box
  direction?: THREE.Vector3; // for line spawning
}

/**
 * Particle attractor (for complex behaviors)
 */
export interface ParticleAttractor {
  position: THREE.Vector3;
  strength: number;
  range: number;
  type: "attract" | "repel";
}

/**
 * Main particle system class
 */
export interface ParticleSystem {
  // Core Three.js objects
  mesh: THREE.Points | THREE.Group;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial | THREE.ShaderMaterial;

  // System properties
  id: string;
  isActive: boolean;
  particleCount: number;
  emissionRate: number;
  lifetime: number;

  // Control methods
  play(): void;
  pause(): void;
  stop(): void;
  reset(): void;

  // Update method (called in animation loop)
  update(deltaTime: number): void;

  // Configuration
  setPosition(position: THREE.Vector3): void;
  setEmissionRate(rate: number): void;
  setParticleCount(count: number): void;

  // Lifecycle
  dispose(): void;

  // Events
  onComplete?: () => void;
  onStart?: () => void;
  onStop?: () => void;
}

/**
 * Preset particle effect types
 */
export type ParticleEffectType =
  // Combat effects
  | "explosion"
  | "sparks"
  | "blood"
  | "impact"
  | "muzzleFlash"
  | "shockwave"

  // Environmental effects
  | "fire"
  | "smoke"
  | "steam"
  | "rain"
  | "snow"
  | "fog"
  | "dust"
  | "leaves"

  // Magic effects
  | "sparkles"
  | "energy"
  | "portal"
  | "aura"
  | "lightning"
  | "healing"

  // UI effects
  | "click"
  | "hover"
  | "transition"
  | "notification"
  | "pickup"
  | "achievement"

  // Atmospheric effects
  | "ambient"
  | "weather"
  | "cosmic"
  | "bubbles"
  | "fireflies"
  | "stars";

/**
 * Animation timeline for complex particle behaviors
 */
export interface ParticleTimeline {
  timeline: any; // GSAP Timeline
  duration: number;
  repeat?: number;
  yoyo?: boolean;
}

/**
 * Particle pool for performance optimization
 */
export interface ParticlePool {
  available: ParticleSystem[];
  active: ParticleSystem[];
  maxSize: number;

  acquire(type: ParticleEffectType): ParticleSystem | null;
  release(system: ParticleSystem): void;
  clear(): void;
}

/**
 * Particle manager configuration
 */
export interface ParticleManagerConfig {
  maxParticles?: number;
  enablePooling?: boolean;
  poolSize?: number;
  autoUpdate?: boolean;
  scene?: THREE.Scene;
}

/**
 * Shader uniforms for custom particle materials
 */
export interface ParticleUniforms {
  time?: { value: number };
  color?: { value: THREE.Color };
  opacity?: { value: number };
  size?: { value: number };
  texture?: { value: THREE.Texture | null };
  fogColor?: { value: THREE.Color };
  fogNear?: { value: number };
  fogFar?: { value: number };
}
