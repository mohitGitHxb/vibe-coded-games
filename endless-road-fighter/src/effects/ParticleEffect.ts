import * as THREE from "three";

export interface ParticleEffect {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
  opacity: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: ParticleEffect[] = [];
  private nextParticleId: number = 0;
  private particleMeshes: Map<number, THREE.Mesh> = new Map();

  // Particle geometries and materials
  private smokeGeometry!: THREE.PlaneGeometry;
  private smokeMaterial!: THREE.MeshBasicMaterial;
  private sparkGeometry!: THREE.SphereGeometry;
  private sparkMaterial!: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeParticleAssets();
  }

  private initializeParticleAssets(): void {
    // Smoke particles (exhaust) - scaled up for larger vehicles
    this.smokeGeometry = new THREE.PlaneGeometry(1.0, 1.0); // Doubled from 0.5×0.5
    this.smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    // Spark particles (collision effects) - scaled up
    this.sparkGeometry = new THREE.SphereGeometry(0.1, 8, 6); // Doubled from 0.05
    this.sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
    });
  }
  // Exhaust smoke from vehicles - scaled up for larger vehicles
  public createExhaustSmoke(
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ): void {
    const smokeCount = 4 + Math.floor(Math.random() * 6); // 4-9 particles for larger scale

    for (let i = 0; i < smokeCount; i++) {
      const particle: ParticleEffect = {
        id: this.nextParticleId++,
        position: position.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2.0, // Doubled spread
            Math.random() * 0.8,
            (Math.random() - 0.5) * 1.2
          )
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4, // Doubled velocity
          3 + Math.random() * 4,
          -Math.abs(velocity.z) * 0.3 - Math.random() * 4
        ),
        life: 2.5 + Math.random() * 2.0, // Longer lasting for larger scale
        maxLife: 4.0,
        size: 1.6 + Math.random() * 1.6, // Much larger particles (doubled)
        color: new THREE.Color(
          0.3 + Math.random() * 0.2,
          0.3 + Math.random() * 0.2,
          0.3 + Math.random() * 0.2
        ),
        opacity: 0.4 + Math.random() * 0.3,
      };

      this.particles.push(particle);
      this.createParticleMesh(particle, "smoke");
    }
  }
  // Collision sparks - bigger and more dramatic
  public createCollisionSparks(position: THREE.Vector3): void {
    const sparkCount = 16 + Math.floor(Math.random() * 20); // 16-36 sparks for bigger impact

    for (let i = 0; i < sparkCount; i++) {
      const angle =
        (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
      const speed = 6 + Math.random() * 12; // Much faster sparks

      const particle: ParticleEffect = {
        id: this.nextParticleId++,
        position: position
          .clone()
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 1.0,
              Math.random() * 2.0,
              (Math.random() - 0.5) * 1.0
            )
          ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          3 + Math.random() * 6,
          Math.sin(angle) * speed
        ),
        life: 1.2 + Math.random() * 1.8, // Longer lasting
        maxLife: 2.5,
        size: 0.3 + Math.random() * 0.3, // Bigger sparks (doubled)
        color: new THREE.Color(
          1.0,
          0.6 + Math.random() * 0.4,
          Math.random() * 0.3
        ),
        opacity: 1.0,
      };

      this.particles.push(particle);
      this.createParticleMesh(particle, "spark");
    }
  }

  // Power-up collection effect - more spectacular for larger scale
  public createPowerUpEffect(
    position: THREE.Vector3,
    color: THREE.Color
  ): void {
    const particleCount = 25 + Math.floor(Math.random() * 20); // 25-45 particles

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 4 + Math.random() * 8; // Faster spread

      const particle: ParticleEffect = {
        id: this.nextParticleId++,
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          4 + Math.random() * 6,
          Math.sin(angle) * speed
        ),
        life: 2.0 + Math.random() * 2.5, // Longer lasting
        maxLife: 3.5,
        size: 0.8 + Math.random() * 1.2, // Much larger particles (doubled)
        color: color.clone(),
        opacity: 0.8,
      };

      this.particles.push(particle);
      this.createParticleMesh(particle, "spark");
    }
  }

  // Speed boost trail effect - more dramatic for larger vehicles
  public createSpeedTrail(position: THREE.Vector3): void {
    const trailCount = 6 + Math.floor(Math.random() * 6); // 6-11 particles

    for (let i = 0; i < trailCount; i++) {
      const particle: ParticleEffect = {
        id: this.nextParticleId++,
        position: position.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 4.0, // Much wider spread for larger car
            0.4 + Math.random() * 0.8,
            -4 - Math.random() * 6
          )
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2 + Math.random() * 3,
          -5 - Math.random() * 6
        ),
        life: 1.8 + Math.random() * 1.5, // Longer trails
        maxLife: 2.5,
        size: 1.6 + Math.random() * 1.2, // Much larger trail particles (doubled)
        color: new THREE.Color(0.0, 0.5 + Math.random() * 0.5, 1.0),
        opacity: 0.6,
      };

      this.particles.push(particle);
      this.createParticleMesh(particle, "smoke");
    }
  }
  public update(deltaTime: number): void {
    this.updateParticles(deltaTime);
    this.removeDeadParticles();
  }

  private updateParticles(deltaTime: number): void {
    for (const particle of this.particles) {
      // Update particle life
      particle.life -= deltaTime;

      // Update position
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );

      // Update visual properties based on life
      const lifeRatio = particle.life / particle.maxLife;
      particle.opacity = lifeRatio;
      particle.size = 0.2 + (1 - lifeRatio) * 0.8; // Grow over time

      // Apply gravity to some particles
      particle.velocity.y -= 2.0 * deltaTime; // Gravity effect

      // Update mesh
      const mesh = this.particleMeshes.get(particle.id);
      if (mesh) {
        mesh.position.copy(particle.position);
        mesh.scale.setScalar(particle.size);
        (mesh.material as THREE.MeshBasicMaterial).opacity = particle.opacity;
        (mesh.material as THREE.MeshBasicMaterial).color = particle.color;
      }
    }
  }

  private removeDeadParticles(): void {
    const deadParticles = this.particles.filter((p) => p.life <= 0);

    for (const particle of deadParticles) {
      const mesh = this.particleMeshes.get(particle.id);
      if (mesh) {
        this.scene.remove(mesh);
        this.particleMeshes.delete(particle.id);
      }
    }

    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private createParticleMesh(
    particle: ParticleEffect,
    type: "smoke" | "spark"
  ): void {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    if (type === "smoke") {
      geometry = this.smokeGeometry;
      material = this.smokeMaterial.clone();
    } else {
      geometry = this.sparkGeometry;
      material = this.sparkMaterial.clone();
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(particle.position);
    mesh.scale.setScalar(particle.size);

    // Make smoke face camera
    if (type === "smoke") {
      mesh.lookAt(mesh.position.x, mesh.position.y + 1, mesh.position.z - 10); // Fixed direction
    }

    this.scene.add(mesh);
    this.particleMeshes.set(particle.id, mesh);
  }

  public dispose(): void {
    // Remove all particle meshes
    for (const mesh of this.particleMeshes.values()) {
      this.scene.remove(mesh);
    }

    this.particleMeshes.clear();
    this.particles = [];

    // Dispose geometries and materials
    this.smokeGeometry.dispose();
    this.smokeMaterial.dispose();
    this.sparkGeometry.dispose();
    this.sparkMaterial.dispose();
  }
}
