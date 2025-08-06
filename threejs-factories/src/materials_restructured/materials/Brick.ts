import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Brick material - Classic red building material with procedural brick pattern
 */
export class Brick implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateBrickTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
    });
  }

  private generateBrickTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base brick color
    ctx.fillStyle = "#b22222";
    ctx.fillRect(0, 0, 256, 256);

    // Brick pattern with mortar lines
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        ctx.strokeRect(x + offset, y, 64, 32);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
