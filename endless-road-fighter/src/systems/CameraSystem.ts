import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";
import { ScreenEffects } from "../effects/ScreenEffects";

export class CameraSystem {
  private camera!: THREE.PerspectiveCamera;
  private screenEffects: ScreenEffects;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private currentVelocity: THREE.Vector3 = new THREE.Vector3();
  private smoothingFactor: number = 0.1;

  constructor() {
    this.initializeCamera();
    this.screenEffects = new ScreenEffects(this.camera);
  }

  private initializeCamera(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);

    // Set initial camera position - behind and above the player, looking forward
    this.camera.position.set(
      0,
      GAME_CONFIG.CAMERA_HEIGHT,
      -GAME_CONFIG.CAMERA_FOLLOW_DISTANCE // Negative Z to be behind the player
    );
    this.camera.lookAt(0, 0, 10); // Look forward (positive Z direction)

    console.log("Camera system initialized with correct orientation");
  }

  public update(playerPosition: THREE.Vector3, playerSpeed?: number): void {
    // Calculate target position with dynamic offset based on speed
    const speedFactor = playerSpeed
      ? playerSpeed / GAME_CONFIG.STARTING_SPEED
      : 1;
    const dynamicHeight = GAME_CONFIG.CAMERA_HEIGHT + speedFactor * 3; // Slight height increase at speed
    const dynamicDistance =
      GAME_CONFIG.CAMERA_FOLLOW_DISTANCE + speedFactor * 1; // Slight distance increase

    // Position camera behind the player (negative Z offset from player position)
    this.targetPosition.set(
      playerPosition.x * 0.3, // Slight horizontal offset for turning
      dynamicHeight,
      playerPosition.z - dynamicDistance // Behind the player
    );

    // Smooth camera movement
    this.currentVelocity
      .subVectors(this.targetPosition, this.camera.position)
      .multiplyScalar(this.smoothingFactor);
    this.camera.position.add(this.currentVelocity);

    // Update screen effects
    this.screenEffects.updateCameraPosition(this.camera.position);
    this.screenEffects.update(1 / 60); // Assume 60 FPS for screen effects

    // Make camera look forward ahead of the player
    const lookAtTarget = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y,
      playerPosition.z + 15 // Look ahead of the player (forward)
    );
    this.camera.lookAt(lookAtTarget);
  }

  public triggerScreenShake(
    intensity: number = 0.5,
    duration: number = 0.3
  ): void {
    this.screenEffects.triggerScreenShake(intensity, duration);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public resize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    console.log(`Camera resized to aspect ratio: ${aspect.toFixed(2)}`);
  }

  public dispose(): void {
    this.screenEffects.dispose();
  }
}
