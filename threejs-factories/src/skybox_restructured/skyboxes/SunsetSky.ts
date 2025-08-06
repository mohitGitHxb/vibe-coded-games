import * as THREE from "three";
import type { ISkybox } from "../types/SkyboxTypes";

export class SunsetSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createSunsetMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createSunsetMaterial(): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform vec3 color4;
      uniform float offset;
      
      varying vec3 vWorldPosition;
      
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        
        vec3 color;
        if (h > 0.5) {
          color = mix(color3, color4, (h - 0.5) * 2.0);
        } else if (h > 0.0) {
          color = mix(color2, color3, h * 2.0);
        } else {
          color = mix(color1, color2, (h + 1.0) * 0.5);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(0xff6b35) }, // Deep orange
        color2: { value: new THREE.Color(0xff8c42) }, // Orange
        color3: { value: new THREE.Color(0xffa726) }, // Light orange
        color4: { value: new THREE.Color(0x6c5ce7) }, // Purple top
        offset: { value: 33 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
    });
  }
}
