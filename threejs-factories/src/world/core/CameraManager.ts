import * as THREE from "three";
import type { CameraConfig } from "../types/WorldTypes";
import { DEFAULT_CAMERA_CONFIG } from "../constants/WorldDefaults";

export class CameraManager {
  private currentCamera: THREE.Camera | null = null;

  createCamera(config: Partial<CameraConfig> = {}): THREE.Camera {
    const finalConfig = { ...DEFAULT_CAMERA_CONFIG, ...config };

    let camera: THREE.Camera;

    if (finalConfig.type === "orthographic") {
      camera = new THREE.OrthographicCamera(
        finalConfig.left || -10,
        finalConfig.right || 10,
        finalConfig.top || 10,
        finalConfig.bottom || -10,
        finalConfig.near || 0.1,
        finalConfig.far || 1000
      );
    } else {
      camera = new THREE.PerspectiveCamera(
        finalConfig.fov || 75,
        finalConfig.aspect || window.innerWidth / window.innerHeight,
        finalConfig.near || 0.1,
        finalConfig.far || 1000
      );
    }

    // Set position
    if (finalConfig.position) {
      camera.position.set(...finalConfig.position);
    }

    // Set look at target
    if (finalConfig.lookAt) {
      camera.lookAt(new THREE.Vector3(...finalConfig.lookAt));
    }

    this.currentCamera = camera;
    return camera;
  }

  updateAspect(camera: THREE.Camera, aspect: number): void {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    } else if (camera instanceof THREE.OrthographicCamera) {
      const height = camera.top - camera.bottom;
      const width = height * aspect;
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.updateProjectionMatrix();
    }
  }

  createPerspectiveCamera(
    fov = 75,
    aspect?: number,
    near = 0.1,
    far = 1000
  ): THREE.PerspectiveCamera {
    return this.createCamera({
      type: "perspective",
      fov,
      aspect: aspect || window.innerWidth / window.innerHeight,
      near,
      far,
    }) as THREE.PerspectiveCamera;
  }

  createOrthographicCamera(
    left = -10,
    right = 10,
    top = 10,
    bottom = -10,
    near = 0.1,
    far = 1000
  ): THREE.OrthographicCamera {
    return this.createCamera({
      type: "orthographic",
      left,
      right,
      top,
      bottom,
      near,
      far,
    }) as THREE.OrthographicCamera;
  }

  getCurrentCamera(): THREE.Camera | null {
    return this.currentCamera;
  }

  animateCameraTo(
    camera: THREE.Camera,
    targetPosition: THREE.Vector3,
    targetLookAt?: THREE.Vector3,
    duration = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      const startPosition = camera.position.clone();
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startPosition, targetPosition, eased);

        if (targetLookAt) {
          camera.lookAt(targetLookAt);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }
}
