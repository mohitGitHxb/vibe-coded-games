import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GameEntity, Damageable } from "../types";
import { GAME_CONFIG, COLORS } from "../utils/Constants";

export class Player implements GameEntity, Damageable {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public health: number;
  public maxHealth: number;
  public collisionRadius: number;

  private lastShotTime: number = 0;
  private lastDamageTime: number = 0;
  private healthRegenDelay: number = 3000; // 3 seconds
  private healthRegenRate: number = 2; // HP per second
  private isRegenerating: boolean = false;
  private modelLoaded: boolean = false;
  private weaponLoaded: boolean = false;
  private loader: GLTFLoader;

  // Weapon system
  private weaponMesh: THREE.Group;
  private muzzlePoint: THREE.Vector3;
  private muzzleFlash: THREE.PointLight | null = null;
  private muzzleFlashMesh: THREE.Mesh | null = null;

  constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    this.position = position.clone();
    this.health = GAME_CONFIG.PLAYER.HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER.HEALTH;
    this.collisionRadius = GAME_CONFIG.PLAYER.COLLISION_RADIUS;
    this.mesh = new THREE.Group();
    this.loader = new GLTFLoader();
    this.muzzlePoint = new THREE.Vector3();

    // Create fallback first, then try to load model
    this.createFallbackMesh();
    this.loadModel();
    this.loadWeapon(); // Load weapon separately
  }

  private async loadModel(): Promise<void> {
    const modelPaths = [
      "/character-h.glb",
      "/models/character-h.glb",
      "/assets/character-h.glb",
      "./character-h.glb",
    ];

    for (const path of modelPaths) {
      try {
        console.log(`Attempting to load player model from: ${path}`);
        const gltf = await this.loader.loadAsync(path);

        if (gltf && gltf.scene) {
          await this.setupModel(gltf.scene);
          console.log(`Successfully loaded player model from: ${path}`);
          return;
        }
      } catch (error) {
        console.warn(`Failed to load player model from ${path}:`, error);
        continue;
      }
    }

    console.warn("All player model paths failed, using fallback mesh");
  }

  private async loadWeapon(): Promise<void> {
    const weaponPaths = [
      "/blaster-d.glb",
      "/models/blaster-d.glb",
      "/assets/blaster-d.glb",
      "./blaster-d.glb",
    ];

    for (const path of weaponPaths) {
      try {
        console.log(`Attempting to load weapon model from: ${path}`);
        const gltf = await this.loader.loadAsync(path);

        if (gltf && gltf.scene) {
          await this.setupWeaponModel(gltf.scene);
          console.log(`Successfully loaded weapon model from: ${path}`);
          return;
        }
      } catch (error) {
        console.warn(`Failed to load weapon model from ${path}:`, error);
        continue;
      }
    }

    console.warn("All weapon model paths failed, creating fallback weapon");
    this.createFallbackWeapon();
  }

  private async setupModel(model: THREE.Group): Promise<void> {
    // Remove fallback if model loads successfully
    if (this.mesh.children.length > 0 && !this.modelLoaded) {
      // Remove only the player model, keep weapon
      const playerModel = this.mesh.children.find(
        (child) => child !== this.weaponMesh
      );
      if (playerModel) {
        this.mesh.remove(playerModel);
      }
    }

    // Clone the model to avoid issues with multiple instances
    const playerModel = model.clone();

    // Scale and position the model
    playerModel.scale.setScalar(50);
    playerModel.position.set(0, 25, 0);

    // Setup materials and shadows
    playerModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;

        // Ensure materials exist
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (
                mat instanceof THREE.MeshStandardMaterial ||
                mat instanceof THREE.MeshLambertMaterial
              ) {
                mat.needsUpdate = true;
              }
            });
          } else if (
            child.material instanceof THREE.MeshStandardMaterial ||
            child.material instanceof THREE.MeshLambertMaterial
          ) {
            child.material.needsUpdate = true;
          }
        }
      }
    });

    this.mesh.add(playerModel);
    this.mesh.position.copy(this.position);
    this.modelLoaded = true;
  }

  private async setupWeaponModel(weaponModel: THREE.Group): Promise<void> {
    // Remove fallback weapon if it exists
    if (this.weaponMesh && !this.weaponLoaded) {
      this.mesh.remove(this.weaponMesh);
    }

    // Create new weapon group
    this.weaponMesh = new THREE.Group();

    // Clone the weapon model
    const blaster = weaponModel.clone();

    // Scale and position the weapon model
    // Adjust these values based on your blaster-d.glb model size
    blaster.scale.setScalar(20); // Adjust scale as needed
    blaster.position.set(0, 0, 0); // Adjust position relative to weapon group

    // Setup materials and shadows for weapon
    blaster.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (
                mat instanceof THREE.MeshStandardMaterial ||
                mat instanceof THREE.MeshLambertMaterial
              ) {
                mat.needsUpdate = true;
              }
            });
          } else if (
            child.material instanceof THREE.MeshStandardMaterial ||
            child.material instanceof THREE.MeshLambertMaterial
          ) {
            child.material.needsUpdate = true;
          }
        }
      }
    });

    this.weaponMesh.add(blaster);

    // Position weapon relative to player
    this.weaponMesh.position.set(8, 20, -2);
    this.weaponMesh.rotation.y = 0;

    // Add weapon to player mesh
    this.mesh.add(this.weaponMesh);

    // Create muzzle flash effect
    this.createMuzzleFlash();

    this.weaponLoaded = true;
    console.log("Successfully loaded blaster-d.glb weapon model");
  }

  private createFallbackMesh(): void {
    // Clear existing mesh
    this.mesh.clear();

    // Create a more detailed fallback player
    const playerGroup = new THREE.Group();

    // Body (cone)
    const bodyGeometry = new THREE.ConeGeometry(15, 30, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: COLORS.PLAYER_FALLBACK,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 15;
    body.castShadow = true;
    playerGroup.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(8, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({
      color: 0xffdbac, // Skin color
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 35;
    head.castShadow = true;
    playerGroup.add(head);

    this.mesh.add(playerGroup);
    this.mesh.position.copy(this.position);

    console.log("Created fallback player mesh");
  }

  private createFallbackWeapon(): void {
    // Create weapon group
    this.weaponMesh = new THREE.Group();

    // Main weapon body (rifle) - fallback if GLB fails
    const weaponBodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 25, 8);
    const weaponBodyMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333,
    });
    const weaponBody = new THREE.Mesh(weaponBodyGeometry, weaponBodyMaterial);
    weaponBody.rotation.z = Math.PI / 2; // Rotate to horizontal
    weaponBody.position.set(12, 0, 0);
    weaponBody.castShadow = true;
    this.weaponMesh.add(weaponBody);

    // Weapon stock
    const stockGeometry = new THREE.BoxGeometry(8, 3, 3);
    const stockMaterial = new THREE.MeshLambertMaterial({
      color: 0x654321, // Brown wood color
    });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.set(-5, 0, 0);
    stock.castShadow = true;
    this.weaponMesh.add(stock);

    // Weapon grip
    const gripGeometry = new THREE.CylinderGeometry(1, 1.5, 6, 6);
    const gripMaterial = new THREE.MeshLambertMaterial({
      color: 0x444444,
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.position.set(0, -3, 0);
    grip.castShadow = true;
    this.weaponMesh.add(grip);

    // Weapon barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.8, 1.2, 15, 8);
    const barrelMaterial = new THREE.MeshLambertMaterial({
      color: 0x222222,
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(20, 0, 0);
    barrel.castShadow = true;
    this.weaponMesh.add(barrel);

    // Muzzle brake
    const muzzleGeometry = new THREE.CylinderGeometry(1.2, 1.0, 3, 8);
    const muzzleMaterial = new THREE.MeshLambertMaterial({
      color: 0x111111,
    });
    const muzzle = new THREE.Mesh(muzzleGeometry, muzzleMaterial);
    muzzle.rotation.z = Math.PI / 2;
    muzzle.position.set(28, 0, 0);
    muzzle.castShadow = true;
    this.weaponMesh.add(muzzle);

    // Position weapon relative to player
    this.weaponMesh.position.set(8, 20, -2);
    this.weaponMesh.rotation.y = 0;

    // Add weapon to player mesh
    this.mesh.add(this.weaponMesh);

    // Create muzzle flash effect (initially hidden)
    this.createMuzzleFlash();

    console.log("Created fallback weapon system");
  }

  private createMuzzleFlash(): void {
    if (!this.weaponMesh) return;

    // Muzzle flash light
    this.muzzleFlash = new THREE.PointLight(0xffaa00, 0, 50, 2);
    this.muzzleFlash.visible = false;
    this.weaponMesh.add(this.muzzleFlash);

    // Muzzle flash visual effect
    const flashGeometry = new THREE.SphereGeometry(3, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8,
    });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeometry, flashMaterial);
    this.muzzleFlashMesh.visible = false;
    this.weaponMesh.add(this.muzzleFlashMesh);

    // Position both at weapon muzzle
    // Adjust muzzle position based on your blaster-d.glb model
    const muzzleOffset = this.weaponLoaded
      ? new THREE.Vector3(15, 2, 0) // Adjust for GLB model
      : new THREE.Vector3(30, 0, 0); // Fallback position

    this.muzzleFlash.position.copy(muzzleOffset);
    this.muzzleFlashMesh.position.copy(muzzleOffset);
  }

  private showMuzzleFlash(): void {
    if (!this.muzzleFlash || !this.muzzleFlashMesh) return;

    // Show flash effect
    this.muzzleFlash.visible = true;
    this.muzzleFlash.intensity = 2;
    this.muzzleFlashMesh.visible = true;

    // Random flash scale for variety
    const scale = 0.5 + Math.random() * 0.5;
    this.muzzleFlashMesh.scale.setScalar(scale);

    // Hide after short duration
    setTimeout(() => {
      if (this.muzzleFlash && this.muzzleFlashMesh) {
        this.muzzleFlash.visible = false;
        this.muzzleFlashMesh.visible = false;
      }
    }, 50); // 50ms flash duration
  }

  getMuzzleWorldPosition(): THREE.Vector3 {
    if (!this.weaponMesh) return this.position.clone();

    // Get muzzle position in world coordinates
    // Adjust based on whether we're using GLB model or fallback
    const muzzleLocalPos = this.weaponLoaded
      ? new THREE.Vector3(15, 2, 0) // Adjust for your blaster-d.glb
      : new THREE.Vector3(30, 0, 0); // Fallback position

    const muzzleWorldPos = new THREE.Vector3();

    // Transform local muzzle position to world position
    this.weaponMesh.localToWorld(muzzleWorldPos.copy(muzzleLocalPos));

    return muzzleWorldPos;
  }

  getShootDirection(): THREE.Vector3 {
    // Get shooting direction based on player rotation
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
    return direction;
  }

  isWeaponLoaded(): boolean {
    return this.weaponLoaded;
  }

  // ... rest of the methods remain the same ...

  update(deltaTime: number): void {
    this.updateHealthRegeneration(deltaTime);
  }

  private updateHealthRegeneration(deltaTime: number): void {
    const currentTime = Date.now();
    const timeSinceLastDamage = currentTime - this.lastDamageTime;

    if (
      timeSinceLastDamage >= this.healthRegenDelay &&
      this.health < this.maxHealth
    ) {
      if (!this.isRegenerating) {
        this.isRegenerating = true;
        console.log("Health regeneration started");
      }

      const regenAmount = this.healthRegenRate * deltaTime;
      this.health = Math.min(this.maxHealth, this.health + regenAmount);
    } else if (this.isRegenerating && this.health >= this.maxHealth) {
      this.isRegenerating = false;
      console.log("Health fully regenerated");
    }
  }

  move(direction: THREE.Vector3, deltaTime: number): void {
    if (direction.length() === 0) return;

    direction.normalize();
    const movement = direction.multiplyScalar(
      GAME_CONFIG.PLAYER.SPEED * deltaTime
    );
    const newPosition = this.position.clone().add(movement);

    newPosition.x = Math.max(
      -GAME_CONFIG.ARENA.WIDTH / 2 + 30,
      Math.min(GAME_CONFIG.ARENA.WIDTH / 2 - 30, newPosition.x)
    );
    newPosition.z = Math.max(
      -GAME_CONFIG.ARENA.HEIGHT / 2 + 30,
      Math.min(GAME_CONFIG.ARENA.HEIGHT / 2 - 30, newPosition.z)
    );

    this.position.copy(newPosition);
    this.mesh.position.copy(this.position);
  }

  aimAt(targetPosition: THREE.Vector3): void {
    const direction = targetPosition.clone().sub(this.position);
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;
  }

  canShoot(): boolean {
    const currentTime = Date.now();
    const fireInterval = 1000 / GAME_CONFIG.WEAPONS.ASSAULT_RIFLE.FIRE_RATE;
    return currentTime - this.lastShotTime >= fireInterval;
  }

  recordShot(): void {
    this.lastShotTime = Date.now();
    this.showMuzzleFlash();
  }

  takeDamage(damage: number): boolean {
    this.health = Math.max(0, this.health - damage);
    this.lastDamageTime = Date.now();
    this.isRegenerating = false;

    console.log(
      `Player took ${damage} damage. Health: ${this.health}/${this.maxHealth}`
    );
    return this.health <= 0;
  }

  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }

  isHealthRegenerating(): boolean {
    return this.isRegenerating;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
