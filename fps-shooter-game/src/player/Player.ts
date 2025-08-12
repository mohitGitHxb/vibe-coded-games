import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PlayerInput } from "./PlayerInput.js";
import { Weapon } from "./Weapon.js";
import { GAME_CONFIG } from "../utils/GameConfig.js";
import type { PlayerState } from "../types/GameTypes.js";

export class Player {
  public position: THREE.Vector3;
  public physicsBody!: CANNON.Body;
  private input: PlayerInput;
  private weapon: Weapon;
  private state: PlayerState;
  private isOnGround: boolean = false;
  private velocity: THREE.Vector3 = new THREE.Vector3();

  constructor() {
    this.position = new THREE.Vector3(0, GAME_CONFIG.PLAYER_HEIGHT, 0);
    this.input = new PlayerInput();
    this.weapon = new Weapon();

    this.state = {
      position: { x: 0, y: GAME_CONFIG.PLAYER_HEIGHT, z: 0 },
      rotation: { x: 0, y: 0 },
      health: GAME_CONFIG.PLAYER_HEALTH,
      ammo: GAME_CONFIG.WEAPON.MAGAZINE_SIZE,
      maxAmmo: GAME_CONFIG.WEAPON.MAGAZINE_SIZE,
      isReloading: false,
    };

    this.createPhysicsBody();
    this.setupGroundDetection();
  }

  private createPhysicsBody(): void {
    // Create a capsule-like shape for the player
    const radius = 0.4;
    const height = GAME_CONFIG.PLAYER_HEIGHT - radius;

    const shape = new CANNON.Cylinder(radius, radius, height, 8);

    this.physicsBody = new CANNON.Body({
      mass: 70, // Player mass in kg
      shape: shape,
      position: new CANNON.Vec3(0, GAME_CONFIG.PLAYER_HEIGHT / 2, 0),
      material: new CANNON.Material("player"),
    });

    // Prevent the player from rotating (stay upright)
    this.physicsBody.fixedRotation = true;
    this.physicsBody.updateMassProperties();
  }

  private setupGroundDetection(): void {
    this.physicsBody.addEventListener("collide", (event: any) => {
      const contact = event.contact;
      const other =
        event.target === this.physicsBody ? event.target : event.body;

      // Check if collision is with ground (contact normal pointing up)
      if (contact.ni.y > 0.5 || contact.ni.y < -0.5) {
        this.isOnGround = true;
      }
    });
  }

  public update(
    deltaTime: number,
    cameraRotation: { x: number; y: number },
    camera: THREE.Camera,
    scene: THREE.Scene
  ): void {
    this.updateMovement(deltaTime, cameraRotation);
    this.updateWeapon(camera, scene);
    this.updatePosition();
    this.updateState();

    // Reset ground detection for next frame
    this.isOnGround = false;
  }

  private updateMovement(
    deltaTime: number,
    cameraRotation: { x: number; y: number }
  ): void {
    const movementInput = this.input.getMovementVector();

    if (movementInput.x === 0 && movementInput.z === 0) {
      // Apply stronger friction when not moving for more responsive stop
      this.physicsBody.velocity.x *= 0.6;
      this.physicsBody.velocity.z *= 0.6;
      return;
    }

    // Calculate movement direction based on camera rotation
    const moveSpeed = GAME_CONFIG.PLAYER_SPEED * deltaTime;
    const yaw = cameraRotation.y;

    // Convert input to world space based on camera rotation
    const forward = new THREE.Vector3(
      Math.sin(yaw) * movementInput.z,
      0,
      Math.cos(yaw) * movementInput.z
    );

    const right = new THREE.Vector3(
      Math.cos(yaw) * movementInput.x,
      0,
      -Math.sin(yaw) * movementInput.x
    );

    const moveDirection = forward.add(right).normalize();

    // Apply stronger movement force for more responsive movement
    const force = new CANNON.Vec3(
      moveDirection.x * moveSpeed * 200, // Increased from 100 to 200
      0,
      moveDirection.z * moveSpeed * 200 // Increased from 100 to 200
    );

    this.physicsBody.force.x += force.x;
    this.physicsBody.force.z += force.z;

    // Increased maximum velocity for faster movement
    const maxVelocity = GAME_CONFIG.PLAYER_SPEED / 30; // Changed from 60 to 30 for higher max velocity
    const horizontalVel = Math.sqrt(
      this.physicsBody.velocity.x ** 2 + this.physicsBody.velocity.z ** 2
    );

    if (horizontalVel > maxVelocity) {
      const scale = maxVelocity / horizontalVel;
      this.physicsBody.velocity.x *= scale;
      this.physicsBody.velocity.z *= scale;
    }

    // Handle jumping
    if (this.input.isJumping() && this.isOnGround) {
      this.physicsBody.velocity.y = 8; // Jump velocity
    }
  }

  private updateWeapon(camera: THREE.Camera, scene: THREE.Scene): void {
    this.weapon.update();

    // Handle reloading
    if (this.input.isReloading()) {
      this.weapon.startReload();
    }
  }

  public setWeaponModel(weaponModel: THREE.Group, camera: THREE.Camera): void {
    console.log("🔫 Player: Attaching weapon model:", weaponModel);
    console.log("📷 Camera position:", camera.position);
    console.log("📷 Camera children before:", camera.children.length);

    // Set weapon model in weapon class first
    this.weapon.setWeaponModel(weaponModel);

    // Get the configured weapon model
    const configuredWeapon = this.weapon.getWeaponModel();

    if (configuredWeapon) {
      console.log("✅ Got configured weapon from weapon class");

      // Make sure weapon is visible
      configuredWeapon.visible = true;
      configuredWeapon.traverse((child) => {
        child.visible = true;
        if (child instanceof THREE.Mesh) {
          child.frustumCulled = false; // Prevent culling when very close to camera
          console.log(
            `🔧 Mesh: ${child.name || "unnamed"} - visible: ${child.visible}`
          );
        }
      });

      // Clear any existing weapons from camera
      const existingWeapons = camera.children.filter(
        (child) =>
          child.name.includes("weapon") ||
          child.name.includes("Assault") ||
          child.name.includes("placeholder")
      );
      existingWeapons.forEach((weapon) => camera.remove(weapon));

      // Add to camera
      camera.add(configuredWeapon);
      console.log("✅ Weapon attached to camera");
      console.log("📷 Camera children after:", camera.children.length);

      // Debug: Check if weapon is in camera hierarchy
      camera.traverse((child) => {
        if (child === configuredWeapon) {
          console.log("✅ Weapon confirmed in camera hierarchy");
          console.log(
            "🎯 Weapon world position:",
            child.getWorldPosition(new THREE.Vector3())
          );
        }
      });

      // Force render update
      configuredWeapon.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
    } else {
      console.error(
        "❌ Failed to get configured weapon model from weapon class"
      );

      // Create emergency fallback weapon
      const fallbackGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.8);
      const fallbackMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
      });
      const fallbackWeapon = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
      fallbackWeapon.position.set(0.3, -0.2, -0.8);
      fallbackWeapon.name = "fallback-weapon";
      camera.add(fallbackWeapon);
      console.log("🚨 Added emergency fallback weapon");
    }
  }

  private updatePosition(): void {
    this.position.copy(this.physicsBody.position as any);

    // Ensure player doesn't fall below ground
    if (this.position.y < GAME_CONFIG.PLAYER_HEIGHT / 2) {
      this.position.y = GAME_CONFIG.PLAYER_HEIGHT / 2;
      this.physicsBody.position.y = GAME_CONFIG.PLAYER_HEIGHT / 2;
    }
  }

  private updateState(): void {
    this.state.position = {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
    };

    this.state.ammo = this.weapon.getCurrentAmmo();
    this.state.maxAmmo = this.weapon.getMaxAmmo();
    this.state.isReloading = this.weapon.isCurrentlyReloading();
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getState(): PlayerState {
    return { ...this.state };
  }

  public getInput(): PlayerInput {
    return this.input;
  }

  public getWeapon(): Weapon {
    return this.weapon;
  }

  public takeDamage(amount: number): void {
    this.state.health = Math.max(0, this.state.health - amount);
  }

  public heal(amount: number): void {
    this.state.health = Math.min(
      GAME_CONFIG.PLAYER_HEALTH,
      this.state.health + amount
    );
  }

  public isDead(): boolean {
    return this.state.health <= 0;
  }
}
