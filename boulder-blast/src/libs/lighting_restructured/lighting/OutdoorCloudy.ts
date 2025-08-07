import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class OutdoorCloudy implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Diffused ambient light
    const ambientLight = new THREE.AmbientLight(0xbdc3c7, 0.8);
    lights.push(ambientLight);

    // Diffused sun through clouds - softer shadows
    const sunLight = new THREE.DirectionalLight(0xecf0f1, 1.0);
    sunLight.position.set(5, 12, 3);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    // Softer shadows for cloudy day
    sunLight.shadow.radius = 8;
    sunLight.shadow.blurSamples = 10;
    lights.push(sunLight);

    // Overcast sky simulation
    const hemisphereLight = new THREE.HemisphereLight(0x95a5a6, 0x7f8c8d, 0.4);
    hemisphereLight.position.set(0, 10, 0);
    lights.push(hemisphereLight);

    return {
      lights,
      fogSettings: {
        color: 0xddd,
        near: 15,
        far: 50,
      },
      shadowSettings: {
        enabled: true,
        mapSize: 1024,
      },
    };
  }
}
