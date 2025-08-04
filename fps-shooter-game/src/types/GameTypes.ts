export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameTime: number;
  score: number;
  playerHealth: number;
}

export interface PlayerState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
  health: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
}

export interface EnemyData {
  id: string;
  position: { x: number; y: number; z: number };
  health: number;
  isAlive: boolean;
}

export interface WeaponConfig {
  damage: number;
  fireRate: number;
  magazineSize: number;
  reloadTime: number;
  accuracy: number;
}
