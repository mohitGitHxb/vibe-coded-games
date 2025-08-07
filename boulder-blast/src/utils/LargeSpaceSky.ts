/**
 * LargeSpaceSky - Custom space skybox with larger radius for 2D games
 * Extends the standard SpaceSky with appropriate sizing
 */

import * as THREE from "three";
import type { ISkybox } from "../libs/skybox_restructured/types/SkyboxTypes";

export class LargeSpaceSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    // Use a much larger radius suitable for 2D games (game world is 1280x720)
    const skyRadius = 2000; // Large enough to cover entire game area
    const skyGeometry = new THREE.SphereGeometry(skyRadius, 32, 32);
    const skyMaterial = this.createSpaceMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    // Add stars and space elements with appropriate scale
    this.addSpaceElements(skyMesh, skyRadius);

    return skyMesh;
  }

  private createSpaceMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: 0x000811, // Dark space blue matching our scene
      side: THREE.BackSide,
    });
  }

  private addSpaceElements(skyMesh: THREE.Object3D, skyRadius: number): void {
    // Add bright stars
    this.addStars(skyMesh, 1200, 3, 0xffffff, skyRadius);

    // Add distant stars
    this.addStars(skyMesh, 2000, 1, 0xcccccc, skyRadius);

    // Add some colored stars for variety
    this.addStars(skyMesh, 300, 2, 0xffffaa, skyRadius); // Slightly yellow stars
  }

  private addStars(
    skyMesh: THREE.Object3D,
    count: number,
    size: number,
    color: number,
    skyRadius: number
  ): void {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: color,
      size: size,
      sizeAttenuation: false,
      transparent: true,
      opacity: Math.random() * 0.4 + 0.6, // Variable opacity for twinkling effect
    });

    const positions = new Float32Array(count * 3);

    // Generate stars on the inside surface of the sphere
    for (let i = 0; i < count; i++) {
      const radius = skyRadius * 0.95; // Slightly inside the sphere
      const theta = Math.random() * Math.PI * 2; // Random angle around Y axis
      const phi = Math.random() * Math.PI; // Random angle from Y axis

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta); // x
      positions[i * 3 + 1] = radius * Math.cos(phi); // y
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta); // z
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    skyMesh.add(stars);
  }
}
