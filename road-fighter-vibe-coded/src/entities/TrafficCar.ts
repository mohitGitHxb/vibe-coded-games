import * as THREE from "three";
import { GAME_CONFIG, VISUAL_CONFIG } from "../utils/Constants";

export class TrafficCar {
  public mesh!: THREE.Mesh;
  public speed: number;
  private laneIndex: number;

  constructor(
    scene: THREE.Scene,
    initialPosition: THREE.Vector3,
    laneIndex: number = 1,
    speedMultiplier: number = 1
  ) {
    this.laneIndex = laneIndex;
    // High-speed traffic - much faster than before!
    this.speed =
      GAME_CONFIG.LEVEL_1_SPEED *
      GAME_CONFIG.TRAFFIC_SPEED_RATIO *
      speedMultiplier;
    this.createMesh(initialPosition);
    scene.add(this.mesh);
  }

  private createMesh(position: THREE.Vector3): void {
    // Create sleeker car for highway racing
    const { width, height, length } = VISUAL_CONFIG.TRAFFIC_CAR_SIZE;
    const carGeometry = new THREE.BoxGeometry(width, height, length);

    // More varied car colors for highway diversity
    const colors = [
      0xff3030, // Red
      0x30ff30, // Green
      0x3030ff, // Blue
      0xffff30, // Yellow
      0xff30ff, // Magenta
      0x30ffff, // Cyan
      0xff8030, // Orange
      0x8030ff, // Purple
      0xffffff, // White
      0x303030, // Dark Gray
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const carMaterial = new THREE.MeshLambertMaterial({ color: randomColor });

    this.mesh = new THREE.Mesh(carGeometry, carMaterial);
    this.mesh.position.copy(position);
    this.mesh.position.y = height / 2;

    this.addHighwayCarDetails();
  }

  private addHighwayCarDetails(): void {
    // Add more detailed car features for highway feel

    // Rear lights (brighter for high speed)
    const rearLightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const rearLightMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      emissive: 0x330000, // Slight glow
    });

    const leftRearLight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
    leftRearLight.position.set(-0.7, 0.1, -1.8);
    this.mesh.add(leftRearLight);

    const rightRearLight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
    rightRearLight.position.set(0.7, 0.1, -1.8);
    this.mesh.add(rightRearLight);

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.2);
    const windshieldMaterial = new THREE.MeshLambertMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.7,
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 0.35, 0.3);
    this.mesh.add(windshield);
  }

  public update(deltaTime: number): void {
    // High-speed forward movement
    this.mesh.position.z -= this.speed * deltaTime;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public isOffScreen(playerZ: number): boolean {
    // Remove when far behind player
    return (
      this.mesh.position.z > playerZ + GAME_CONFIG.TRAFFIC_DESPAWN_DISTANCE
    );
  }

  public destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
