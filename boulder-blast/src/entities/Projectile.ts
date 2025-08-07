/**
 * Projectile - Player's projectile entity
 * Fast upward-moving bullets that damage asteroids
 */

import * as THREE from "three";

export class Projectile {
  private mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private isActive: boolean = true;

  // Projectile properties (from GRD)
  private speed: number = 800; // Fast upward movement (pixels per second)
  private damage: number = 1; // 1 HP damage to asteroids

  constructor(startX: number, startY: number, damage: number = 1) {
    this.position = new THREE.Vector3(startX, startY, 0);
    this.velocity = new THREE.Vector3(0, this.speed, 0); // Move upward
    this.damage = damage; // Set custom damage value
    this.mesh = this.createProjectileMesh();
    this.updateMeshPosition();
  }

  /**
   * Create projectile mesh using sprite texture with geometric fallback
   */
  private createProjectileMesh(): THREE.Mesh {
    // Try sprite-based projectile first
    return this.createSpriteProjectile() || this.createGeometricProjectile();
  }

  /**
   * Create sprite-based projectile
   */
  private createSpriteProjectile(): THREE.Mesh | null {
    try {
      // Create plane geometry for sprite (smaller for projectile)
      const geometry = new THREE.PlaneGeometry(8, 16); // Narrow missile shape

      // Load projectile sprite texture with fallback handling
      const textureLoader = new THREE.TextureLoader();

      // Create material first with fallback color
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff, // White for texture
        transparent: true,
        alphaTest: 0.1,
      });

      // Attempt to load texture
      textureLoader.load(
        "/Sprites/Missiles/spaceMissiles_009.png", // Fixed sprite path
        // onLoad
        (loadedTexture) => {
          // Configure texture for pixel art
          loadedTexture.magFilter = THREE.NearestFilter;
          loadedTexture.minFilter = THREE.NearestFilter;
          loadedTexture.generateMipmaps = false;

          // Apply texture to material
          material.map = loadedTexture;
          material.needsUpdate = true;

          console.log("🚀 Projectile sprite texture loaded successfully");
        },
        // onProgress
        undefined,
        // onError
        (error) => {
          console.warn(
            "⚠️ Failed to load projectile sprite, will use geometric fallback:",
            error
          );
        }
      );

      const mesh = new THREE.Mesh(geometry, material);
      console.log("🚀 Created sprite-based projectile mesh");
      return mesh;
    } catch (error) {
      console.warn("⚠️ Sprite projectile creation failed:", error);
      return null;
    }
  }

  /**
   * Create simple geometric projectile as fallback
   */
  private createGeometricProjectile(): THREE.Mesh {
    // Create a simple cylinder/capsule shape for projectile
    const geometry = new THREE.CapsuleGeometry(2, 12, 4, 8); // radius, length, capSegments, radialSegments

    // Bright energy-based material
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ffff, // Bright cyan energy color
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    console.log("🚀 Created geometric fallback projectile mesh");
    return mesh;
  }

  /**
   * Update projectile position and check bounds
   */
  public update(deltaTime: number, worldBounds: any): void {
    if (!this.isActive) return;

    // Move projectile upward
    this.position.add(
      new THREE.Vector3(
        this.velocity.x * deltaTime,
        this.velocity.y * deltaTime,
        0
      )
    );

    // Deactivate if projectile goes off-screen (top)
    if (this.position.y > worldBounds.top + 50) {
      this.isActive = false;
    }

    this.updateMeshPosition();
  }

  /**
   * Update mesh position to match logical position
   */
  private updateMeshPosition(): void {
    this.mesh.position.copy(this.position);
  }

  /**
   * Get the Three.js mesh for rendering
   */
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Get current position
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get damage value
   */
  public getDamage(): number {
    return this.damage;
  }

  /**
   * Check if projectile is still active
   */
  public isActiveProjectile(): boolean {
    return this.isActive;
  }

  /**
   * Deactivate projectile (when it hits something)
   */
  public deactivate(): void {
    this.isActive = false;
  }

  /**
   * Get bounding box for collision detection
   */
  public getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this.mesh);
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
  }
}
