import * as THREE from "three";
import type { ISkybox } from "../types/SkyboxTypes";

export class ClearSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createSkyMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide; // Render inside of sphere
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createSkyMaterial(): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      
      varying vec3 vWorldPosition;
      
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) }, // Blue sky
        bottomColor: { value: new THREE.Color(0xffffff) }, // White horizon
        offset: { value: 33 },
        exponent: { value: 0.6 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
    });
  }
}
