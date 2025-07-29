import * as THREE from "three";
import { GAME_CONFIG, VISUAL_CONFIG } from "../utils/Constants";

export class PlayerCar {
  public mesh!: THREE.Mesh;
  public speed: number = GAME_CONFIG.LEVEL_1_SPEED;
  private steeringInput: number = 0;

  constructor(scene: THREE.Scene) {
    this.createMesh();
    scene.add(this.mesh);
  }

  private createMesh(): void {
    // Create sleek Lamborghini-style car
    const { width, height, length } = VISUAL_CONFIG.PLAYER_CAR_SIZE;
    const carGeometry = new THREE.BoxGeometry(width, height, length);
    const carMaterial = new THREE.MeshLambertMaterial({
      color: 0x0066ff,
      emissive: 0x001133, // Slight blue glow for sports car feel
    });
    this.mesh = new THREE.Mesh(carGeometry, carMaterial);

    // Position car slightly above ground
    this.mesh.position.set(0, height / 2, 0);

    this.addSportsCarDetails();
  }

  private addSportsCarDetails(): void {
    // Add aggressive sports car styling

    // Windshield (more angular for sports car)
    const windshieldGeometry = new THREE.BoxGeometry(1.8, 0.4, 1.5);
    const windshieldMaterial = new THREE.MeshLambertMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.8,
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0, 0.4, 0.5);
    this.mesh.add(windshield);

    // Bright LED headlights
    const headlightGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headlightMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x333333, // Bright white with glow
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.8, 0.2, 2.0);
    this.mesh.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.8, 0.2, 2.0);
    this.mesh.add(rightHeadlight);

    // Side mirrors
    const mirrorGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.2);
    const mirrorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    leftMirror.position.set(-1.2, 0.3, 0.8);
    this.mesh.add(leftMirror);

    const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
    rightMirror.position.set(1.2, 0.3, 0.8);
    this.mesh.add(rightMirror);
  }

  public update(deltaTime: number): void {
    // HIGH-SPEED automatic forward movement (Lamborghini pace!)
    this.mesh.position.z -= this.speed * deltaTime;

    // Responsive steering for high-speed racing
    this.mesh.position.x +=
      this.steeringInput * GAME_CONFIG.STEERING_RATE * deltaTime;

    // Keep car within road bounds (wider highway)
    const roadHalfWidth = GAME_CONFIG.ROAD_WIDTH / 2 - 1.5;
    this.mesh.position.x = Math.max(
      -roadHalfWidth,
      Math.min(roadHalfWidth, this.mesh.position.x)
    );
  }

  public setSteeringInput(input: number): void {
    this.steeringInput = Math.max(-1, Math.min(1, input));
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
