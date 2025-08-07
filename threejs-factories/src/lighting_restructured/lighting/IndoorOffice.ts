import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class IndoorOffice implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Ambient lighting - soft overall illumination
    const ambientLight = new THREE.AmbientLight(0xf4f4f4, 0.4);
    lights.push(ambientLight);

    // Main ceiling lights - fluorescent simulation
    const ceilingLight1 = new THREE.RectAreaLight(0xffffff, 3, 4, 2);
    ceilingLight1.position.set(-2, 4, 0);
    ceilingLight1.lookAt(0, 0, 0);
    lights.push(ceilingLight1);

    const ceilingLight2 = new THREE.RectAreaLight(0xffffff, 3, 4, 2);
    ceilingLight2.position.set(2, 4, 0);
    ceilingLight2.lookAt(0, 0, 0);
    lights.push(ceilingLight2);

    // Window light - soft directional from side
    const windowLight = new THREE.DirectionalLight(0xe8f4fd, 1.2);
    windowLight.position.set(5, 3, 2);
    windowLight.target.position.set(0, 0, 0);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    windowLight.shadow.camera.near = 0.5;
    windowLight.shadow.camera.far = 20;
    windowLight.shadow.camera.left = -5;
    windowLight.shadow.camera.right = 5;
    windowLight.shadow.camera.top = 5;
    windowLight.shadow.camera.bottom = -5;
    lights.push(windowLight);

    return {
      lights,
      shadowSettings: {
        enabled: true,
        mapSize: 1024,
      },
    };
  }
}
