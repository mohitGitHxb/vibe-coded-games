/**
 * Particle Effects Factory Module - Complete particle systems for Three.js
 *
 * This module provides comprehensive particle effect capabilities including:
 * - Combat effects (explosions, sparks, impacts)
 * - Environmental effects (rain, snow, fire, smoke)
 * - Magic effects (sparkles, energy, portals)
 * - UI effects (click bursts, transitions, notifications)
 * - Advanced physics simulation with GSAP animations
 * - Customizable shaders and materials
 * - Performance optimized with pooling support
 *
 * @example Basic Usage
 * ```typescript
 * import { ParticleFactory, FireExplosion, MagicSparkles } from './particles_restructured/index.js';
 * import * as THREE from 'three';
 *
 * // Create particle factory
 * const particles = new ParticleFactory(scene);
 *
 * // Create explosion effect
 * const explosion = await particles.create(
 *   new FireExplosion(),
 *   new THREE.Vector3(0, 0, 0),
 *   { particleCount: 200 }
 * );
 *
 * explosion.play();
 *
 * // Update in animation loop
 * function animate(deltaTime) {
 *   particles.update(deltaTime);
 * }
 * ```
 */

import * as THREE from "three";
import type { ParticleConfig } from "./types/ParticleTypes.js";
import type { ParticleFactory } from "./ParticleFactory.js";

// === MAIN FACTORY EXPORTS ===
export { ParticleFactory } from "./ParticleFactory.js";

// === COMBAT EFFECTS EXPORTS ===
export { FireExplosion } from "./effects/combat/FireExplosion.js";
export { Sparks } from "./effects/combat/Sparks.js";

// === ENVIRONMENTAL EFFECTS EXPORTS ===
export { Rain } from "./effects/environmental/Rain.js";

// === MAGIC EFFECTS EXPORTS ===
export { MagicSparkles } from "./effects/magic/MagicSparkles.js";

// === UI EFFECTS EXPORTS ===
export { ClickBurst } from "./effects/ui/ClickBurst.js";

// === TYPE EXPORTS ===
export type {
  // Core interfaces
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
  ParticleEffectType,

  // Configuration types
  ParticleSpawnArea,
  ParticleAttractor,
  ParticleTimeline,
  ParticleUniforms,

  // Pool and manager types
  ParticlePool,
  ParticleManagerConfig,
} from "./types/ParticleTypes.js";

// === REGISTRY EXPORTS ===
export {
  COMPLETE_PARTICLES_REGISTRY,
  getParticlesByCategory,
  getParticleCategories,
  getParticleInfo,
  searchParticles,
} from "./repository/particles-registry.js";

// === UTILITY FUNCTIONS ===

/**
 * Create particle effect from registry key
 */
export async function createParticleFromRegistry(
  factory: ParticleFactory,
  key: string,
  position: THREE.Vector3,
  config?: ParticleConfig
) {
  const { COMPLETE_PARTICLES_REGISTRY } = await import(
    "./repository/particles-registry.js"
  );
  const particleInfo = COMPLETE_PARTICLES_REGISTRY[key];

  if (!particleInfo) {
    throw new Error(`Unknown particle effect: ${key}`);
  }

  return factory.create(new particleInfo.class(), position, config);
}

/**
 * Get particle effect class by registry key
 */
export async function getParticleClass(key: string) {
  const { COMPLETE_PARTICLES_REGISTRY } = await import(
    "./repository/particles-registry.js"
  );
  const particleInfo = COMPLETE_PARTICLES_REGISTRY[key];

  if (!particleInfo) {
    throw new Error(`Unknown particle effect: ${key}`);
  }

  return particleInfo.class;
}
