import * as THREE from "three";
import { gsap } from "gsap";

export type PowerUpType =
  | "speed_boost"
  | "invincibility"
  | "extra_life"
  | "time_bonus";

export class PowerUp {
  public mesh: THREE.Group;
  public type: PowerUpType;
  public isCollected: boolean = false;
  private rotationSpeed: number;

  constructor(scene: THREE.Scene, position: THREE.Vector3, type: PowerUpType) {
    this.type = type;
    this.mesh = new THREE.Group();
    this.rotationSpeed = 2 + Math.random() * 2; // Random rotation speed

    this.createPowerUp();
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    this.addFloatingAnimation();
  }

  private createPowerUp(): void {
    let geometry: THREE.BufferGeometry;
    let color: number;
    let emissiveColor: number;

    switch (this.type) {
      case "speed_boost":
        geometry = new THREE.ConeGeometry(0.8, 2, 6);
        color = 0x00ff00;
        emissiveColor = 0x004400;
        break;
      case "invincibility":
        geometry = new THREE.SphereGeometry(0.8, 12, 12);
        color = 0x0099ff;
        emissiveColor = 0x003366;
        break;
      case "extra_life":
        geometry = new THREE.OctahedronGeometry(0.8);
        color = 0xff0099;
        emissiveColor = 0x330033;
        break;
      case "time_bonus":
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        color = 0xffff00;
        emissiveColor = 0x666600;
        break;
    }

    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: emissiveColor,
      emissiveIntensity: 0.3,
    });

    const powerUpMesh = new THREE.Mesh(geometry, material);
    this.mesh.add(powerUpMesh);

    // Add glow effect
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.setScalar(1.5);
    this.mesh.add(glow);
  }

  private addFloatingAnimation(): void {
    // Floating up and down
    gsap.to(this.mesh.position, {
      duration: 2,
      y: this.mesh.position.y + 1,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });

    // Pulsing glow
    const glowMesh = this.mesh.children[1] as THREE.Mesh;
    gsap.to(glowMesh.scale, {
      duration: 1,
      x: 2,
      y: 2,
      z: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });
  }

  public update(deltaTime: number): void {
    // Rotate the power-up
    this.mesh.rotation.y += this.rotationSpeed * deltaTime;

    // Move with traffic (slower than player)
    this.mesh.position.z -= 30 * deltaTime; // Slower than player speed
  }

  public checkPlayerCollision(playerPosition: THREE.Vector3): boolean {
    if (this.isCollected) return false;

    const distance = playerPosition.distanceTo(this.mesh.position);
    return distance < 3; // Collection radius
  }

  public collect(): void {
    this.isCollected = true;

    // Collection animation
    gsap.to(this.mesh.scale, {
      duration: 0.3,
      x: 2,
      y: 2,
      z: 2,
      ease: "back.out(1.7)",
    });

    gsap.to(this.mesh.position, {
      duration: 0.3,
      y: this.mesh.position.y + 3,
      ease: "power2.out",
    });

    // Fade out
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        gsap.to(child.material as THREE.MeshLambertMaterial, {
          duration: 0.3,
          opacity: 0,
          ease: "power2.out",
        });
      }
    });

    // Remove after animation
    setTimeout(() => {
      this.destroy();
    }, 400);
  }

  public isOffScreen(playerZ: number): boolean {
    return this.mesh.position.z > playerZ + 60;
  }

  public destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
