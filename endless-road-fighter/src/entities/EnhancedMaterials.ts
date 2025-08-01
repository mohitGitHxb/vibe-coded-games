import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";

export class EnhancedMaterials {
  // Vehicle materials with metallic finish
  public static createVehicleMaterial(
    color: number
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 1.0,
    });
  }

  // Player vehicle with special glow effect
  public static createPlayerMaterial(): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: GAME_CONFIG.COLORS.PLAYER,
      metalness: 0.8,
      roughness: 0.2,
      emissive: new THREE.Color(GAME_CONFIG.COLORS.PLAYER).multiplyScalar(0.1),
      envMapIntensity: 1.2,
    });

    return material;
  }

  // Enhanced road material with realistic asphalt look
  public static createRoadMaterial(): THREE.MeshStandardMaterial {
    // Create procedural road texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;

    // Base asphalt color
    context.fillStyle = "#404040";
    context.fillRect(0, 0, 512, 512);

    // Add noise for realistic asphalt texture
    const imageData = context.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }

    context.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  // Glowing lane line material
  public static createLaneLineMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: GAME_CONFIG.COLORS.LANE_LINES,
      emissive: new THREE.Color(GAME_CONFIG.COLORS.LANE_LINES).multiplyScalar(
        0.2
      ),
    });
  }

  // Warning lane lines with animated glow
  public static createWarningLaneLineMaterial(): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial({
      color: GAME_CONFIG.COLORS.WARNING_LINES,
      emissive: new THREE.Color(
        GAME_CONFIG.COLORS.WARNING_LINES
      ).multiplyScalar(0.3),
      transparent: true,
      opacity: 1.0,
    });

    return material;
  }

  // Power-up materials with glow effects
  public static createPowerUpMaterial(
    color: number,
    glowIntensity: number = 0.3
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(color).multiplyScalar(glowIntensity),
      metalness: 0.1,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
    });
  }

  // Power-up glow material
  public static createPowerUpGlowMaterial(
    color: number
  ): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
  }

  // Invincibility effect material (for when player is invincible)
  public static createInvincibilityMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(0xffff00).multiplyScalar(0.5),
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
    });
  }

  // Speed boost trail material
  public static createSpeedTrailMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
  }
}
