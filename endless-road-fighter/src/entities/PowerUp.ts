import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";
import type { PowerUpData, PowerUpType, Transform } from "../utils/Types";

export class PowerUp {
  public data: PowerUpData;
  public mesh!: THREE.Mesh;
  public glowMesh!: THREE.Mesh;
  private geometry!: THREE.BoxGeometry;
  private material!: THREE.MeshLambertMaterial;
  private glowMaterial!: THREE.MeshBasicMaterial;
  private glowGeometry!: THREE.BoxGeometry;

  constructor(
    id: number,
    type: PowerUpType,
    lane: number,
    startZ: number,
    currentLanes: number
  ) {
    this.data = this.createPowerUpData(id, type, lane, startZ, currentLanes);
    this.createMesh();
    this.data.mesh = this.mesh;
    this.data.glowMesh = this.glowMesh;
    this.updateBoundingBox();
  }

  private createPowerUpData(
    id: number,
    type: PowerUpType,
    lane: number,
    startZ: number,
    currentLanes: number
  ): PowerUpData {
    const config = GAME_CONFIG.POWERUP_TYPES[type];

    // Calculate lane position
    const laneX = this.getLanePosition(lane, currentLanes);

    return {
      id,
      type,
      transform: {
        position: new THREE.Vector3(
          laneX,
          config.size.height / 2 + 0.1,
          startZ
        ),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
      },
      lane,
      isCollected: false,
      animationTime: 0,
    };
  }

  private getLanePosition(lane: number, totalLanes: number): number {
    const laneWidth = GAME_CONFIG.LANE_WIDTH;
    return (lane - (totalLanes - 1) / 2) * laneWidth;
  }

  private createMesh(): void {
    const config = GAME_CONFIG.POWERUP_TYPES[this.data.type];

    // Create main power-up geometry
    this.geometry = new THREE.BoxGeometry(
      config.size.width,
      config.size.height,
      config.size.length
    );

    this.material = new THREE.MeshLambertMaterial({
      color: config.color,
      transparent: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.data.transform.position);
    this.mesh.rotation.copy(this.data.transform.rotation);
    this.mesh.scale.copy(this.data.transform.scale);

    // Create glow effect
    this.glowGeometry = new THREE.BoxGeometry(
      config.size.width * 1.4,
      config.size.height * 1.4,
      config.size.length * 1.4
    );

    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: config.glowColor,
      transparent: true,
      opacity: 0.3,
    });

    this.glowMesh = new THREE.Mesh(this.glowGeometry, this.glowMaterial);
    this.glowMesh.position.copy(this.data.transform.position);
    this.glowMesh.rotation.copy(this.data.transform.rotation);
    this.glowMesh.scale.copy(this.data.transform.scale);

    // Store reference to power-up data
    this.mesh.userData = { powerUpId: this.data.id, type: this.data.type };
    this.glowMesh.userData = { powerUpId: this.data.id, type: this.data.type };
  }

  public update(deltaTime: number, currentLanes: number): void {
    if (this.data.isCollected) return;

    this.data.animationTime += deltaTime;
    this.updateAnimation();
    this.updateLanePosition(currentLanes);
    this.updateMesh();
    this.updateBoundingBox();
  }

  private updateAnimation(): void {
    // Floating animation
    const floatHeight = Math.sin(this.data.animationTime * 3) * 0.1;
    this.data.transform.position.y =
      GAME_CONFIG.POWERUP_TYPES[this.data.type].size.height / 2 +
      0.1 +
      floatHeight;

    // Rotation animation
    this.data.transform.rotation.y = this.data.animationTime * 2;

    // Pulsing glow effect
    const glowIntensity = (Math.sin(this.data.animationTime * 4) + 1) / 2;
    this.glowMaterial.opacity = 0.2 + glowIntensity * 0.3;
  }

  private updateLanePosition(currentLanes: number): void {
    // Update position if road width changed
    const newX = this.getLanePosition(this.data.lane, currentLanes);
    this.data.transform.position.x = newX;
  }

  private updateMesh(): void {
    this.mesh.position.copy(this.data.transform.position);
    this.mesh.rotation.copy(this.data.transform.rotation);
    this.mesh.scale.copy(this.data.transform.scale);

    this.glowMesh.position.copy(this.data.transform.position);
    this.glowMesh.rotation.copy(this.data.transform.rotation);
    this.glowMesh.scale.copy(this.data.transform.scale);
  }

  private updateBoundingBox(): void {
    this.data.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  public collect(): void {
    this.data.isCollected = true;
    // Hide meshes
    this.mesh.visible = false;
    this.glowMesh.visible = false;
  }

  public getPosition(): THREE.Vector3 {
    return this.data.transform.position.clone();
  }

  public getBoundingBox(): THREE.Box3 {
    return this.data.boundingBox!.clone();
  }

  public dispose(): void {
    this.geometry.dispose();
    this.glowGeometry.dispose();
    this.material.dispose();
    this.glowMaterial.dispose();

    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    if (this.glowMesh.parent) {
      this.glowMesh.parent.remove(this.glowMesh);
    }
  }
}
