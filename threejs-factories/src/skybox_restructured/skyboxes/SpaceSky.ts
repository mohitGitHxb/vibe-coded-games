import * as THREE from "three";
import type { ISkybox } from "../types/SkyboxTypes";

export class SpaceSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createSpaceMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    // Add stars and nebula
    this.addSpaceElements(skyMesh);

    return skyMesh;
  }

  private createSpaceMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
    });
  }

  private addSpaceElements(skyMesh: THREE.Object3D): void {
    // Add bright stars
    this.addStars(skyMesh, 800, 3, 0xffffff);

    // Add distant stars
    this.addStars(skyMesh, 1500, 1, 0xcccccc);

    // Add nebula-like colored regions
    this.addNebula(skyMesh);
  }

  private addStars(
    skyMesh: THREE.Object3D,
    count: number,
    size: number,
    color: number
  ): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: color,
      size: size,
      sizeAttenuation: false,
      transparent: true,
      opacity: Math.random() * 0.5 + 0.5,
    });

    const starsVertices: number[] = [];

    for (let i = 0; i < count; i++) {
      const radius = 490;
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

  private addNebula(skyMesh: THREE.Object3D): void {
    // Create nebula regions with colored transparent spheres
    const nebulaColors = [0xff6b6b, 0x4ecdc4, 0x6c5ce7, 0xff9ff3];

    for (let i = 0; i < 4; i++) {
      const nebulaGeometry = new THREE.SphereGeometry(
        100 + Math.random() * 50,
        16,
        16
      );
      const nebulaMaterial = new THREE.MeshBasicMaterial({
        color: nebulaColors[i],
        transparent: true,
        opacity: 0.1 + Math.random() * 0.1,
        side: THREE.BackSide,
      });

      const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);

      // Random position on the sky sphere
      const radius = 300 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      nebula.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      skyMesh.add(nebula);
    }
  }
}
