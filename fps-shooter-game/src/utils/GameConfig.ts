export const GAME_CONFIG = {
  // Arena settings
  ARENA_SIZE: 40,
  ARENA_HEIGHT: 20,

  // Player settings
  PLAYER_HEALTH: 100,
  PLAYER_SPEED: 300, // Increased from 150 to 300 for faster movement
  PLAYER_HEIGHT: 1.8,

  // Weapon settings
  WEAPON: {
    DAMAGE: 50,
    MAGAZINE_SIZE: 50,
    RELOAD_TIME: 2000, // milliseconds
    FIRE_RATE: 600, // rounds per minute
    ACCURACY_STANDING: 1.0,
    ACCURACY_MOVING: 0.7,
  },

  // Enemy settings
  ENEMY: {
    HEALTH: 100,
    SPEED: 180, // Increased from 120 to 180 for faster enemy movement
    DAMAGE: 25,
    ACCURACY: 0.6,
    FIRE_RATE: 1500, // milliseconds between shots
  },

  // Spawning settings
  SPAWN: {
    INITIAL_DELAY: 4000,
    MIN_DELAY: 1000,
    MAX_ENEMIES: 8,
    SPAWN_POINTS: 4,
  },

  // Camera settings
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    MOUSE_SENSITIVITY: 0.002,
  },
} as const;
