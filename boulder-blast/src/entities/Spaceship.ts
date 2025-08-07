/**
 * Spaceship - Player's spaceship entity
 * Handles movement, shooting, and health management
 */

import * as THREE from "three";

export class Spaceship {
  private mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private hp: number = 100;
  private maxHp: number = 100;

  // Movement properties
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private moveSpeed: number = 400; // pixels per second

  // Shooting properties
  private fireRate: number = 10; // shots per second (600 RPM)
  private defaultFireRate: number = 10; // Store original fire rate
  private lastShotTime: number = 0;
  private shotInterval: number = 1000 / this.fireRate; // ms between shots

  // Power-up properties
  private hasShield: boolean = false;
  private shieldHp: number = 0;
  private damageMultiplier: number = 1.0; // Damage boost multiplier

  constructor(worldBounds: { left: number; right: number; bottom: number }) {
    this.position = new THREE.Vector3(0, worldBounds.bottom + 60, 0);
    this.mesh = this.createSpaceshipMesh();
    this.updateMeshPosition();
  }

  /**
   * Create spaceship mesh using sprite texture
   */
  private createSpaceshipMesh(): THREE.Mesh {
    // Create plane geometry for sprite
    const geometry = new THREE.PlaneGeometry(60, 60); // Adjust size as needed

    // Load spaceship sprite texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/Sprites/Ships/spaceShips_001.png");

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
   * Update spaceship position based on velocity
   */
  public update(
    deltaTime: number,
    worldBounds: { left: number; right: number }
  ): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;

    // Clamp position within world bounds (with spaceship half-width padding)
    const padding = 30; // Half the spaceship width
    this.position.x = Math.max(
      worldBounds.left + padding,
      Math.min(worldBounds.right - padding, this.position.x)
    );

    // Update mesh position
    this.updateMeshPosition();

    // Reset velocity (input will set it each frame)
    this.velocity.set(0, 0, 0);
  }

  /**
   * Move spaceship left
   */
  public moveLeft(): void {
    this.velocity.x = -this.moveSpeed;
  }

  /**
   * Move spaceship right
   */
  public moveRight(): void {
    this.velocity.x = this.moveSpeed;
  }

  /**
   * Check if spaceship can shoot based on fire rate
   */
  public canShoot(): boolean {
    const currentTime = performance.now();
    return currentTime - this.lastShotTime >= this.shotInterval;
  }

  /**
   * Register a shot (updates last shot time)
   */
  public shoot(): void {
    this.lastShotTime = performance.now();
  }

  /**
   * Take damage and return true if destroyed
   * Shield absorbs damage first if active
   */
  public takeDamage(damage: number): boolean {
    if (this.hasShield && this.shieldHp > 0) {
      // Shield absorbs damage first
      const shieldDamage = Math.min(damage, this.shieldHp);
      this.shieldHp -= shieldDamage;
      damage -= shieldDamage;

      if (this.shieldHp <= 0) {
        this.hasShield = false;
        console.log("🛡️ Shield depleted!");
      }
    }

    // Apply remaining damage to HP
    if (damage > 0) {
      this.hp = Math.max(0, this.hp - damage);
    }

    return this.hp <= 0;
  }

  /**
   * Heal spaceship
   */
  public heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * Activate shield power-up
   */
  public activateShield(shieldHp: number): void {
    this.hasShield = true;
    this.shieldHp = shieldHp;
    console.log(`🛡️ Shield activated with ${shieldHp} HP!`);
  }

  /**
   * Activate rapid fire power-up
   */
  public activateRapidFire(multiplier: number = 2): void {
    this.fireRate = this.defaultFireRate * multiplier;
    this.shotInterval = 1000 / this.fireRate;
    console.log(
      `🔥 Rapid fire activated! Fire rate: ${this.fireRate} shots/sec`
    );
  }

  /**
   * Deactivate rapid fire power-up
   */
  public deactivateRapidFire(): void {
    this.fireRate = this.defaultFireRate;
    this.shotInterval = 1000 / this.fireRate;
    console.log("🔥 Rapid fire deactivated");
  }

  /**
   * Activate damage boost power-up
   */
  public activateDamageBoost(multiplier: number = 2): void {
    this.damageMultiplier = multiplier;
    console.log(`⚡ Damage boost activated! Damage multiplier: ${multiplier}x`);
  }

  /**
   * Deactivate damage boost power-up
   */
  public deactivateDamageBoost(): void {
    this.damageMultiplier = 1.0;
    console.log("⚡ Damage boost deactivated");
  }

  /**
   * Update mesh position to match logical position
   */
  private updateMeshPosition(): void {
    this.mesh.position.copy(this.position);
  }

  /**
   * Get current position
   */
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get mesh for rendering
   */
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Get current HP
   */
  public getHP(): number {
    return this.hp;
  }

  /**
   * Set current HP (used for healing power-ups)
   */
  public setHP(newHP: number): void {
    this.hp = Math.max(0, Math.min(newHP, this.maxHp)); // Clamp between 0 and maxHP
  }

  /**
   * Get max HP
   */
  public getMaxHP(): number {
    return this.maxHp;
  }

  /**
   * Get damage multiplier for projectiles
   */
  public getDamageMultiplier(): number {
    return this.damageMultiplier;
  }

  /**
   * Check if shield is active
   */
  public hasActiveShield(): boolean {
    return this.hasShield && this.shieldHp > 0;
  }

  /**
   * Get shield HP
   */
  public getShieldHP(): number {
    return this.shieldHp;
  }

  /**
   * Get spaceship bounds for collision detection
   */
  public getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: 50, // Approximate spaceship width
      height: 50, // Approximate spaceship height
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
