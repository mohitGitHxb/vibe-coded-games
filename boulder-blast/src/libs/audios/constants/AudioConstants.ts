/**
 * Audio Factory Constants
 */

// Default audio properties for each sound type
export const AUDIO_DEFAULTS = {
  ENGINE: {
    VOLUME: 0.7,
    LOOP: true,
    REF_DISTANCE: 20,
    ROLLOFF_FACTOR: 2,
    MAX_DISTANCE: 100,
    DISTANCE_MODEL: "inverse" as const,
  },
  LASER_SHOT: {
    VOLUME: 0.8,
    LOOP: false,
    REF_DISTANCE: 10,
    ROLLOFF_FACTOR: 1,
    MAX_DISTANCE: 50,
    DISTANCE_MODEL: "linear" as const,
  },
  BACKGROUND_MUSIC: {
    VOLUME: 0.4,
    LOOP: true,
  },
  FOOTSTEPS_ON_GRASS: {
    VOLUME: 0.6,
    LOOP: false,
    REF_DISTANCE: 5,
    ROLLOFF_FACTOR: 1.5,
    MAX_DISTANCE: 30,
    DISTANCE_MODEL: "inverse" as const,
  },
  EXPLOSION: {
    VOLUME: 1.0,
    LOOP: false,
    REF_DISTANCE: 30,
    ROLLOFF_FACTOR: 1,
    MAX_DISTANCE: 200,
    DISTANCE_MODEL: "exponential" as const,
  },
  UI_CLICK: {
    VOLUME: 0.5,
    LOOP: false,
  },
  POWER_UP_CHIME: {
    VOLUME: 0.7,
    LOOP: false,
  },
  WATER_DROPS: {
    VOLUME: 0.4,
    LOOP: true,
    REF_DISTANCE: 8,
    ROLLOFF_FACTOR: 2,
    MAX_DISTANCE: 40,
    DISTANCE_MODEL: "inverse" as const,
  },
  WIND_AMBIENT: {
    VOLUME: 0.3,
    LOOP: true,
  },
  MACHINE_HUM: {
    VOLUME: 0.5,
    LOOP: true,
    REF_DISTANCE: 15,
    ROLLOFF_FACTOR: 1.5,
    MAX_DISTANCE: 60,
    DISTANCE_MODEL: "inverse" as const,
  },
  SWORD_CLASH: {
    VOLUME: 0.8,
    LOOP: false,
    REF_DISTANCE: 8,
    ROLLOFF_FACTOR: 1,
    MAX_DISTANCE: 40,
    DISTANCE_MODEL: "linear" as const,
  },
  HEARTBEAT: {
    VOLUME: 0.6,
    LOOP: true,
    PLAYBACK_RATE: 1.2,
  },
} as const;

// Default audio file names
export const AUDIO_FILES = {
  ENGINE: "engine.ogg",
  LASER_SHOT: "laser_shot.ogg",
  BACKGROUND_MUSIC: "background_music.ogg",
  FOOTSTEPS_ON_GRASS: "footsteps_grass.ogg",
  EXPLOSION: "explosion.ogg",
  UI_CLICK: "ui_click.ogg",
  POWER_UP_CHIME: "powerup_chime.ogg",
  WATER_DROPS: "water_drops.ogg",
  WIND_AMBIENT: "wind_ambient.ogg",
  MACHINE_HUM: "machine_hum.ogg",
  SWORD_CLASH: "sword_clash.ogg",
  HEARTBEAT: "heartbeat.ogg",
} as const;

// Synthetic audio generation parameters
export const SYNTHETIC_AUDIO_CONFIG = {
  ENGINE: {
    DURATION: 2,
    BASE_FREQUENCY: 80,
    FREQUENCY_VARIATION: 20,
    HARMONICS: [0.3, 0.2, 0.1],
    NOISE_LEVEL: 0.1,
    AMPLITUDE: 0.5,
  },
  LASER: {
    DURATION: 0.3,
    START_FREQUENCY: 800,
    END_FREQUENCY: 200,
    DECAY_RATE: 8,
    AMPLITUDE: 0.7,
  },
  EXPLOSION: {
    DURATION: 1.5,
    DECAY_RATE: 3,
    LOW_FREQ: 60,
    LOW_FREQ_AMPLITUDE: 0.5,
    NOISE_AMPLITUDE: 2,
    AMPLITUDE: 0.8,
  },
  CLICK: {
    DURATION: 0.1,
    FREQUENCY: 1000,
    DECAY_RATE: 50,
    AMPLITUDE: 0.6,
  },
  CHIME: {
    DURATION: 1.0,
    FREQUENCIES: [523.25, 659.25, 783.99], // C5, E5, G5
    AMPLITUDES: [0.4, 0.3, 0.3],
    DECAY_RATE: 2,
  },
  HEARTBEAT: {
    DURATION: 1.0,
    FIRST_BEAT: { START: 0.1, END: 0.2, FREQUENCY: 60, AMPLITUDE: 0.8 },
    SECOND_BEAT: { START: 0.3, END: 0.4, FREQUENCY: 80, AMPLITUDE: 0.6 },
  },
  DEFAULT_TONE: {
    FREQUENCY: 440,
    DURATION: 0.5,
    DECAY_RATE: 2,
    AMPLITUDE: 0.3,
  },
} as const;

// Cache and performance constants
export const AUDIO_CACHE_CONFIG = {
  DEFAULT_AUDIO_BASE_PATH: "/sounds/",
  MAX_CACHE_AGE: 5 * 60 * 1000, // 5 minutes
  MIN_USAGE_COUNT: 1,
} as const;
