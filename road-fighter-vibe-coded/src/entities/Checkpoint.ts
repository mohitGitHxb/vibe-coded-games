import * as THREE from "three";
import { gsap } from "gsap";

export class Checkpoint {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public timeLimit: number;
  public name: string;
  public isReached: boolean = false;
  private bannerText!: THREE.Mesh;

  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3,
    timeLimit: number,
    name: string
  ) {
    this.position = position.clone();
    this.timeLimit = timeLimit;
    this.name = name;
    this.mesh = new THREE.Group();

    this.createCheckpoint();
    this.mesh.position.copy(position);
    scene.add(this.mesh);
  }

  private createCheckpoint(): void {
    // Create checkpoint banner spanning the road
    const bannerGeometry = new THREE.PlaneGeometry(30, 4);
    const bannerMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8,
    });
    this.bannerText = new THREE.Mesh(bannerGeometry, bannerMaterial);
    this.bannerText.rotation.x = -Math.PI / 2;
    this.bannerText.position.y = 0.1;
    this.mesh.add(this.bannerText);

    // Create checkpoint markers on sides
    this.createCheckpointMarkers();

    // Add pulsing animation
    this.addPulseAnimation();
  }

  private createCheckpointMarkers(): void {
    // Left and right checkpoint poles
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
    const poleMaterial = new THREE.MeshLambertMaterial({
      color: 0x00ff00,
      emissive: 0x003300,
    });

    const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
    leftPole.position.set(-15, 3, 0);
    this.mesh.add(leftPole);

    const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
    rightPole.position.set(15, 3, 0);
    this.mesh.add(rightPole);

    // Add flags on poles
    const flagGeometry = new THREE.PlaneGeometry(3, 2);
    const flagMaterial = new THREE.MeshLambertMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });

    const leftFlag = new THREE.Mesh(flagGeometry, flagMaterial);
    leftFlag.position.set(-13.5, 4, 0);
    this.mesh.add(leftFlag);

    const rightFlag = new THREE.Mesh(flagGeometry, flagMaterial);
    rightFlag.position.set(13.5, 4, 0);
    this.mesh.add(rightFlag);
  }

  private addPulseAnimation(): void {
    // Pulsing glow effect
    gsap.to(this.bannerText.scale, {
      duration: 1,
      x: 1.1,
      y: 1.1,
      z: 1.1,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });

    // Color cycling
    const material = this.bannerText.material as THREE.MeshLambertMaterial;
    gsap.to(material, {
      duration: 0.5,
      emissiveIntensity: 0.3,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });
  }

  public checkPlayerCollision(playerPosition: THREE.Vector3): boolean {
    if (this.isReached) return false;

    const distance = playerPosition.distanceTo(this.position);
    return distance < 8; // Checkpoint trigger radius
  }

  public activate(): void {
    this.isReached = true;

    // Change color to indicate completion
    const material = this.bannerText.material as THREE.MeshLambertMaterial;
    material.color.setHex(0x0000ff); // Blue when completed

    // Victory animation
    gsap.to(this.mesh.scale, {
      duration: 0.3,
      x: 1.3,
      y: 1.3,
      z: 1.3,
      yoyo: true,
      repeat: 1,
      ease: "back.out(1.7)",
    });
  }

  public destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
