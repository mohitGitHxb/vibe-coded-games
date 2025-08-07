import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Grass material - Green natural terrain with grass blade texture
 */
export class Grass implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateGrassTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  private generateGrassTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base grass color
    ctx.fillStyle = "#4a7c59";
    ctx.fillRect(0, 0, 256, 256);

    // Add grass blade patterns
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const height = Math.random() * 8 + 3;

      ctx.strokeStyle = `rgb(${60 + Math.random() * 40}, ${
        100 + Math.random() * 60
      }, ${40 + Math.random() * 40})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;

      // Draw grass blades
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y - height);
      ctx.stroke();
    }

    // Add some dirt patches
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${80 + Math.random() * 60}, ${
        60 + Math.random() * 40
      }, ${30 + Math.random() * 30}, 0.4)`;
      ctx.fillRect(
        Math.random() * 256,
        Math.random() * 256,
        Math.random() * 15 + 5,
        Math.random() * 15 + 5
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
