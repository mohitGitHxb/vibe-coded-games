/**
 * Complete Particle Effects Registry
 * Comprehensive list of all available particle effects with metadata
 */

// Import all particle effects

// Combat effects
import { FireExplosion } from "../effects/combat/FireExplosion.js";
import { Sparks } from "../effects/combat/Sparks.js";

// Environmental effects
import { Rain } from "../effects/environmental/Rain.js";

// Magic effects
import { MagicSparkles } from "../effects/magic/MagicSparkles.js";

// UI effects
import { ClickBurst } from "../effects/ui/ClickBurst.js";

export const COMPLETE_PARTICLES_REGISTRY: {
  [key: string]: {
    class: any;
    name: string;
    description: string;
    category: string;
  };
} = {
  // === COMBAT EFFECTS ===
  fireExplosion: {
    class: FireExplosion,
    name: "💥 Fire Explosion",
    description:
      "Violent fiery explosion with realistic physics and color transitions",
    category: "combat",
  },
  sparks: {
    class: Sparks,
    name: "✨ Sparks",
    description:
      "Metal sparks with ground collision and realistic trajectories",
    category: "combat",
  },

  // === ENVIRONMENTAL EFFECTS ===
  rain: {
    class: Rain,
    name: "🌧️ Rain",
    description: "Continuous rainfall with vertical streaks and wind effects",
    category: "environmental",
  },

  // === MAGIC EFFECTS ===
  magicSparkles: {
    class: MagicSparkles,
    name: "🌟 Magic Sparkles",
    description:
      "Floating magical particles with color shifting and swirling motion",
    category: "magic",
  },

  // === UI EFFECTS ===
  clickBurst: {
    class: ClickBurst,
    name: "👆 Click Burst",
    description: "Quick radial burst for UI click feedback with clean design",
    category: "ui",
  },
};

/**
 * Get all particle effects in a category
 */
export function getParticlesByCategory(category: string) {
  return Object.entries(COMPLETE_PARTICLES_REGISTRY)
    .filter(([_, info]) => info.category === category)
    .reduce((acc, [key, info]) => {
      acc[key] = info;
      return acc;
    }, {} as typeof COMPLETE_PARTICLES_REGISTRY);
}

/**
 * Get all available categories
 */
export function getParticleCategories(): string[] {
  const categories = new Set(
    Object.values(COMPLETE_PARTICLES_REGISTRY).map((info) => info.category)
  );
  return Array.from(categories).sort();
}

/**
 * Get particle effect info by key
 */
export function getParticleInfo(key: string) {
  return COMPLETE_PARTICLES_REGISTRY[key];
}

/**
 * Search particle effects by name or description
 */
export function searchParticles(query: string) {
  const lowerQuery = query.toLowerCase();
  return Object.entries(COMPLETE_PARTICLES_REGISTRY)
    .filter(
      ([key, info]) =>
        key.toLowerCase().includes(lowerQuery) ||
        info.name.toLowerCase().includes(lowerQuery) ||
        info.description.toLowerCase().includes(lowerQuery)
    )
    .reduce((acc, [key, info]) => {
      acc[key] = info;
      return acc;
    }, {} as typeof COMPLETE_PARTICLES_REGISTRY);
}
