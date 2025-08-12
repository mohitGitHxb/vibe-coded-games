import * as THREE from "three";
import { GAME_CONFIG } from "../utils/GameConfig.js";
import type { WeaponConfig } from "../types/GameTypes.js";

export class Weapon {
  private config: WeaponConfig;
  private lastFireTime: number = 0;
  private currentAmmo: number;
  private isReloading: boolean = false;
  private reloadStartTime: number = 0;
  private weaponModel: THREE.Group | null = null;
  private muzzleFlash: THREE.PointLight | null = null;
  private muzzleFlashMesh: THREE.Mesh | null = null;

  constructor() {
    this.config = {
      damage: GAME_CONFIG.WEAPON.DAMAGE,
      fireRate: 60000 / GAME_CONFIG.WEAPON.FIRE_RATE, // Convert RPM to ms between shots
      magazineSize: GAME_CONFIG.WEAPON.MAGAZINE_SIZE,
      reloadTime: GAME_CONFIG.WEAPON.RELOAD_TIME,
      accuracy: GAME_CONFIG.WEAPON.ACCURACY_STANDING,
    };

    this.currentAmmo = this.config.magazineSize;
    this.createMuzzleFlash();
  }

  private createMuzzleFlash(): void {
    // Create muzzle flash light
    this.muzzleFlash = new THREE.PointLight(0xffaa00, 0, 5);
    this.muzzleFlash.visible = false;

    // Create muzzle flash visual effect
    const flashGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.8,
    });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeometry, flashMaterial);
    this.muzzleFlashMesh.visible = false;
  }

  public setWeaponModel(model: THREE.Group): void {
    console.log("🔫 Setting weapon model:", model);

    // Remove old weapon if exists
    if (this.weaponModel && this.weaponModel.parent) {
      this.weaponModel.parent.remove(this.weaponModel);
    }

    this.weaponModel = model.clone();

    // Debug: Log model structure
    console.log("🔫 Weapon model children:", this.weaponModel.children.length);
    let childIndex = 0;
    this.weaponModel.traverse((child) => {
      console.log(
        `Child ${childIndex}:`,
        child.name || child.type,
        child instanceof THREE.Mesh ? "MESH" : "GROUP"
      );
      if (child instanceof THREE.Mesh) {
        console.log(`  - Geometry:`, child.geometry.type);
        console.log(`  - Material:`, child.material);
        console.log(`  - Visible:`, child.visible);
      }
      childIndex++;
    });

    // Calculate model bounds
    const box = new THREE.Box3().setFromObject(this.weaponModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log("🔫 Model size:", size);
    console.log("🔫 Model center:", center);

    // Fix all materials and make everything visible
    this.fixWeaponVisibility();

    // Position weapon for first-person view
    this.positionWeaponForFPS(size, center);

    // Add muzzle flash effects
    this.attachMuzzleFlash();

    console.log("🔫 Final weapon position:", this.weaponModel.position);
    console.log("🔫 Final weapon rotation:", this.weaponModel.rotation);
    console.log("🔫 Final weapon scale:", this.weaponModel.scale);
  }

  private fixWeaponVisibility(): void {
    if (!this.weaponModel) return;

    console.log("🔧 Fixing weapon visibility...");

    this.weaponModel.visible = true;
    this.weaponModel.traverse((child) => {
      child.visible = true;

      if (child instanceof THREE.Mesh) {
        console.log(`🔧 Processing mesh: ${child.name || "unnamed"}`);

        // Fix geometry
        if (!child.geometry) {
          console.warn("⚠️ Mesh missing geometry, creating default");
          child.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        }

        // Fix material
        if (!child.material) {
          console.warn("⚠️ Mesh missing material, creating default");
          child.material = new THREE.MeshLambertMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
          });
        } else {
          this.enhanceMaterial(child.material);
        }

        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent culling when close to camera

        console.log(`✅ Fixed mesh: ${child.name}`, child.material);
      }
    });
  }

  private enhanceMaterial(material: THREE.Material | THREE.Material[]): void {
    const materials = Array.isArray(material) ? material : [material];

    materials.forEach((mat) => {
      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshLambertMaterial ||
        mat instanceof THREE.MeshPhongMaterial ||
        mat instanceof THREE.MeshBasicMaterial
      ) {
        // Make material visible and bright
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.side = THREE.DoubleSide;
        mat.visible = true;

        // Brighten dark materials
        if ("color" in mat) {
          const color = mat.color.getHex();
          if (color < 0x333333) {
            mat.color.setHex(0x666666);
            console.log(
              "🎨 Brightened dark material to:",
              mat.color.getHex().toString(16)
            );
          }
        }

        // Add slight emission for visibility
        if ("emissive" in mat) {
          mat.emissive = new THREE.Color(0x111111);
        }

        // Disable alpha test that might hide geometry
        mat.alphaTest = 0;

        mat.needsUpdate = true;
      }
    });
  }

  private positionWeaponForFPS(
    size: THREE.Vector3,
    center: THREE.Vector3
  ): void {
    if (!this.weaponModel) return;

    console.log("🎯 Positioning weapon for first-person view");
    console.log("📐 Original size:", size);
    console.log("📐 Original center:", center);

    // Reset transform
    this.weaponModel.position.set(0, 0, 0);
    this.weaponModel.rotation.set(0, 0, 0);
    this.weaponModel.scale.set(1, 1, 1);

    // Center the model
    this.weaponModel.position.sub(center);

    // Scale appropriately for FPS view - assault rifles are typically long
    const maxSize = Math.max(size.x, size.y, size.z);
    let scale = 0.6; // Start with smaller scale for better FPS view
    if (maxSize > 3) {
      scale = 1.2 / maxSize; // Scale down very large models
    } else if (maxSize < 0.3) {
      scale = 0.3 / maxSize; // Scale up very tiny models
    }

    console.log(`🔍 Model max size: ${maxSize}, applying scale: ${scale}`);
    this.weaponModel.scale.setScalar(scale);

    // Position for right-handed weapon hold - adjusted for assault rifle
    this.weaponModel.position.set(
      0.35, // Right side (X) - moved slightly further right
      -0.3, // Down from center (Y) - moved down more
      -0.9 // Forward from camera (Z) - moved closer to camera
    );

    // Try multiple rotations to find the correct orientation for assault rifle
    // Common orientations for GLTF assault rifle models:
    const rotationOptions = [
      { x: 0, y: 0, z: 0 }, // No rotation (original)
      { x: 0, y: Math.PI, z: 0 }, // 180° Y rotation (turn around)
      { x: 0, y: Math.PI / 2, z: 0 }, // 90° Y rotation (turn right)
      { x: 0, y: -Math.PI / 2, z: 0 }, // -90° Y rotation (turn left)
      { x: Math.PI / 2, y: 0, z: 0 }, // 90° X rotation (pitch up)
      { x: -Math.PI / 2, y: 0, z: 0 }, // -90° X rotation (pitch down)
      { x: 0, y: Math.PI, z: Math.PI }, // 180° Y and Z rotation
    ];

    // Try different rotation - you can change this index (0-6) to test different orientations
    const selectedRotation = rotationOptions[1]; // Start with 180° Y rotation
    this.weaponModel.rotation.set(
      selectedRotation.x,
      selectedRotation.y,
      selectedRotation.z
    );

    console.log("🎯 Weapon positioned at:", this.weaponModel.position);
    console.log("🔄 Weapon rotation:", this.weaponModel.rotation);
    console.log("📏 Weapon scale:", this.weaponModel.scale);
  }

  private attachMuzzleFlash(): void {
    if (!this.weaponModel || !this.muzzleFlash || !this.muzzleFlashMesh) return;

    // Try to find the barrel end or use a reasonable position
    let muzzlePosition = new THREE.Vector3(0, 0, 0.5); // Default forward position

    // Look for a specific named object that might be the barrel
    this.weaponModel.traverse((child) => {
      if (
        child.name.toLowerCase().includes("barrel") ||
        child.name.toLowerCase().includes("muzzle") ||
        child.name.toLowerCase().includes("tip")
      ) {
        muzzlePosition.copy(child.position);
        console.log("🔫 Found muzzle point:", child.name, muzzlePosition);
      }
    });

    this.muzzleFlash.position.copy(muzzlePosition);
    this.muzzleFlashMesh.position.copy(muzzlePosition);

    this.weaponModel.add(this.muzzleFlash);
    this.weaponModel.add(this.muzzleFlashMesh);

    console.log("💥 Muzzle flash attached at:", muzzlePosition);
  }

  public canFire(): boolean {
    const now = Date.now();
    return (
      !this.isReloading &&
      this.currentAmmo > 0 &&
      now - this.lastFireTime >= this.config.fireRate
    );
  }

  public fire(
    camera: THREE.Camera,
    scene: THREE.Scene,
    isMoving: boolean = false
  ): THREE.Ray | null {
    if (!this.canFire()) return null;

    // Update fire time and ammo
    this.lastFireTime = Date.now();
    this.currentAmmo--;

    // Calculate accuracy based on movement
    const accuracy = isMoving
      ? GAME_CONFIG.WEAPON.ACCURACY_MOVING
      : GAME_CONFIG.WEAPON.ACCURACY_STANDING;

    // Create bullet ray with spread
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Apply weapon spread
    if (accuracy < 1.0) {
      const spread = (1.0 - accuracy) * 0.1;
      direction.x += (Math.random() - 0.5) * spread;
      direction.y += (Math.random() - 0.5) * spread;
      direction.z += (Math.random() - 0.5) * spread;
      direction.normalize();
    }

    const ray = new THREE.Ray(camera.position.clone(), direction);

    // Show muzzle flash
    this.showMuzzleFlash();

    // Create bullet tracer effect
    this.createBulletTracer(ray, scene);

    console.log("🔫 Weapon fired! Ammo remaining:", this.currentAmmo);

    return ray;
  }

  private showMuzzleFlash(): void {
    if (this.muzzleFlash && this.muzzleFlashMesh) {
      this.muzzleFlash.visible = true;
      this.muzzleFlash.intensity = 2;
      this.muzzleFlashMesh.visible = true;

      // Hide muzzle flash after short duration
      setTimeout(() => {
        if (this.muzzleFlash && this.muzzleFlashMesh) {
          this.muzzleFlash.visible = false;
          this.muzzleFlashMesh.visible = false;
        }
      }, 50);
    }
  }

  private createBulletTracer(ray: THREE.Ray, scene: THREE.Scene): void {
    const tracerGeometry = new THREE.BufferGeometry();
    const tracerMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8,
    });

    const startPoint = ray.origin.clone();
    const endPoint = ray.origin
      .clone()
      .add(ray.direction.clone().multiplyScalar(50));

    const points = [startPoint, endPoint];
    tracerGeometry.setFromPoints(points);

    const tracerLine = new THREE.Line(tracerGeometry, tracerMaterial);
    scene.add(tracerLine);

    // Remove tracer after short duration
    setTimeout(() => {
      scene.remove(tracerLine);
      tracerGeometry.dispose();
      tracerMaterial.dispose();
    }, 150);
  }

  public needsReload(): boolean {
    return this.currentAmmo < this.config.magazineSize && !this.isReloading;
  }

  public startReload(): boolean {
    if (this.isReloading || this.currentAmmo === this.config.magazineSize) {
      return false;
    }

    this.isReloading = true;
    this.reloadStartTime = Date.now();
    console.log("🔄 Reloading weapon...");
    return true;
  }

  public update(): void {
    // Check if reload is complete
    if (this.isReloading) {
      const now = Date.now();
      if (now - this.reloadStartTime >= this.config.reloadTime) {
        this.currentAmmo = this.config.magazineSize;
        this.isReloading = false;
        console.log("✅ Reload complete! Ammo:", this.currentAmmo);
      }
    }
  }

  public getCurrentAmmo(): number {
    return this.currentAmmo;
  }

  public getMaxAmmo(): number {
    return this.config.magazineSize;
  }

  public isCurrentlyReloading(): boolean {
    return this.isReloading;
  }

  public getReloadProgress(): number {
    if (!this.isReloading) return 1;
    const elapsed = Date.now() - this.reloadStartTime;
    return Math.min(elapsed / this.config.reloadTime, 1);
  }

  public getWeaponModel(): THREE.Group | null {
    return this.weaponModel;
  }

  // Helper method to quickly test different weapon orientations
  // Call this from console: weapon.testWeaponOrientation(0-12)
  public testWeaponOrientation(rotationIndex: number): void {
    if (!this.weaponModel) {
      console.log("❌ No weapon model loaded");
      return;
    }

    const rotationOptions = [
      { x: 0, y: 0, z: 0, name: "No rotation (original)" },
      { x: 0, y: Math.PI, z: 0, name: "180° Y rotation (turn around)" },
      { x: 0, y: Math.PI / 2, z: 0, name: "90° Y rotation (turn right)" },
      { x: 0, y: -Math.PI / 2, z: 0, name: "-90° Y rotation (turn left)" },
      { x: Math.PI / 2, y: 0, z: 0, name: "90° X rotation (pitch up)" },
      { x: -Math.PI / 2, y: 0, z: 0, name: "-90° X rotation (pitch down)" },
      { x: 0, y: Math.PI, z: Math.PI, name: "180° Y and Z rotation" },
      { x: 0, y: 0, z: Math.PI / 2, name: "90° Z rotation (roll right)" },
      { x: 0, y: 0, z: -Math.PI / 2, name: "-90° Z rotation (roll left)" },
      { x: Math.PI / 4, y: Math.PI / 4, z: 0, name: "45° X and Y (diagonal up-right)" },
      { x: -Math.PI / 4, y: Math.PI / 4, z: 0, name: "-45° X, 45° Y (diagonal down-right)" },
      { x: 0, y: Math.PI / 4, z: Math.PI / 4, name: "45° Y and Z (turn and roll)" },
      { x: Math.PI / 6, y: Math.PI, z: 0, name: "30° X, 180° Y (slight tilt, turn around)" },
    ];

    if (rotationIndex < 0 || rotationIndex >= rotationOptions.length) {
      console.log(
        `❌ Invalid rotation index. Use 0-${rotationOptions.length - 1}`
      );
      console.log("Available rotations:");
      rotationOptions.forEach((rot, i) => {
        console.log(`${i}: ${rot.name}`);
      });
      return;
    }

    const selectedRotation = rotationOptions[rotationIndex];
    this.weaponModel.rotation.set(
      selectedRotation.x,
      selectedRotation.y,
      selectedRotation.z
    );

    console.log(
      `🔄 Applied rotation ${rotationIndex}: ${selectedRotation.name}`
    );
    console.log("🔄 New rotation:", this.weaponModel.rotation);
  }

  // Fine-tune weapon position with small increments
  public adjustWeaponPosition(axis: 'x' | 'y' | 'z', increment: number): void {
    if (!this.weaponModel) {
      console.log("❌ No weapon model loaded");
      return;
    }

    this.weaponModel.position[axis] += increment;
    console.log(`🔧 Adjusted ${axis} by ${increment}, new position:`, this.weaponModel.position);
  }

  // Fine-tune weapon rotation with small increments
  public adjustWeaponRotation(axis: 'x' | 'y' | 'z', increment: number): void {
    if (!this.weaponModel) {
      console.log("❌ No weapon model loaded");
      return;
    }

    this.weaponModel.rotation[axis] += increment * (Math.PI / 180); // Convert degrees to radians
    console.log(`🔧 Rotated ${axis} by ${increment}°, new rotation (radians):`, this.weaponModel.rotation);
  }

  // Get current weapon transform values for copying
  public getWeaponTransform(): { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 } | null {
    if (!this.weaponModel) return null;
    
    return {
      position: this.weaponModel.position.clone(),
      rotation: this.weaponModel.rotation.clone(),
      scale: this.weaponModel.scale.clone()
    };
  }

  // Apply specific transform values
  public setWeaponTransform(position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3): void {
    if (!this.weaponModel) {
      console.log("❌ No weapon model loaded");
      return;
    }

    this.weaponModel.position.copy(position);
    this.weaponModel.rotation.copy(rotation);
    this.weaponModel.scale.copy(scale);
    console.log("🔧 Applied custom transform:", { position, rotation, scale });
  }
}
