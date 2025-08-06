import * as THREE from "three";
import { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class Dawn implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Soft ambient with dawn colors
    const ambientLight = new THREE.AmbientLight(0xffeaa7, 0.3);
    lights.push(ambientLight);

    // Low sun - warm and soft
    const sunLight = new THREE.DirectionalLight(0xffa726, 1.5);
    sunLight.position.set(8, 3, 2); // Low angle for dawn
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    lights.push(sunLight);

    // Sky gradient simulation with hemisphere
    const hemisphereLight = new THREE.HemisphereLight(0xff7675, 0x6c5ce7, 0.6);
    hemisphereLight.position.set(0, 10, 0);
    lights.push(hemisphereLight);

    // Rim light for dramatic dawn effect
    const rimLight = new THREE.DirectionalLight(0xff6b6b, 0.4);
    rimLight.position.set(-5, 2, -3);
    rimLight.target.position.set(0, 0, 0);
    lights.push(rimLight);

    return {
      lights,
      fogSettings: {
        color: 0xffeaa7,
        near: 8,
        far: 35,
      },
      shadowSettings: {
        enabled: true,
        mapSize: 2048,
      },
    };
  }
}
