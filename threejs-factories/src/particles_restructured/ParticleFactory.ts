import * as THREE from "three";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "./types/ParticleTypes.js";

/**
 * Particle Effects Factory
 *
 * Usage:
 * ```typescript
 * import { ParticleFactory } from './particles_restructured';
 * import { FireExplosion, MagicSparkles } from './particles_restructured';
 *
 * const factory = new ParticleFactory();
 *
 * const explosion = await factory.create(new FireExplosion(), position);
 * const sparkles = await factory.create(new MagicSparkles(), position, { particleCount: 200 });
 *
 * scene.add(explosion.mesh);
 * scene.add(sparkles.mesh);
 * ```
 */
export class ParticleFactory {
  private scene?: THREE.Scene;
  private activeSystems = new Map<string, ParticleSystem>();
  private systemCounter = 0;

  constructor(scene?: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Create a particle effect from a particle class
   */
  async create(
    effect: IParticleEffect,
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    const system = await effect.create(position, config);

    // Generate unique ID
    system.id = `particle_${this.systemCounter++}`;

    // Store active system
    this.activeSystems.set(system.id, system);

    // Auto-add to scene if provided
    if (this.scene) {
      this.scene.add(system.mesh);
    }

    // Set up cleanup on completion
    const originalOnComplete = system.onComplete;
    system.onComplete = () => {
      this.remove(system.id);
      originalOnComplete?.();
    };

    return system;
  }

  /**
   * Create multiple particle effects at once
   */
  async createBatch(
    effects: Array<{
      effect: IParticleEffect;
      position: THREE.Vector3;
      config?: ParticleConfig;
    }>
  ): Promise<ParticleSystem[]> {
    const promises = effects.map(({ effect, position, config }) =>
      this.create(effect, position, config)
    );
    return Promise.all(promises);
  }

  /**
   * Create particle effect at world position with automatic cleanup
   */
  async createOneShot(
    effect: IParticleEffect,
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    const system = await this.create(effect, position, {
      ...config,
      emissionDuration: config?.emissionDuration || 1.0, // Default 1 second
    });

    // Auto-start and auto-cleanup
    system.play();

    return system;
  }

  /**
   * Update all active particle systems
   */
  update(deltaTime: number): void {
    this.activeSystems.forEach((system) => {
      if (system.isActive) {
        system.update(deltaTime);
      }
    });
  }

  /**
   * Get active particle system by ID
   */
  getSystem(id: string): ParticleSystem | undefined {
    return this.activeSystems.get(id);
  }

  /**
   * Remove and dispose particle system
   */
  remove(id: string): boolean {
    const system = this.activeSystems.get(id);
    if (!system) return false;

    // Remove from scene
    if (this.scene && system.mesh.parent === this.scene) {
      this.scene.remove(system.mesh);
    }

    // Dispose system
    system.dispose();

    // Remove from active systems
    this.activeSystems.delete(id);

    return true;
  }

  /**
   * Remove all particle systems
   */
  clear(): void {
    this.activeSystems.forEach((_, id) => {
      this.remove(id);
    });
  }

  /**
   * Pause all active systems
   */
  pauseAll(): void {
    this.activeSystems.forEach((system) => {
      system.pause();
    });
  }

  /**
   * Resume all paused systems
   */
  resumeAll(): void {
    this.activeSystems.forEach((system) => {
      if (!system.isActive) {
        system.play();
      }
    });
  }

  /**
   * Get count of active particle systems
   */
  getActiveCount(): number {
    return this.activeSystems.size;
  }

  /**
   * Get all active system IDs
   */
  getActiveIds(): string[] {
    return Array.from(this.activeSystems.keys());
  }

  /**
   * Set the scene for automatic mesh management
   */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  /**
   * Dispose of the factory and all active systems
   */
  dispose(): void {
    this.clear();
    this.scene = undefined;
  }
}
