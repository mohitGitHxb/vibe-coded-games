import * as THREE from "three";
import { GAME_CONFIG, COLORS } from "../utils/Constants";

export class Arena {
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createArena();
  }

  private createArena(): void {
    this.createFloor();
    this.createWalls();
    this.createGrid();
  }

  private createFloor(): void {
    const geometry = new THREE.PlaneGeometry(
      GAME_CONFIG.ARENA.WIDTH,
      GAME_CONFIG.ARENA.HEIGHT
    );
    const material = new THREE.MeshLambertMaterial({
      color: COLORS.ARENA_FLOOR,
      transparent: true,
      opacity: 0.8,
    });

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  private createWalls(): void {
    const wallHeight = 50;
    const material = new THREE.MeshLambertMaterial({
      color: COLORS.ARENA_WALLS,
    });

    const wallConfigs = [
      {
        position: [0, wallHeight / 2, -GAME_CONFIG.ARENA.HEIGHT / 2],
        size: [GAME_CONFIG.ARENA.WIDTH, wallHeight, 10],
      },
      {
        position: [0, wallHeight / 2, GAME_CONFIG.ARENA.HEIGHT / 2],
        size: [GAME_CONFIG.ARENA.WIDTH, wallHeight, 10],
      },
      {
        position: [-GAME_CONFIG.ARENA.WIDTH / 2, wallHeight / 2, 0],
        size: [10, wallHeight, GAME_CONFIG.ARENA.HEIGHT],
      },
      {
        position: [GAME_CONFIG.ARENA.WIDTH / 2, wallHeight / 2, 0],
        size: [10, wallHeight, GAME_CONFIG.ARENA.HEIGHT],
      },
    ];

    wallConfigs.forEach((config) => {
      const geometry = new THREE.BoxGeometry(
        config.size[0],
        config.size[1],
        config.size[2]
      );
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        config.position[0],
        config.position[1],
        config.position[2]
      );
      mesh.castShadow = true;
      this.scene.add(mesh);
    });
  }

  private createGrid(): void {
    const gridHelper = new THREE.GridHelper(
      Math.max(GAME_CONFIG.ARENA.WIDTH, GAME_CONFIG.ARENA.HEIGHT),
      20,
      COLORS.GRID_MAJOR,
      COLORS.GRID_MINOR
    );
    gridHelper.rotateX(Math.PI / 2);
    this.scene.add(gridHelper);
  }
}
