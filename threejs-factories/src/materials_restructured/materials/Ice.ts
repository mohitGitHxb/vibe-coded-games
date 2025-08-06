import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Ice material - Transparent frozen water with crystalline texture
 */
export class Ice implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateIceTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xddeeff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 2.0,
    });
  }

  private generateIceTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base ice color
    ctx.fillStyle = "#ddeeff";
    ctx.fillRect(0, 0, 256, 256);

    // Add ice crystalline patterns
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 8 + 2;

      ctx.strokeStyle = `rgba(${200 + Math.random() * 55}, ${
        220 + Math.random() * 35
      }, ${240 + Math.random() * 15}, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = Math.random() * 2;

      // Draw crystalline patterns
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
      }
      ctx.closePath();
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
