export const GAME_CONFIG = {
  // Physics
  WORLD_GRAVITY: { x: 0, y: 0, z: 0 },

  // HIGH-SPEED HIGHWAY RACING (Lamborghini speeds!)
  LEVEL_1_SPEED: 100, // Player base speed
  LEVEL_2_SPEED: 115, // Extreme speed for level 2
  STEERING_RATE: 35, // Faster steering response

  // Traffic speeds (ALL SLOWER THAN PLAYER - Road Fighter style!)
  TRAFFIC_SPEED_RATIO: 0.7, // Regular traffic at 70% of player speed
  SLOW_TRAFFIC_SPEED_RATIO: 0.5, // Slow traffic at 50%

  // Enemy AI speeds (NEVER faster than player!)
  ENEMY_AGGRESSIVE_SPEED_RATIO: 0.85, // 85% of player speed - fast but not faster
  ENEMY_DEFENSIVE_SPEED_RATIO: 0.4, // 40% of player speed - blocking
  ENEMY_RANDOM_SPEED_MIN: 0.6, // 60% minimum
  ENEMY_RANDOM_SPEED_MAX: 0.8, // 80% maximum

  // Enemy AI behavior constants
  ENEMY_DETECTION_RANGE: 40, // How far enemies detect player
  ENEMY_CLOSE_RANGE: 20, // Close proximity range
  ENEMY_LANE_CHANGE_COOLDOWN_MIN: 1.5, // Minimum seconds between lane changes
  ENEMY_LANE_CHANGE_COOLDOWN_MAX: 3.0, // Maximum seconds between lane changes
  ENEMY_AGGRESSIVE_CHANCE: 0.7, // 70% chance for aggressive action
  ENEMY_DEFENSIVE_CHANCE: 0.6, // 60% chance for defensive action
  ENEMY_RANDOM_CHANCE: 0.4, // 40% chance for random action

  // Lane changing
  LANE_CHANGE_SPEED: 4, // How fast cars change lanes
  LANE_CHANGE_PRECISION: 0.3, // How close to target before complete

  // Camera for high-speed racing
  CAMERA_HEIGHT: 45,
  CAMERA_FOLLOW_DISTANCE: 5,
  CAMERA_SMOOTHING: 0.15,

  // Road system
  ROAD_WIDTH: 24,
  LANE_WIDTH: 6,
  LANE_COUNT: 3,

  // Infinite road system
  ROAD_SEGMENT_LENGTH: 200,
  ACTIVE_SEGMENTS: 5,
  SEGMENT_TRANSITION_DISTANCE: 150,

  // Traffic system
  TRAFFIC_SPAWN_INTERVAL: 1.2, // Regular traffic spawn interval
  ENEMY_SPAWN_INTERVAL_MULTIPLIER: 2.0, // Enemy spawn = traffic_interval * this
  TRAFFIC_SPAWN_DISTANCE: 120,
  TRAFFIC_DESPAWN_DISTANCE: 80,
  MAX_ACTIVE_TRAFFIC: 8,
  MAX_ACTIVE_ENEMIES: 4, // Reduced from 5 to prevent spawn trapping

  // Lane positions for 3-lane highway
  LANE_POSITIONS: [-6, 0, 6],

  // Checkpoint system - REASONABLE time limits per checkpoint
  CHECKPOINT_TIME_LIMITS: {
    LEVEL_1: [45, 45, 45, 45, 45, 45, 45, 45, 45, 45], // 45 seconds per checkpoint
    LEVEL_2: [40, 40, 40, 40, 40, 40, 40, 40, 40, 40], // 40 seconds per checkpoint (harder)
  },

  CHECKPOINT_POSITIONS: {
    LEVEL_1: [
      -800, -1800, -2800, -3800, -4800, -5800, -6800, -7800, -8800, -9800,
    ],
    LEVEL_2: [
      -600, -1400, -2200, -3000, -3800, -4600, -5400, -6200, -7000, -7800,
    ],
  },

  // Power-up system
  POWERUP_SPAWN_INTERVAL: 8, // Seconds between power-up spawns
  POWERUP_MAX_ACTIVE: 2, // Maximum power-ups on screen
  POWERUP_COLLECTION_RADIUS: 3, // Collection distance
  POWERUP_FLOAT_HEIGHT: 1, // How high they float

  // Power-up durations
  SPEED_BOOST_DURATION: 5,
  INVINCIBILITY_DURATION: 8,
  TIME_BONUS_SECONDS: 10,

  // Game mechanics
  PLAYER_LIVES: 3,
  MAX_LIVES: 5,
  RESPAWN_TIME: 2.0,
  INVULNERABILITY_TIME: 3.0,

  // Collision detection
  COLLISION_DETECTION_RADIUS: 3,

  // Visual effects
  SPEED_LINES_OPACITY: 0.3,
  MOTION_BLUR_INTENSITY: 0.1,

  ENABLE_AUDIO: true,
  ENABLE_ENGINE_SOUND: true,
  ENABLE_BACKGROUND_MUSIC: true,
} as const;

export const VISUAL_CONFIG = {
  // Colors
  ROAD_COLOR: 0x2a2a2a,
  LANE_MARKING_COLOR: 0xffffff,
  GRASS_COLOR: 0x228b22,
  CHECKPOINT_COLOR: 0x00ff00,

  // Enemy car colors
  ENEMY_AGGRESSIVE_COLOR: 0xff0000, // Red
  ENEMY_AGGRESSIVE_EMISSIVE: 0x330000, // Dark red glow
  ENEMY_DEFENSIVE_COLOR: 0x000088, // Dark blue
  ENEMY_RANDOM_COLORS: [0x00aa00, 0xffaa00, 0xaa00aa, 0x00aaaa, 0xaa8800],

  // Power-up colors
  POWERUP_SPEED_COLOR: 0x00ff00,
  POWERUP_INVINCIBILITY_COLOR: 0x0099ff,
  POWERUP_LIFE_COLOR: 0xff0099,
  POWERUP_TIME_COLOR: 0xffff00,

  // Sizes
  LANE_MARKING_WIDTH: 0.3,
  LANE_MARKING_LENGTH: 8,
  LANE_MARKING_GAP: 12,

  // Car dimensions
  PLAYER_CAR_SIZE: { width: 2.2, height: 0.6, length: 4.5 },
  TRAFFIC_CAR_SIZE: { width: 2.0, height: 0.5, length: 4.0 },

  // Effects
  REAR_LIGHT_SIZE: 0.15,
  SPOILER_SIZE: { width: 1.8, height: 0.1, length: 0.3 },
  RACING_STRIPE_SIZE: { width: 0.3, height: 0.01, length: 4 },
} as const;

export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.6,
  ENGINE_VOLUME: 0.2,

  // Audio file paths (we'll use Web Audio API to generate sounds)
  SOUNDS: {
    ENGINE_IDLE: "engine_idle",
    ENGINE_HIGH: "engine_high",
    COLLISION: "collision",
    EXPLOSION: "explosion",
    POWERUP_COLLECT: "powerup_collect",
    CHECKPOINT: "checkpoint",
    LEVEL_COMPLETE: "level_complete",
    VICTORY: "victory",
    GAME_OVER: "game_over",
    TIRE_SCREECH: "tire_screech",
    BACKGROUND_MUSIC_L1: "bg_music_l1",
    BACKGROUND_MUSIC_L2: "bg_music_l2",
  },

  // Engine sound configuration
  ENGINE_MIN_FREQUENCY: 80, // Hz - idle engine
  ENGINE_MAX_FREQUENCY: 400, // Hz - max speed engine
  ENGINE_MIN_SPEED: 30, // Minimum speed for engine sound
  ENGINE_MAX_SPEED: 120, // Maximum speed for engine sound

  // Effect durations
  EXPLOSION_DURATION: 2.0,
  POWERUP_DURATION: 0.8,
  CHECKPOINT_DURATION: 1.5,
} as const;
