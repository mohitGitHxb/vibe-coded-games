import * as THREE from "three";
import { GAME_CONFIG } from "../utils/GameConfig";

export class FPSCamera {
  public camera: THREE.PerspectiveCamera;
  private isLocked: boolean = false;
  private rotation = { x: 0, y: 0 };

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      GAME_CONFIG.CAMERA.NEAR,
      GAME_CONFIG.CAMERA.FAR
    );

    this.camera.position.set(0, GAME_CONFIG.PLAYER_HEIGHT, 0);
    this.setupPointerLock();
    this.setupEventListeners();
  }

  private setupPointerLock(): void {
    document.addEventListener("click", () => {
      if (!this.isLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === document.body;
    });
  }

  private setupEventListeners(): void {
    document.addEventListener("mousemove", (event) => {
      if (!this.isLocked) return;

      this.rotation.y -= event.movementX * GAME_CONFIG.CAMERA.MOUSE_SENSITIVITY;
      this.rotation.x -= event.movementY * GAME_CONFIG.CAMERA.MOUSE_SENSITIVITY;

      // Clamp vertical rotation to prevent over-rotation
      this.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.rotation.x)
      );

      this.updateCameraRotation();
    });

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  private updateCameraRotation(): void {
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.rotation.y;
    this.camera.rotation.x = this.rotation.x;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  public getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  public getRotation(): { x: number; y: number } {
    return { ...this.rotation };
  }
}
export default FPSCamera;
