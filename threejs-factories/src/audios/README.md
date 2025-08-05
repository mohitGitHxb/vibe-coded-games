# Audio Factory 🔊

A modular audio factory for Three.js with synthetic sound generation and custom audio file support.

## 📦 Quick Usage

```typescript
import { AudioFactory } from "./audios";

// Initialize with Three.js AudioListener
const listener = new THREE.AudioListener();
camera.add(listener);

const audioFactory = new AudioFactory(listener);

// Create default synthetic sounds
const clickSound = await audioFactory.createSound("uiClick");
const music = await audioFactory.createSound("backgroundMusic");

// Play sounds
clickSound.setVolume(0.5);
clickSound.play();
```

## 🎵 Custom Audio Files

Override synthetic generation with custom MP3/WAV files:

```typescript
// Custom audio file
const customClick = await audioFactory.createSound("uiClick", {
  url: "./sounds/button_click.mp3",
  volume: 0.7,
  loop: false,
});

// Custom background music
const customMusic = await audioFactory.createSound("backgroundMusic", {
  url: "./sounds/ambient_music.wav",
  volume: 0.3,
  loop: true,
});
```

## 🔧 Adding New Sound Types

### 1. Define the Sound Type

Add your new sound to `types/AudioTypes.ts`:

```typescript
export type SoundType =
  | "uiClick"
  | "powerUp"
  | "backgroundMusic"
  | "explosion"
  // Add your new sounds here
  | "footstep"
  | "doorOpen"
  | "coinCollect";
```

### 2. Add Configuration

Add configuration in `constants/AudioConfigs.ts`:

```typescript
export const AUDIO_CONFIGS: Record<SoundType, AudioConfig> = {
  // ... existing sounds

  footstep: {
    volume: 0.4,
    loop: false,
    category: "movement",
    duration: 0.3,
  },

  doorOpen: {
    volume: 0.6,
    loop: false,
    category: "interaction",
    duration: 1.2,
  },

  coinCollect: {
    volume: 0.5,
    loop: false,
    category: "pickup",
    duration: 0.5,
  },
};
```

### 3. Implement Generation Logic

Add synthetic generation in `core/SyntheticAudioGenerator.ts`:

```typescript
// Add to generateSyntheticAudio method
case 'footstep':
  return this.generateFootstepSound(config);
case 'doorOpen':
  return this.generateDoorOpenSound(config);
case 'coinCollect':
  return this.generateCoinCollectSound(config);
```

Then implement the generation methods:

```typescript
private generateFootstepSound(config: AudioConfig): AudioBuffer {
  const sampleRate = this.audioContext.sampleRate;
  const length = sampleRate * config.duration;
  const buffer = this.audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate footstep-like noise burst
  for (let i = 0; i < length; i++) {
    const envelope = Math.exp(-i / (length * 0.3)); // Quick decay
    const noise = (Math.random() * 2 - 1) * 0.3;
    const lowFreq = Math.sin(i * 0.01) * 0.2; // Low thump

    data[i] = (noise + lowFreq) * envelope;
  }

  return buffer;
}
```

## 🏗️ Architecture

```
audios/
├── constants/          # Audio configurations
│   └── AudioConfigs.ts
├── types/             # TypeScript definitions
│   └── AudioTypes.ts
├── core/              # Core generation logic
│   ├── SyntheticAudioGenerator.ts
│   └── AudioLoader.ts
├── utils/             # Helper utilities
└── manager/           # Factory implementation
    └── AudioFactory.ts
```

## 💡 Tips

- **Categories**: Group sounds by `category` for organization (ui, movement, ambient, etc.)
- **Performance**: Synthetic generation creates AudioBuffer once and reuses
- **Volume**: Always set appropriate volume levels (0.0 to 1.0)
- **Memory**: Long audio files consume more memory than synthetic sounds
- **Formats**: Supports MP3, WAV, OGG formats for custom files

## 🎵 Synthetic Generation Techniques

The factory uses Web Audio API techniques:

- **UI Sounds**: Short sine waves with envelopes
- **Explosions**: Filtered white noise bursts
- **Music**: Harmonic tone sequences
- **Ambient**: Low-frequency oscillations
- **Mechanical**: Sawtooth waves with modulation

## 🎯 Available Categories

- `ui` - Button clicks, menu sounds, notifications
- `movement` - Footsteps, jumping, sliding
- `interaction` - Door open/close, item pickup
- `ambient` - Background music, environment sounds
- `combat` - Explosions, weapon sounds, impacts
- `pickup` - Coin collect, item grab, power-ups
- `special` - Magical effects, sci-fi sounds
