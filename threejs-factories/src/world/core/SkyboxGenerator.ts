import * as THREE from "three";
import type { SkyboxConfig } from "../types/WorldTypes";

export class SkyboxGenerator {
  private textureLoader = new THREE.TextureLoader();

  async createSkybox(
    config: SkyboxConfig
  ): Promise<THREE.Object3D | THREE.Texture> {
    if (config.texture) {
      // Load custom skybox texture
      return this.loadCustomSkybox(config.texture);
    }

    // Generate synthetic skybox
    return this.generateSyntheticSkybox(config);
  }

  private async loadCustomSkybox(texturePath: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        texturePath,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  private generateSyntheticSkybox(config: SkyboxConfig): THREE.Object3D {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);

    let material: THREE.Material;

    switch (config.type) {
      case "gradient":
        material = this.createGradientMaterial(
          config.colors || ["#87ceeb", "#ffffff", "#87ceeb"]
        );
        break;
      case "sunset":
        material = this.createSunsetMaterial(
          config.colors || ["#ff6b35", "#f7931e", "#ffdc00", "#87ceeb"]
        );
        break;
      case "night":
        material = this.createNightMaterial(
          config.colors || ["#0f0f23", "#1a1a3a", "#2d2d5a"]
        );
        break;
      case "space":
        material = this.createSpaceMaterial(
          config.colors || ["#000011", "#000033", "#000055"]
        );
        break;
      case "stars":
        material = this.createStarfieldMaterial();
        break;
      case "clouds":
        material = this.createCloudyMaterial();
        break;
      default:
        material = this.createGradientMaterial([
          "#87ceeb",
          "#ffffff",
          "#87ceeb",
        ]);
    }

    const skyMesh = new THREE.Mesh(skyGeometry, material);
    skyMesh.scale.setScalar(-1); // Invert so we see the inside
    skyMesh.name = "skybox";

    return skyMesh;
  }

  private createGradientMaterial(colors: string[]): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(colors[0]) },
        middleColor: { value: new THREE.Color(colors[1] || colors[0]) },
        bottomColor: { value: new THREE.Color(colors[2] || colors[0]) },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 middleColor;
        uniform vec3 bottomColor;
        uniform float exponent;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = abs(h);
          
          vec3 color;
          if (h > 0.0) {
            color = mix(middleColor, topColor, pow(t, exponent));
          } else {
            color = mix(middleColor, bottomColor, pow(t, exponent));
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }

  private createSunsetMaterial(colors: string[]): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(colors[0]) }, // Orange
        color2: { value: new THREE.Color(colors[1]) }, // Yellow
        color3: { value: new THREE.Color(colors[2]) }, // Light yellow
        color4: { value: new THREE.Color(colors[3]) }, // Sky blue
        time: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform float time;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition).y;
          float angle = atan(vWorldPosition.z, vWorldPosition.x);
          
          vec3 color;
          if (h > 0.3) {
            color = mix(color3, color4, smoothstep(0.3, 1.0, h));
          } else if (h > -0.1) {
            color = mix(color2, color3, smoothstep(-0.1, 0.3, h));
          } else {
            color = mix(color1, color2, smoothstep(-1.0, -0.1, h));
          }
          
          // Add some variation based on angle
          float variation = sin(angle * 3.0) * 0.1;
          color = mix(color, color2, variation);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }

  private createNightMaterial(colors: string[]): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        darkColor: { value: new THREE.Color(colors[0]) },
        midColor: { value: new THREE.Color(colors[1]) },
        lightColor: { value: new THREE.Color(colors[2]) },
        stars: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 darkColor;
        uniform vec3 midColor;
        uniform vec3 lightColor;
        uniform float stars;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 color = mix(darkColor, lightColor, smoothstep(-1.0, 1.0, h));
          
          // Add stars
          vec3 pos = normalize(vWorldPosition) * 100.0;
          float star = 0.0;
          for (int i = 0; i < 3; i++) {
            vec3 p = pos + float(i) * 13.7;
            float noise = fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            if (noise > 0.998) {
              star += (noise - 0.998) * 500.0;
            }
          }
          
          color += vec3(star) * stars;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }

  private createSpaceMaterial(colors: string[]): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(colors[0]) },
        color2: { value: new THREE.Color(colors[1]) },
        color3: { value: new THREE.Color(colors[2]) },
        starDensity: { value: 2000.0 },
        nebulaIntensity: { value: 0.3 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float starDensity;
        uniform float nebulaIntensity;
        varying vec3 vWorldPosition;
        
        float random(vec3 pos) {
          return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          vec3 pos = normalize(vWorldPosition);
          
          // Base space color
          vec3 color = mix(color1, color2, pos.y * 0.5 + 0.5);
          
          // Add nebula-like clouds
          float nebula = 0.0;
          for (int i = 0; i < 4; i++) {
            vec3 p = pos * pow(2.0, float(i)) * 3.0;
            nebula += random(floor(p)) * pow(0.5, float(i));
          }
          color = mix(color, color3, nebula * nebulaIntensity);
          
          // Add stars
          vec3 starPos = pos * starDensity;
          float star = random(floor(starPos));
          if (star > 0.996) {
            float brightness = (star - 0.996) * 250.0;
            color += vec3(brightness);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }

  private createStarfieldMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        starCount: { value: 5000.0 },
        brightness: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float starCount;
        uniform float brightness;
        varying vec3 vWorldPosition;
        
        float random(vec3 pos) {
          return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          vec3 pos = normalize(vWorldPosition) * starCount;
          
          vec3 color = vec3(0.0);
          
          // Multiple layers of stars
          for (int i = 0; i < 3; i++) {
            vec3 p = pos * pow(2.0, float(i));
            float star = random(floor(p));
            
            float threshold = 0.998 - float(i) * 0.001;
            if (star > threshold) {
              float intensity = (star - threshold) * 1000.0 * brightness;
              color += vec3(intensity);
            }
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }

  private createCloudyMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        skyColor: { value: new THREE.Color(0x87ceeb) },
        cloudColor: { value: new THREE.Color(0xffffff) },
        cloudCoverage: { value: 0.5 },
        time: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 skyColor;
        uniform vec3 cloudColor;
        uniform float cloudCoverage;
        uniform float time;
        varying vec3 vWorldPosition;
        
        float noise(vec3 pos) {
          return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        float fbm(vec3 pos) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(pos);
            pos *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec3 pos = normalize(vWorldPosition);
          
          // Only show clouds in upper hemisphere
          if (pos.y < 0.0) {
            gl_FragColor = vec4(mix(skyColor, vec3(0.2), abs(pos.y)), 1.0);
            return;
          }
          
          vec3 cloudPos = pos * 10.0 + vec3(time * 0.1, 0.0, 0.0);
          float cloud = fbm(cloudPos);
          
          float cloudMask = smoothstep(1.0 - cloudCoverage, 1.0, cloud);
          vec3 color = mix(skyColor, cloudColor, cloudMask);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }
}
