import * as CANNON from "cannon-es";
import * as THREE from "three";

export interface BulletHit {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  object?: THREE.Object3D;
}

export class BulletSystem {
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;

  constructor(scene: THREE.Scene, physicsWorld: CANNON.World) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
  }

  public raycast(ray: THREE.Ray, maxDistance: number = 100): BulletHit | null {
    // Create raycaster for Three.js objects
    const raycaster = new THREE.Raycaster(ray.origin, ray.direction);
    raycaster.far = maxDistance;

    // Get all intersectable objects (walls, cover, enemies)
    const intersectable = this.scene.children.filter(
      (child) => child.userData.intersectable !== false
    );

    const intersections = raycaster.intersectObjects(intersectable, true);

    if (intersections.length > 0) {
      const hit = intersections[0];
      return {
        point: hit.point,
        normal: hit.face?.normal || new THREE.Vector3(0, 1, 0),
        distance: hit.distance,
        object: hit.object,
      };
    }

    return null;
  }

  public createImpactEffect(
    hitPoint: THREE.Vector3,
    normal: THREE.Vector3
  ): void {
    // Create spark particles - Fix: Properly scope geometry variable
    const particleCount = 8;
    const particles: {
      mesh: THREE.Mesh;
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const sparkGeometry = new THREE.SphereGeometry(0.02, 4, 4);
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5),
      });

      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
      spark.position.copy(hitPoint);

      // Random velocity for sparks
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      )
        .normalize()
        .multiplyScalar(0.5 + Math.random() * 1.5);

      spark.userData.velocity = velocity;
      particles.push({
        mesh: spark,
        geometry: sparkGeometry,
        material: sparkMaterial,
      });
      this.scene.add(spark);
    }

    // Animate and remove particles
    const animateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (particle.mesh.parent) {
          const velocity = particle.mesh.userData.velocity as THREE.Vector3;
          particle.mesh.position.add(velocity.multiplyScalar(0.02));
          velocity.y -= 0.01; // Gravity

          // Fade out
          const material = particle.material as THREE.MeshBasicMaterial;
          material.opacity -= 0.05;
          material.transparent = true;

          if (material.opacity <= 0) {
            this.scene.remove(particle.mesh);
            particle.geometry.dispose();
            material.dispose();
            particles.splice(i, 1);
          }
        }
      }

      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };

    animateParticles();

    // Create impact flash
    const flashLight = new THREE.PointLight(0xffffff, 1, 3);
    flashLight.position.copy(hitPoint);
    this.scene.add(flashLight);

    setTimeout(() => {
      this.scene.remove(flashLight);
    }, 100);
  }
}
