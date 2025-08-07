import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Concrete material - Gray industrial concrete with speckled texture
 */
export class Concrete implements IMaterial {
  create(): THREE.Material {
    const texture = this.generateConcreteTexture();

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.0,
    });
  }

  private generateConcreteTexture(): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Base concrete color
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 256);

    // Add concrete speckles and aggregate particles
    for (let i = 0; i < 800; i++) {
      const size = 1 + Math.random() * 3;
      ctx.fillStyle = `rgb(${100 + Math.random() * 100}, ${
        100 + Math.random() * 100
      }, ${100 + Math.random() * 100})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, size, size);
    }

    // Add darker stains
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${50 + Math.random() * 50}, ${
        50 + Math.random() * 50
      }, ${50 + Math.random() * 50}, 0.3)`;
      ctx.fillRect(
        Math.random() * 256,
        Math.random() * 256,
        Math.random() * 20,
        Math.random() * 20
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
