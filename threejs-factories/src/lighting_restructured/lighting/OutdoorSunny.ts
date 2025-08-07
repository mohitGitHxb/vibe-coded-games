import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class OutdoorSunny implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Bright ambient for outdoor environment
    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.6);
    lights.push(ambientLight);

    // Sun - strong directional light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(10, 15, 5);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    lights.push(sunLight);

    // Sky hemisphere light for natural color variation
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x6b8e23, 0.8);
    hemisphereLight.position.set(0, 20, 0);
    lights.push(hemisphereLight);

    return {
      lights,
      shadowSettings: {
        enabled: true,
        mapSize: 2048,
      },
    };
  }
}
