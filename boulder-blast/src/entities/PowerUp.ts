/**
 * PowerUp - Collectible power-up items that enhance spaceship abilities
 * Spawns occasionally and floats down from top of screen
 */

import * as THREE from "three";
import { MaterialFactory } from "../libs/materials_restructured/MaterialFactory";
import {
  NeonGlass,
  EnergyField,
  GlowingCrystal,
  Neon,
} from "../libs/materials_restructured";

export type PowerUpType = "health" | "rapidFire" | "shield" | "damage";

export interface PowerUpProperties {
  effectDuration: number; // Duration in seconds (0 = instant effect)
  value: number; // Healing amount, damage multiplier, etc.
  points: number; // Score bonus for collecting
  size: number;
  glowIntensity: number;
  rotationSpeed: number;
}

export class PowerUp {
  private mesh: THREE.Group; // Changed to Group to handle hexagon + sprite
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private isActive: boolean = true;
  private type: PowerUpType;
  private properties: PowerUpProperties;
  private materialFactory: MaterialFactory;

  constructor(startX: number, startY: number, type: PowerUpType) {
    this.type = type;
    this.properties = this.getPowerUpProperties(type);
    this.materialFactory = new MaterialFactory();

    this.position = new THREE.Vector3(startX, startY, 0);
    this.velocity = new THREE.Vector3(0, -100, 0); // Slow descent to allow collection

    this.mesh = this.createPowerUpMesh();
    this.updateMeshPosition();
  }

  /**
   * Get properties for each power-up type
   */
  private getPowerUpProperties(type: PowerUpType): PowerUpProperties {
    switch (type) {
      case "health":
        return {
          effectDuration: 0, // Instant healing
          value: 25, // Heal 25 HP
          points: 50,
          size: 20,
          glowIntensity: 0.3,
          rotationSpeed: 1.0,
        };

      case "rapidFire":
        return {
          effectDuration: 15, // 15 seconds of rapid fire
          value: 2.0, // Double fire rate
          points: 75,
          size: 20,
          glowIntensity: 0.4,
          rotationSpeed: 1.5,
        };

      case "shield":
        return {
          effectDuration: 15, // 15 seconds of protection
          value: 3, // Absorb 3 hits
          points: 100,
          size: 20,
          glowIntensity: 0.5,
          rotationSpeed: 0.8,
        };

      case "damage":
        return {
          effectDuration: 15, // 15 seconds of increased damage
          value: 2.0, // Double damage
          points: 125,
          size: 20,
          glowIntensity: 0.6,
          rotationSpeed: 2.0,
        };

      default:
        return this.getPowerUpProperties("health");
    }
  }

  /**
   * Create power-up mesh with hexagonal design and emoji using neon materials
   */
  private createPowerUpMesh(): THREE.Group {
    // Create hexagonal background
    const hexGeometry = this.createHexagonGeometry(this.properties.size);

    // Create neon material based on power-up type
    let hexMaterial: THREE.Material;
    let emoji: string;

    switch (this.type) {
      case "health":
        // Green glowing crystal for health
        hexMaterial = this.materialFactory.create(new GlowingCrystal());
        emoji = "❤️";
        break;

      case "rapidFire":
        // Orange neon glass for rapid fire
        hexMaterial = this.materialFactory.create(new NeonGlass());
        emoji = "🔥";
        break;

      case "shield":
        // Blue energy field for shield
        hexMaterial = this.materialFactory.create(new EnergyField());
        emoji = "🛡️";
        break;

      case "damage":
        // Purple neon for damage
        hexMaterial = this.materialFactory.create(new Neon());
        emoji = "⚡";
        break;

      default:
        // Fallback to glowing crystal
        hexMaterial = this.materialFactory.create(new GlowingCrystal());
        emoji = "❤️";
    }

    // Create hexagon mesh
    const hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);

    // Create emoji texture and sprite
    const emojiSprite = this.createEmojiSprite(emoji);

    // Create group to combine hex and emoji
    const group = new THREE.Group();
    group.add(hexMesh);
    group.add(emojiSprite);

    return group;
  }
  /**
   * Create hexagonal geometry
   */
  private createHexagonGeometry(size: number): THREE.ShapeGeometry {
    const shape = new THREE.Shape();
    const radius = size;

    // Create hexagon path
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    return new THREE.ShapeGeometry(shape);
  }

  /**
   * Create emoji sprite for power-up center
   */
  private createEmojiSprite(emoji: string): THREE.Sprite {
    // Create canvas for emoji
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d")!;
    context.fillStyle = "transparent";
    context.fillRect(0, 0, size, size);

    // Draw emoji
    context.font = "40px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(emoji, size / 2, size / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.setScalar(this.properties.size * 0.8);
    sprite.position.z = 0.1; // Slightly forward to show on top

    return sprite;
  }

  /**
   * Update power-up position (no rotation for clean look)
   */
  public update(
    deltaTime: number,
    worldBounds: { width: number; height: number }
  ): void {
    if (!this.isActive) return;

    // Update position - straight fall, no rotation
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Add subtle floating animation
    this.position.y += Math.sin(Date.now() * 0.003) * 0.3;

    this.updateMeshPosition();

    // Deactivate if goes off screen
    if (this.position.y < -worldBounds.height / 2 - this.properties.size) {
      this.isActive = false;
    }
  }

  /**
   * Update mesh position to match entity position
   */
  private updateMeshPosition(): void {
    this.mesh.position.copy(this.position);
  }

  /**
   * Get collision bounds for this power-up
   */
  public getBounds(): {
    center: THREE.Vector3;
    radius: number;
  } {
    return {
      center: this.position.clone(),
      radius: this.properties.size,
    };
  }

  // Getters
  public getMesh(): THREE.Group {
    return this.mesh;
  }
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  public isActiveState(): boolean {
    return this.isActive;
  }
  public getType(): PowerUpType {
    return this.type;
  }
  public getProperties(): PowerUpProperties {
    return { ...this.properties };
  }
  public getPoints(): number {
    return this.properties.points;
  }

  /**
   * Collect this power-up (deactivate it)
   */
  public collect(): void {
    this.isActive = false;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    // Dispose all children in the group
    this.mesh.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      } else if (child instanceof THREE.Sprite) {
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
    this.isActive = false;
  }
}
