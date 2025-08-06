import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Lava material - Hot glowing molten rock with flowing texture
 */
export class Lava implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateLavaTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffaa00,
      roughness: 0.9,
      metalness: 0.0,
      emissive: 0xff4400,
      emissiveIntensity: 0.5,
    });
  }

  private generateLavaTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base lava color
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(0, 0, 256, 256);

    // Add lava flow patterns
    for (let i = 0; i < 50; i++) {
      ctx.strokeStyle = `rgb(${255}, ${Math.random() * 100 + 50}, ${
        Math.random() * 50
      })`;
      ctx.lineWidth = Math.random() * 5 + 2;

      const startX = Math.random() * 256;
      const startY = Math.random() * 256;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      // Create flowing lava streams
      let currentX = startX;
      let currentY = startY;
      for (let j = 0; j < 10; j++) {
        currentX += (Math.random() - 0.5) * 40;
        currentY += Math.random() * 20 + 5;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }

    // Add bright lava cracks
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgb(255, ${200 + Math.random() * 55}, ${
        Math.random() * 100
      })`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
