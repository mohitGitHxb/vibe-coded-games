import * as THREE from "three";
import { gsap } from "gsap";

export class ScreenShake {
  private camera: THREE.PerspectiveCamera;
  private originalPosition: THREE.Vector3;
  private isShaking: boolean = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.originalPosition = camera.position.clone();
  }

  public shake(intensity: number = 1, duration: number = 0.5): void {
    if (this.isShaking) return;

    this.isShaking = true;
    this.originalPosition.copy(this.camera.position);

    // Create shake timeline
    const timeline = gsap.timeline({
      onComplete: () => {
        this.isShaking = false;
        // Return to original position
        this.camera.position.copy(this.originalPosition);
      },
    });

    // Add multiple shake keyframes
    const shakeCount = 8;
    for (let i = 0; i < shakeCount; i++) {
      const progress = i / shakeCount;
      const currentIntensity = intensity * (1 - progress); // Fade out intensity

      timeline.to(this.camera.position, {
        duration: duration / shakeCount,
        x:
          this.originalPosition.x +
          (Math.random() - 0.5) * currentIntensity * 2,
        y:
          this.originalPosition.y +
          (Math.random() - 0.5) * currentIntensity * 2,
        z:
          this.originalPosition.z +
          (Math.random() - 0.5) * currentIntensity * 1,
        ease: "power2.out",
      });
    }
  }

  public update(newOriginalPosition: THREE.Vector3): void {
    if (!this.isShaking) {
      this.originalPosition.copy(newOriginalPosition);
    }
  }
}
