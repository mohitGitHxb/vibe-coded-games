import PF from "pathfinding";
import * as THREE from "three";
import { GAME_CONFIG } from "./GameConfig.js";

export class PathfindingGrid {
  private grid!: PF.Grid;
  private finder: PF.AStarFinder;
  private gridSize: number;
  private cellSize: number;
  private arenaSize: number;

  constructor() {
    this.arenaSize = GAME_CONFIG.ARENA_SIZE;
    this.cellSize = 1; // 1 unit per cell
    this.gridSize = Math.floor(this.arenaSize / this.cellSize);

    // Create walkable grid
    this.createGrid();
    this.finder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
    });
  }

  private createGrid(): void {
    const matrix: number[][] = [];

    // Initialize all cells as walkable (0)
    for (let y = 0; y < this.gridSize; y++) {
      matrix[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        matrix[y][x] = 0; // Walkable
      }
    }

    // Mark arena walls as unwalkable (1)
    const wallThickness = 2;
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        // Mark edges as walls
        if (
          x < wallThickness ||
          x >= this.gridSize - wallThickness ||
          y < wallThickness ||
          y >= this.gridSize - wallThickness
        ) {
          matrix[y][x] = 1; // Unwalkable
        }
      }
    }

    // Mark cover objects as unwalkable
    const coverPositions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 },
    ];

    coverPositions.forEach((cover) => {
      const gridX = this.worldToGrid(cover.x);
      const gridZ = this.worldToGrid(cover.z);

      // Mark 3x3 area around cover as unwalkable
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = gridX + dx;
          const y = gridZ + dy;
          if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            matrix[y][x] = 1;
          }
        }
      }
    });

    this.grid = new PF.Grid(matrix);
  }

  private worldToGrid(worldCoord: number): number {
    // Convert world coordinate to grid coordinate
    const gridCoord = Math.floor(
      (worldCoord + this.arenaSize / 2) / this.cellSize
    );
    return Math.max(0, Math.min(this.gridSize - 1, gridCoord));
  }

  private gridToWorld(gridCoord: number): number {
    // Convert grid coordinate to world coordinate
    return gridCoord * this.cellSize - this.arenaSize / 2 + this.cellSize / 2;
  }

  public findPath(start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] {
    const startX = this.worldToGrid(start.x);
    const startZ = this.worldToGrid(start.z);
    const endX = this.worldToGrid(end.x);
    const endZ = this.worldToGrid(end.z);

    // Clone grid for this search
    const gridClone = this.grid.clone();

    const path = this.finder.findPath(startX, startZ, endX, endZ, gridClone);

    // Convert path back to world coordinates
    const worldPath: THREE.Vector3[] = [];
    for (const [x, z] of path) {
      const worldX = this.gridToWorld(x);
      const worldZ = this.gridToWorld(z);
      worldPath.push(new THREE.Vector3(worldX, 1, worldZ));
    }

    return worldPath;
  }

  public isWalkable(position: THREE.Vector3): boolean {
    const gridX = this.worldToGrid(position.x);
    const gridZ = this.worldToGrid(position.z);

    if (
      gridX < 0 ||
      gridX >= this.gridSize ||
      gridZ < 0 ||
      gridZ >= this.gridSize
    ) {
      return false;
    }

    return this.grid.isWalkableAt(gridX, gridZ);
  }
}
