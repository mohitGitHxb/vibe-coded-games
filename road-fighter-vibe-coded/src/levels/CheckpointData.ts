import * as THREE from "three";
import { Checkpoint } from "../entities/Checkpoint";
import { PlayerCar } from "../entities/PlayerCar";
import { GAME_CONFIG } from "../utils/Constants";

export interface CheckpointData {
  position: number;
  timeLimit: number;
  name: string;
}

export class CheckpointSystem {
  private scene: THREE.Scene;
  private checkpoints: Checkpoint[] = [];
  private currentCheckpointIndex: number = 0;
  private gameTimer: number = 0;
  private isTimerActive: boolean = false;
  private currentLevel: number = 1;

  constructor(scene: THREE.Scene, level: number = 1) {
    this.scene = scene;
    this.currentLevel = level;
    this.initializeLevel(level);
  }

  private initializeLevel(level: number): void {
    const checkpointData =
      level === 1 ? this.getLevel1Checkpoints() : this.getLevel2Checkpoints();

    console.log(
      `Creating Level ${level} with ${checkpointData.length} checkpoints!`
    );

    checkpointData.forEach((checkpointData, index) => {
      const checkpoint = new Checkpoint(
        this.scene,
        new THREE.Vector3(0, 0, checkpointData.position),
        checkpointData.timeLimit,
        checkpointData.name
      );
      this.checkpoints.push(checkpoint);
    });

    this.startTimer();
  }

  private getLevel1Checkpoints(): CheckpointData[] {
    return GAME_CONFIG.CHECKPOINT_POSITIONS.LEVEL_1.map((position, index) => ({
      position,
      timeLimit: GAME_CONFIG.CHECKPOINT_TIME_LIMITS.LEVEL_1[index],
      name:
        index === GAME_CONFIG.CHECKPOINT_POSITIONS.LEVEL_1.length - 1
          ? "FINISH LINE"
          : `CHECKPOINT ${index + 1}`,
    }));
  }

  private getLevel2Checkpoints(): CheckpointData[] {
    return GAME_CONFIG.CHECKPOINT_POSITIONS.LEVEL_2.map((position, index) => ({
      position,
      timeLimit: GAME_CONFIG.CHECKPOINT_TIME_LIMITS.LEVEL_2[index],
      name:
        index === GAME_CONFIG.CHECKPOINT_POSITIONS.LEVEL_2.length - 1
          ? "LEVEL 2 COMPLETE!"
          : `L2 CHECKPOINT ${index + 1}`,
    }));
  }

  public startTimer(): void {
    this.isTimerActive = true;
    this.gameTimer = 0;
  }

  public update(
    deltaTime: number,
    playerCar: PlayerCar
  ): "continue" | "checkpoint" | "timeout" | "level_complete" {
    if (!this.isTimerActive) return "continue";

    this.gameTimer += deltaTime;

    const currentCheckpoint = this.checkpoints[this.currentCheckpointIndex];
    if (!currentCheckpoint) return "level_complete";

    // Check if player reached checkpoint
    if (currentCheckpoint.checkPlayerCollision(playerCar.getPosition())) {
      console.log(
        `🏁 ${currentCheckpoint.name} REACHED! (${
          this.currentCheckpointIndex + 1
        }/${this.checkpoints.length})`
      );
      currentCheckpoint.activate();

      if (this.currentCheckpointIndex === this.checkpoints.length - 1) {
        this.isTimerActive = false;
        return "level_complete";
      }

      this.currentCheckpointIndex++;
      return "checkpoint";
    }

    // Check timeout
    if (this.gameTimer > currentCheckpoint.timeLimit) {
      console.log("⏰ TIME UP!");
      this.isTimerActive = false;
      return "timeout";
    }

    return "continue";
  }

  public getRemainingTime(): number {
    const currentCheckpoint = this.checkpoints[this.currentCheckpointIndex];
    if (!currentCheckpoint) return 0;

    return Math.max(0, currentCheckpoint.timeLimit - this.gameTimer);
  }

  public getCurrentCheckpointName(): string {
    const currentCheckpoint = this.checkpoints[this.currentCheckpointIndex];
    return currentCheckpoint ? currentCheckpoint.name : "COMPLETE";
  }

  public getProgress(): number {
    return this.currentCheckpointIndex / this.checkpoints.length;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public addTimeBonus(seconds: number): void {
    this.gameTimer = Math.max(0, this.gameTimer - seconds);
    console.log(`⏰ +${seconds} seconds added!`);
  }

  public destroy(): void {
    this.checkpoints.forEach((checkpoint) => checkpoint.destroy());
    this.checkpoints = [];
  }
}
