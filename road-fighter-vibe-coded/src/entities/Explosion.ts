import * as THREE from "three";
import { gsap } from "gsap";

export class Explosion {
  private scene: THREE.Scene;
  private explosionGroup: THREE.Group;
  private particles: THREE.Mesh[] = [];
  private isActive: boolean = true;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    this.explosionGroup = new THREE.Group();
    this.explosionGroup.position.copy(position);
    scene.add(this.explosionGroup);

    this.createExplosion();
  }

  private createExplosion(): void {
    // Create multiple explosion particles
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      this.createExplosionParticle();
    }

    // Create main explosion flash
    this.createExplosionFlash();

    // Auto-cleanup after animation
    setTimeout(() => {
      this.destroy();
    }, 2000);
  }

  private createExplosionParticle(): void {
    // Random particle size and color
    const size = Math.random() * 0.8 + 0.2;
    const geometry = new THREE.SphereGeometry(size, 6, 6);

    // Fire colors: red, orange, yellow
    const colors = [0xff0000, 0xff4400, 0xff8800, 0xffaa00, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
    });

    const particle = new THREE.Mesh(geometry, material);

    // Random starting position
    particle.position.set(
      (Math.random() - 0.5) * 2,
      Math.random() * 1,
      (Math.random() - 0.5) * 2
    );

    this.explosionGroup.add(particle);
    this.particles.push(particle);

    // Animate particle
    this.animateParticle(particle);
  }

  private animateParticle(particle: THREE.Mesh): void {
    // Random explosion direction
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 2
    ).normalize();

    const distance = Math.random() * 8 + 4;
    const finalPosition = particle.position
      .clone()
      .add(direction.multiplyScalar(distance));

    // Animate position and scale
    gsap.to(particle.position, {
      duration: 1.5,
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z,
      ease: "power2.out",
    });

    gsap.to(particle.scale, {
      duration: 1.5,
      x: 0,
      y: 0,
      z: 0,
      ease: "power2.in",
    });

    // Fade out
    gsap.to(particle.material as THREE.MeshLambertMaterial, {
      duration: 1.5,
      opacity: 0,
      ease: "power2.in",
    });
  }

  private createExplosionFlash(): void {
    // Bright white flash
    const flashGeometry = new THREE.SphereGeometry(3, 12, 12);
    const flashMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.8,
    });

    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    this.explosionGroup.add(flash);

    // Animate flash
    gsap.to(flash.scale, {
      duration: 0.3,
      x: 2,
      y: 2,
      z: 2,
      ease: "power2.out",
    });

    gsap.to(flashMaterial, {
      duration: 0.5,
      opacity: 0,
      ease: "power2.out",
    });
  }

  public destroy(): void {
    if (this.isActive) {
      this.isActive = false;
      this.scene.remove(this.explosionGroup);
    }
  }
}
