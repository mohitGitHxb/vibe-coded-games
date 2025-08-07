import * as THREE from "three";
import { gsap } from "gsap";
import type { ISkybox } from "../types/SkyboxTypes";

export class SpaceSky implements ISkybox {
  private starLayers: THREE.Points[] = [];
  private nebulae: THREE.Mesh[] = [];
  private shootingStars: THREE.Mesh[] = [];
  private twinkleStars: THREE.Points[] = [];

  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(3000, 64, 64); // Increased for better coverage
    const skyMaterial = this.createSpaceMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    // Create the ultimate space experience
    await this.createCosmicMasterpiece(skyMesh);

    return skyMesh;
  }

  private createSpaceMaterial(): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
      color: 0x000011, // Deep space blue-black
      side: THREE.BackSide,
    });
  }

  /**
   * 🌌 THE COSMIC MASTERPIECE - Peak Creativity Unleashed! 🌌
   * Creating the most beautiful animated space skybox ever conceived
   */
  private async createCosmicMasterpiece(
    skyMesh: THREE.Object3D
  ): Promise<void> {
    console.log("🌟 Creating cosmic masterpiece with peak creativity...");

    try {
      // Start simple and build up
      console.log("🌟 Step 1: Creating animated star layers...");
      await this.createAnimatedStarLayers(skyMesh);

      console.log("🌟 Step 2: Creating twinkling stars...");
      this.createTwinklingStars(skyMesh);

      console.log("🌟 Step 3: Creating animated nebulae...");
      this.createAnimatedNebulae(skyMesh);

      console.log("🌟 Step 4: Creating shooting stars...");
      this.createShootingStarSystem(skyMesh);

      console.log("🌟 Step 5: Creating cosmic dust...");
      this.createCosmicDust(skyMesh);

      console.log("🌟 Step 6: Creating distant galaxies...");
      this.createDistantGalaxies(skyMesh);

      console.log("✨ Cosmic masterpiece complete - Welcome to the universe!");
    } catch (error) {
      console.error("❌ Error creating cosmic masterpiece:", error);
      console.error(
        "❌ Error details:",
        error instanceof Error ? error.message : String(error)
      );

      // Fallback to simple starfield if complex version fails
      this.createFallbackStarfield(skyMesh);
    }
  }

  /**
   * 🌟 Create multiple layers of animated stars with different speeds
   */
  private async createAnimatedStarLayers(
    skyMesh: THREE.Object3D
  ): Promise<void> {
    const layerConfigs = [
      { count: 2000, size: 4, color: 0xffffff, speed: 0.1, radius: 2900 }, // Bright foreground stars
      { count: 1500, size: 2, color: 0xccccff, speed: 0.05, radius: 2800 }, // Medium stars
      { count: 3000, size: 1, color: 0x9999aa, speed: 0.02, radius: 2700 }, // Distant stars
      { count: 1000, size: 3, color: 0xffffaa, speed: 0.08, radius: 2950 }, // Warm stars
    ];

    for (const config of layerConfigs) {
      const starField = this.createStarField(config);
      skyMesh.add(starField);
      this.starLayers.push(starField);

      // Animate this layer with GSAP
      gsap.to(starField.rotation, {
        y: Math.PI * 2,
        duration: 200 / config.speed, // Slower = longer duration
        ease: "none",
        repeat: -1,
      });
    }
  }

  /**
   * ✨ Create individual star field with specified configuration
   */
  private createStarField(config: {
    count: number;
    size: number;
    color: number;
    speed: number;
    radius: number;
  }): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < config.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = config.radius + (Math.random() - 0.5) * 100;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);

      // Add color variation
      const color = new THREE.Color(config.color);
      const hue = Math.random() * 0.1 - 0.05; // Slight hue variation
      color.offsetHSL(hue, 0, Math.random() * 0.3 - 0.15);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: config.size,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.8 + Math.random() * 0.2,
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * ⭐ Create twinkling star effects that pulse with GSAP
   */
  private createTwinklingStars(skyMesh: THREE.Object3D): void {
    const twinkleConfigs = [
      { count: 200, size: 6, color: 0xffffff, speed: 0.03, radius: 2850 },
      { count: 150, size: 8, color: 0x88aaff, speed: 0.02, radius: 2750 },
      { count: 100, size: 5, color: 0xffaa88, speed: 0.01, radius: 2650 },
    ];

    twinkleConfigs.forEach((config, index) => {
      const twinkleField = this.createStarField(config);
      skyMesh.add(twinkleField);
      this.twinkleStars.push(twinkleField);

      // Create pulsing twinkle effect
      gsap.to(twinkleField.material, {
        opacity: 0.2,
        duration: 1.5 + index * 0.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
  }

  /**
   * 🌈 Create animated colorful nebulae with flowing colors
   */
  private createAnimatedNebulae(skyMesh: THREE.Object3D): void {
    const nebulaConfigs = [
      { color: 0xff4d6d, position: [800, 400, -600], size: 200 },
      { color: 0x4d79ff, position: [-600, -300, 800], size: 250 },
      { color: 0xff9f4d, position: [400, -600, -400], size: 180 },
      { color: 0x4dff79, position: [-800, 600, 200], size: 220 },
      { color: 0x9f4dff, position: [200, 200, 900], size: 190 },
    ];

    nebulaConfigs.forEach((config, index) => {
      const nebula = this.createNebula(config);
      skyMesh.add(nebula);
      this.nebulae.push(nebula);

      // Animate nebula with slow rotation and pulsing
      gsap.to(nebula.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 1.5,
        z: Math.PI * 0.5,
        duration: 60 + index * 10,
        ease: "none",
        repeat: -1,
      });

      gsap.to(nebula.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 8 + index * 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Color shifting effect
      const material = nebula.material as THREE.MeshBasicMaterial;
      gsap.to(material.color, {
        r: Math.random(),
        g: Math.random(),
        b: Math.random(),
        duration: 20 + index * 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
  }

  /**
   * 🌫️ Create individual nebula
   */
  private createNebula(config: {
    color: number;
    position: number[];
    size: number;
  }): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(config.size, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });

    const nebula = new THREE.Mesh(geometry, material);
    nebula.position.set(
      config.position[0],
      config.position[1],
      config.position[2]
    );
    return nebula;
  }

  /**
   * 💫 Create shooting star system with periodic shooting stars
   */
  private createShootingStarSystem(skyMesh: THREE.Object3D): void {
    // Create shooting stars periodically
    const createShootingStar = () => {
      const shootingStar = this.createShootingStar();
      skyMesh.add(shootingStar);
      this.shootingStars.push(shootingStar);

      // Animate shooting star trajectory
      const startPos = shootingStar.position.clone();
      const endPos = new THREE.Vector3(
        startPos.x - 1000 - Math.random() * 500,
        startPos.y - 800 - Math.random() * 400,
        startPos.z - Math.random() * 200
      );

      gsap.to(shootingStar.position, {
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        duration: 2 + Math.random() * 2,
        ease: "power2.out",
        onComplete: () => {
          skyMesh.remove(shootingStar);
          shootingStar.geometry.dispose();
          (shootingStar.material as THREE.Material).dispose();
          const index = this.shootingStars.indexOf(shootingStar);
          if (index > -1) this.shootingStars.splice(index, 1);
        },
      });

      // Fade out effect
      gsap.to(shootingStar.material, {
        opacity: 0,
        duration: 2.5,
        ease: "power2.in",
      });
    };

    // Create shooting stars every 3-8 seconds
    const scheduleNextShootingStar = () => {
      setTimeout(() => {
        createShootingStar();
        scheduleNextShootingStar();
      }, 3000 + Math.random() * 5000);
    };

    scheduleNextShootingStar();
  }

  /**
   * ⭐ Create individual shooting star
   */
  private createShootingStar(): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(0.5, 2, 80, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    const shootingStar = new THREE.Mesh(geometry, material);

    // Random starting position on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.8 + 0.1; // Avoid poles
    const radius = 1500;

    shootingStar.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    // Orient towards trajectory
    shootingStar.lookAt(0, 0, 0);
    shootingStar.rotateX(Math.PI * 0.5);

    return shootingStar;
  }

  /**
   * 🌌 Create cosmic dust particles for depth
   */
  private createCosmicDust(skyMesh: THREE.Object3D): void {
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions: number[] = [];
    const dustColors: number[] = [];

    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 2600 + Math.random() * 300;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      dustPositions.push(x, y, z);

      // Purple-blue cosmic dust colors
      const color = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.2, // Purple to blue hues
        0.3 + Math.random() * 0.4,
        0.1 + Math.random() * 0.3
      );
      dustColors.push(color.r, color.g, color.b);
    }

    dustGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(dustPositions, 3)
    );
    dustGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(dustColors, 3)
    );

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    skyMesh.add(dust);

    // Slow rotation for cosmic dust
    gsap.to(dust.rotation, {
      x: Math.PI * 2,
      y: Math.PI * 1.5,
      duration: 300,
      ease: "none",
      repeat: -1,
    });
  }

  /**
   * 🌌 Create distant galaxies for ultimate depth
   */
  private createDistantGalaxies(skyMesh: THREE.Object3D): void {
    const galaxyPositions = [
      [1200, 600, -800],
      [-900, -700, 1100],
      [700, -900, -600],
      [-1100, 800, 400],
    ];

    galaxyPositions.forEach((position, index) => {
      const galaxy = this.createGalaxy();
      galaxy.position.set(position[0], position[1], position[2]);
      skyMesh.add(galaxy);

      // Very slow galaxy rotation
      gsap.to(galaxy.rotation, {
        z: Math.PI * 2,
        duration: 400 + index * 50,
        ease: "none",
        repeat: -1,
      });
    });
  }

  /**
   * 🌀 Create spiral galaxy effect
   */
  private createGalaxy(): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Create spiral galaxy pattern
    for (let i = 0; i < 1000; i++) {
      const angle = i * 0.02;
      const radius = i * 0.2;
      const height = (Math.random() - 0.5) * 20;

      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;

      positions.push(x, y, z);

      // Galaxy colors - purple to blue to white
      const color = new THREE.Color().setHSL(
        0.7 - (i / 1000) * 0.3,
        0.5 + (i / 1000) * 0.3,
        0.3 + (i / 1000) * 0.4
      );
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    return new THREE.Points(geometry, material);
  }

  /**
   * 🔄 Fallback simple starfield if complex version fails
   */
  private createFallbackStarfield(skyMesh: THREE.Object3D): void {
    console.log("🌟 Creating fallback starfield...");

    // Simple star field
    const starsGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (let i = 0; i < 2000; i++) {
      const radius = 2900 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    skyMesh.add(stars);

    // Simple rotation animation
    gsap.to(stars.rotation, {
      y: Math.PI * 2,
      duration: 200,
      ease: "none",
      repeat: -1,
    });

    console.log("✅ Fallback starfield created successfully!");
  }
}
