/**
 * Asteroid - Enemy asteroid entities with different sizes and properties
 * Falls from top of screen toward spaceship
 */

import * as THREE from "three";

export type AsteroidType = "small" | "medium" | "large";

export interface AsteroidProperties {
  hp: number;
  speed: number;
  damageToShip: number;
  points: number;
  size: number;
  color: number;
}

export class Asteroid {
  private mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private isActive: boolean = true;
  private type: AsteroidType;
  private properties: AsteroidProperties;
  private currentHp: number;

  constructor(startX: number, startY: number, type: AsteroidType) {
    this.type = type;
    this.properties = this.getAsteroidProperties(type);
    this.currentHp = this.properties.hp;

    this.position = new THREE.Vector3(startX, startY, 0);
    this.velocity = new THREE.Vector3(0, -this.properties.speed, 0); // Move downward

    this.mesh = this.createAsteroidMesh();
    this.updateMeshPosition();
  }

  /**
   * Get properties for each asteroid type (from GRD)
   */
  private getAsteroidProperties(type: AsteroidType): AsteroidProperties {
    switch (type) {
      case "small":
        return {
          hp: 2, // Increased from 1 to 2
          speed: 200, // Fast
          damageToShip: 10,
          points: 10,
          size: 15,
          color: 0x8b4513, // Brown
        };
      case "medium":
        return {
          hp: 4, // Increased from 2 to 4
          speed: 120, // Medium
          damageToShip: 25,
          points: 25,
          size: 25,
          color: 0x696969, // Gray
        };
      case "large":
        return {
          hp: 6, // Increased from 3 to 6
          speed: 80, // Slow
          damageToShip: 40,
          points: 50,
          size: 35,
          color: 0x2f4f4f, // Dark gray
        };
    }
  }

  /**
   * Create asteroid mesh using sprite texture
   */
  private createAsteroidMesh(): THREE.Mesh {
    // Create plane geometry for sprite
    const geometry = new THREE.PlaneGeometry(
      this.properties.size * 2,
      this.properties.size * 2
    );

    // Choose sprite based on asteroid type and add some variety
    const spriteOptions = this.getAsteroidSprites();
    const spriteIndex = Math.floor(Math.random() * spriteOptions.length);
    const spritePath = spriteOptions[spriteIndex];

    // Load asteroid sprite texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(spritePath);

    // Configure texture for pixel art
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    // Create material with sprite texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1, // Remove transparent pixels
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Get appropriate sprite paths for asteroid type
   */
  private getAsteroidSprites(): string[] {
    // Use all available meteor sprites for variety
    return [
      "/Sprites/Meteors/spaceMeteors_001.png",
      "/Sprites/Meteors/spaceMeteors_002.png",
      "/Sprites/Meteors/spaceMeteors_003.png",
      "/Sprites/Meteors/spaceMeteors_004.png",
    ];
  }

  /**
   * Update asteroid position and rotation
   */
  public update(deltaTime: number, worldBounds: any): void {
    if (!this.isActive) return;

    // Move asteroid downward
    this.position.add(
      new THREE.Vector3(
        this.velocity.x * deltaTime,
        this.velocity.y * deltaTime,
        0
      )
    );

    // Note: Removed rotation since these are 2D PNG sprites
    // 2D sprites look weird when rotated in 3D space

    // Deactivate if asteroid goes off-screen (bottom)
    if (this.position.y < worldBounds.bottom - 100) {
      this.isActive = false;
    }

    this.updateMeshPosition();
  }

  /**
   * Take damage and return true if destroyed
   */
  public takeDamage(damage: number): boolean {
    this.currentHp = Math.max(0, this.currentHp - damage);

    // Visual feedback - flash red when hit
    if (this.currentHp > 0) {
      this.flashDamage();
    }

    return this.currentHp <= 0;
  }

  /**
   * Flash red when taking damage
   */
  private flashDamage(): void {
    const originalColor = this.properties.color;
    (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Flash red

    // Reset color after short delay
    setTimeout(() => {
      if (this.isActive) {
        (this.mesh.material as THREE.MeshBasicMaterial).color.setHex(
          originalColor
        );
      }
    }, 100);
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
   * Get asteroid type
   */
  public getType(): AsteroidType {
    return this.type;
  }

  /**
   * Get points value
   */
  public getPoints(): number {
    return this.properties.points;
  }

  /**
   * Get damage to ship
   */
  public getDamageToShip(): number {
    return this.properties.damageToShip;
  }

  /**
   * Check if asteroid is still active
   */
  public isActiveAsteroid(): boolean {
    return this.isActive;
  }

  /**
   * Deactivate asteroid
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
   * Get bounding sphere for collision detection (more appropriate for asteroids)
   */
  public getBoundingSphere(): THREE.Sphere {
    return new THREE.Sphere(this.position, this.properties.size);
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
