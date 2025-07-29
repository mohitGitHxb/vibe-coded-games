export enum GameState {
  MAIN_MENU = "main_menu",
  RACING = "racing",
  DESTROYED = "destroyed",
  GAME_OVER = "game_over",
  LEVEL_COMPLETE = "level_complete",
  LEVEL_TRANSITION = "level_transition",
  VICTORY = "victory", // Beat all levels
  PAUSED = "paused",
}

export interface GameScore {
  level: number;
  time: number;
  lives: number;
  collisions: number;
  powerUpsCollected: number;
}
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GameConfig {
  level1Speed: number;
  level2Speed: number;
  steeringRate: number;
}
