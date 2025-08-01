import * as THREE from "three";

export class ScreenEffects {
  private camera: THREE.Camera;
  private originalPosition: THREE.Vector3;
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTime: number = 0;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.originalPosition = camera.position.clone();
  }

  public update(deltaTime: number): void {
    this.updateScreenShake(deltaTime);
  }

  public triggerScreenShake(
    intensity: number = 0.5,
    duration: number = 0.3
  ): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTime = Math.max(this.shakeTime, duration);

    console.log(
      `Screen shake triggered: intensity=${intensity}, duration=${duration}s`
    );
  }

  private updateScreenShake(deltaTime: number): void {
    if (this.shakeTime <= 0) {
      // Reset camera to original position
      this.camera.position.copy(this.originalPosition);
      return;
    }

    this.shakeTime -= deltaTime;

    // Calculate shake offset
    const shakeProgress = this.shakeTime / this.shakeDuration;
    const currentIntensity = this.shakeIntensity * shakeProgress;

    // Random shake offset
    const shakeX = (Math.random() - 0.5) * currentIntensity;
    const shakeY = (Math.random() - 0.5) * currentIntensity;
    const shakeZ = (Math.random() - 0.5) * currentIntensity * 0.5;

    // Apply shake to camera
    this.camera.position.set(
      this.originalPosition.x + shakeX,
      this.originalPosition.y + shakeY,
      this.originalPosition.z + shakeZ
    );
  }

  public updateCameraPosition(newPosition: THREE.Vector3): void {
    this.originalPosition.copy(newPosition);

    // If not shaking, update camera immediately
    if (this.shakeTime <= 0) {
      this.camera.position.copy(newPosition);
    }
  }

  public dispose(): void {
    this.camera.position.copy(this.originalPosition);
    this.shakeTime = 0;
  }
}
