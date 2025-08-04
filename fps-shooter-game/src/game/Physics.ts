import * as CANNON from "cannon-es";
import { GAME_CONFIG } from "../utils/GameConfig.js";

export class PhysicsWorld {
  public world: CANNON.World;
  private groundBody!: CANNON.Body;
  private wallBodies: CANNON.Body[] = [];

  constructor() {
    this.world = new CANNON.World();
    this.setupWorld();
    this.createArenaPhysics();
  }

  private setupWorld(): void {
    // Set gravity
    this.world.gravity.set(0, -30, 0);

    // Set collision detection
    this.world.broadphase = new CANNON.NaiveBroadphase();

    // Fix: Use solver properties correctly
    this.world.solver = new CANNON.GSSolver();
    (this.world.solver as CANNON.GSSolver).iterations = 10;

    // Add contact material for player-ground interaction
    const groundMaterial = new CANNON.Material("ground");
    const playerMaterial = new CANNON.Material("player");

    const playerGroundContact = new CANNON.ContactMaterial(
      playerMaterial,
      groundMaterial,
      {
        friction: 0.3,
        restitution: 0.0,
      }
    );

    this.world.addContactMaterial(playerGroundContact);
  }

  private createArenaPhysics(): void {
    const arenaSize = GAME_CONFIG.ARENA_SIZE;
    const wallHeight = GAME_CONFIG.ARENA_HEIGHT;

    // Create ground physics body
    const groundShape = new CANNON.Box(
      new CANNON.Vec3(arenaSize / 2, 0.1, arenaSize / 2)
    );
    this.groundBody = new CANNON.Body({
      mass: 0, // Static body
      shape: groundShape,
      position: new CANNON.Vec3(0, -0.1, 0),
      material: new CANNON.Material("ground"),
    });
    this.world.addBody(this.groundBody);

    // Create wall physics bodies
    const wallConfigs = [
      {
        pos: [0, wallHeight / 2, -arenaSize / 2],
        size: [arenaSize / 2, wallHeight / 2, 0.5],
      }, // North
      {
        pos: [0, wallHeight / 2, arenaSize / 2],
        size: [arenaSize / 2, wallHeight / 2, 0.5],
      }, // South
      {
        pos: [arenaSize / 2, wallHeight / 2, 0],
        size: [0.5, wallHeight / 2, arenaSize / 2],
      }, // East
      {
        pos: [-arenaSize / 2, wallHeight / 2, 0],
        size: [0.5, wallHeight / 2, arenaSize / 2],
      }, // West
    ];

    wallConfigs.forEach((config) => {
      const wallShape = new CANNON.Box(
        new CANNON.Vec3(config.size[0], config.size[1], config.size[2])
      );
      const wallBody = new CANNON.Body({
        mass: 0,
        shape: wallShape,
        position: new CANNON.Vec3(config.pos[0], config.pos[1], config.pos[2]),
      });
      this.world.addBody(wallBody);
      this.wallBodies.push(wallBody);
    });

    // Create cover object physics
    this.createCoverPhysics();
  }

  private createCoverPhysics(): void {
    const positions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 },
    ];

    positions.forEach((pos) => {
      const coverShape = new CANNON.Box(new CANNON.Vec3(1.5, 1, 1.5));
      const coverBody = new CANNON.Body({
        mass: 0,
        shape: coverShape,
        position: new CANNON.Vec3(pos.x, 1, pos.z),
      });
      this.world.addBody(coverBody);
    });
  }

  public step(deltaTime: number): void {
    this.world.step(deltaTime);
  }

  public addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  public removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }
}
