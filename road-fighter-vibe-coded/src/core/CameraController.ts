import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public followTarget(targetPosition: THREE.Vector3): void {
    // For pure top-down view, keep camera directly above the target
    this.targetPosition.set(
      targetPosition.x,
      GAME_CONFIG.CAMERA_HEIGHT,
      targetPosition.z + GAME_CONFIG.CAMERA_FOLLOW_DISTANCE
    );

    // Smooth camera movement
    this.camera.position.lerp(this.targetPosition, 0.1);

    // Always look straight down at the target
    const lookAtPoint = new THREE.Vector3(
      targetPosition.x,
      0,
      targetPosition.z
    );
    this.camera.lookAt(lookAtPoint);
  }
}
