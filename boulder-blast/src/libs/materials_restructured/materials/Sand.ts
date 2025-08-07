import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Sand material - Beige granular terrain with procedural sand texture
 */
export class Sand implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateSandTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  private generateSandTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base sand color
    ctx.fillStyle = "#c2b280";
    ctx.fillRect(0, 0, 256, 256);

    // Add granular sand particles
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgb(${180 + Math.random() * 40}, ${
        160 + Math.random() * 40
      }, ${120 + Math.random() * 20})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
