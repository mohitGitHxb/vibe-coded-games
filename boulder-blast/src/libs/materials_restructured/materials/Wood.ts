import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Wood material - Natural brown wood with grain texture
 */
export class Wood implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateWoodTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
    });
  }

  private generateWoodTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base wood color
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(0, 0, 256, 256);

    // Add wood grain lines
    for (let y = 0; y < 256; y += 8) {
      const variance = Math.sin(y * 0.1) * 20;
      ctx.strokeStyle = `rgb(${100 + Math.random() * 40}, ${
        40 + Math.random() * 30
      }, ${10 + Math.random() * 20})`;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(0, y + variance);

      for (let x = 0; x <= 256; x += 4) {
        ctx.lineTo(x, y + variance + Math.sin(x * 0.05) * 3);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
