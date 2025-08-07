import * as THREE from "three";
import type { ISkybox } from "../types/SkyboxTypes";

export class CloudySky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createCloudyMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createCloudyMaterial(): THREE.MeshBasicMaterial {
    // Generate cloudy sky texture
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base sky color
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#87ceeb"); // Sky blue
    gradient.addColorStop(0.7, "#b0c4de"); // Light steel blue
    gradient.addColorStop(1, "#f0f8ff"); // Alice blue at horizon

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add clouds
    this.addClouds(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
  }

  private addClouds(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    // Draw multiple layers of clouds
    for (let layer = 0; layer < 3; layer++) {
      const opacity = 0.3 - layer * 0.1;

      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width * 1.2 - width * 0.1;
        const y = Math.random() * height * 0.6 + height * 0.1;
        const size = 50 + Math.random() * 100;

        this.drawCloud(ctx, x, y, size, opacity);
      }
    }
  }

  private drawCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    opacity: number
  ): void {
    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw cloud as multiple overlapping circles
    const numCircles = 5 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numCircles; i++) {
      const offsetX = (Math.random() - 0.5) * size * 0.8;
      const offsetY = (Math.random() - 0.5) * size * 0.4;
      const radius = size * (0.3 + Math.random() * 0.4);

      const cloudGradient = ctx.createRadialGradient(
        x + offsetX,
        y + offsetY,
        0,
        x + offsetX,
        y + offsetY,
        radius
      );
      cloudGradient.addColorStop(0, "#ffffff");
      cloudGradient.addColorStop(0.6, "#e8e8e8");
      cloudGradient.addColorStop(1, "transparent");

      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
