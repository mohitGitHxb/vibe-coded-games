import * as THREE from "three";
import type { ISkybox } from "../types/SkyboxTypes";

export class NightSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createNightMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    // Add stars
    this.addStars(skyMesh);

    return skyMesh;
  }

  private createNightMaterial(): THREE.MeshBasicMaterial {
    // Generate night sky texture with gradient
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000428"); // Deep night blue at top
    gradient.addColorStop(0.7, "#1a1a2e"); // Dark blue-purple
    gradient.addColorStop(1, "#0f0f23"); // Very dark at horizon

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
  }

  private addStars(skyMesh: THREE.Object3D): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
    });

    const starsVertices: number[] = [];

    // Generate random stars
    for (let i = 0; i < 1000; i++) {
      const radius = 490; // Slightly inside the sky sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    skyMesh.add(stars);
  }
}
