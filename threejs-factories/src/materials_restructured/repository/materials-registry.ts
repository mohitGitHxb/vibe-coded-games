/**
 * Complete Materials Registry
 * Comprehensive list of all available materials with metadata
 */

// Import all materials
import { Emerald } from "../materials/Emerald.js";
import { Ruby } from "../materials/Ruby.js";
import { Diamond } from "../materials/Diamond.js";
import { Sapphire } from "../materials/Sapphire.js";
import { Crystal } from "../materials/Crystal.js";
import { GlowingCrystal } from "../materials/GlowingCrystal.js";

import { Brick } from "../materials/Brick.js";
import { Concrete } from "../materials/Concrete.js";
import { Wood } from "../materials/Wood.js";
import { Marble } from "../materials/Marble.js";
import { Ceramic } from "../materials/Ceramic.js";

import { Steel } from "../materials/Steel.js";
import { Gold } from "../materials/Gold.js";
import { Copper } from "../materials/Copper.js";
import { Chrome } from "../materials/Chrome.js";
import { Silver } from "../materials/Silver.js";
import { Brass } from "../materials/Brass.js";
import { Iron } from "../materials/Iron.js";
import { RustedMetal } from "../materials/RustedMetal.js";
import { Mirror } from "../materials/Mirror.js";

import { Grass } from "../materials/Grass.js";
import { Sand } from "../materials/Sand.js";
import { Dirt } from "../materials/Dirt.js";
import { Clay } from "../materials/Clay.js";
import { Asphalt } from "../materials/Asphalt.js";
import { Cobblestone } from "../materials/Cobblestone.js";
import { Snow } from "../materials/Snow.js";

import { Water } from "../materials/Water.js";
import { Lava } from "../materials/Lava.js";
import { Ice } from "../materials/Ice.js";
import { Oil } from "../materials/Oil.js";
import { Mercury } from "../materials/Mercury.js";
import { Slime } from "../materials/Slime.js";

import { Leather } from "../materials/Leather.js";
import { Fabric } from "../materials/Fabric.js";
import { Velvet } from "../materials/Velvet.js";

import { Glass } from "../materials/Glass.js";
import { Plastic } from "../materials/Plastic.js";
import { Rubber } from "../materials/Rubber.js";
import { Foam } from "../materials/Foam.js";

import { SciFi } from "../materials/SciFi.js";
import { SciFiPanel } from "../materials/SciFiPanel.js";
import { PlasmaField } from "../materials/PlasmaField.js";
import { EnergyField } from "../materials/EnergyField.js";
import { Holographic } from "../materials/Holographic.js";
import { NeonGlass } from "../materials/NeonGlass.js";
import { Neon } from "../materials/Neon.js";
import { Electricity } from "../materials/Electricity.js";
import { Radioactive } from "../materials/Radioactive.js";
import { BlackHole } from "../materials/BlackHole.js";
import { Iridescent } from "../materials/Iridescent.js";

import { MagicRune } from "../materials/MagicRune.js";
import { DragonScale } from "../materials/DragonScale.js";

import { CartoonCel } from "../materials/CartoonCel.js";
import { ToonMetal } from "../materials/ToonMetal.js";
import { FlatColor } from "../materials/FlatColor.js";

export const COMPLETE_MATERIALS_REGISTRY: {
  [key: string]: { class: any; name: string; description: string };
} = {
  // === GEMS & CRYSTALS ===
  emerald: {
    class: Emerald,
    name: "💚 Emerald",
    description: "Precious green gemstone with crystalline shine",
  },
  ruby: {
    class: Ruby,
    name: "❤️ Ruby",
    description: "Deep red precious gemstone with inner fire",
  },
  diamond: {
    class: Diamond,
    name: "💎 Diamond",
    description: "Brilliant clear crystal with perfect reflections",
  },
  sapphire: {
    class: Sapphire,
    name: "💙 Sapphire",
    description: "Deep blue precious gemstone",
  },
  crystal: {
    class: Crystal,
    name: "🔮 Crystal",
    description: "Clear crystalline structure with transparency",
  },
  glowingCrystal: {
    class: GlowingCrystal,
    name: "✨ Glowing Crystal",
    description: "Magical luminescent crystal",
  },

  // === BUILDING MATERIALS ===
  brick: {
    class: Brick,
    name: "🧱 Brick",
    description: "Red clay brick with procedural mortar pattern texture",
  },
  concrete: {
    class: Concrete,
    name: "🏢 Concrete",
    description: "Gray industrial concrete with aggregate speckles",
  },
  wood: {
    class: Wood,
    name: "🪵 Wood",
    description: "Natural brown wood with realistic grain texture",
  },
  marble: {
    class: Marble,
    name: "🏛️ Marble",
    description: "Smooth polished marble stone surface",
  },
  ceramic: {
    class: Ceramic,
    name: "🏺 Ceramic",
    description: "Fired clay pottery with smooth finish",
  },

  // === METALS ===
  steel: {
    class: Steel,
    name: "⚡ Steel",
    description: "Industrial metallic steel with brushed finish",
  },
  gold: {
    class: Gold,
    name: "🥇 Gold",
    description: "Precious golden metal with warm reflective glow",
  },
  copper: {
    class: Copper,
    name: "🟫 Copper",
    description: "Reddish-brown metal with natural patina",
  },
  chrome: {
    class: Chrome,
    name: "✨ Chrome",
    description: "Mirror-like polished chrome with perfect reflections",
  },
  silver: {
    class: Silver,
    name: "🥈 Silver",
    description: "Precious white metal with high reflectivity",
  },
  brass: {
    class: Brass,
    name: "🟨 Brass",
    description: "Golden metal alloy with warm tone",
  },
  iron: {
    class: Iron,
    name: "🔩 Iron",
    description: "Raw metallic iron with industrial look",
  },
  rustedMetal: {
    class: RustedMetal,
    name: "🦀 Rusted Metal",
    description: "Weathered corroded metal surface",
  },
  mirror: {
    class: Mirror,
    name: "🪞 Mirror",
    description: "Perfect reflective mirror surface",
  },

  // === TERRAIN & NATURAL ===
  grass: {
    class: Grass,
    name: "🌱 Grass",
    description: "Natural grass surface with organic blade texture",
  },
  sand: {
    class: Sand,
    name: "🏖️ Sand",
    description: "Beach sand with fine granular texture pattern",
  },
  dirt: {
    class: Dirt,
    name: "🟤 Dirt",
    description: "Natural earth soil with organic look",
  },
  clay: {
    class: Clay,
    name: "🧿 Clay",
    description: "Earthy ceramic clay material",
  },
  asphalt: {
    class: Asphalt,
    name: "🛣️ Asphalt",
    description: "Dark road surface material",
  },
  cobblestone: {
    class: Cobblestone,
    name: "🪨 Cobblestone",
    description: "Old stone street paving surface",
  },
  snow: {
    class: Snow,
    name: "❄️ Snow",
    description: "Pure white snow with soft texture",
  },

  // === LIQUIDS & FLOWS ===
  water: {
    class: Water,
    name: "💧 Water",
    description: "Clear blue water with transparency and flow",
  },
  lava: {
    class: Lava,
    name: "🌋 Lava",
    description: "Molten rock with glowing emissive lava flow texture",
  },
  ice: {
    class: Ice,
    name: "🧊 Ice",
    description: "Transparent ice with crystalline fracture patterns",
  },
  oil: {
    class: Oil,
    name: "🛢️ Oil",
    description: "Dark viscous liquid petroleum",
  },
  mercury: {
    class: Mercury,
    name: "☿️ Mercury",
    description: "Liquid metallic mercury with reflective surface",
  },
  slime: {
    class: Slime,
    name: "🟢 Slime",
    description: "Viscous translucent goo with organic feel",
  },

  // === ORGANIC & FABRICS ===
  leather: {
    class: Leather,
    name: "🧥 Leather",
    description: "Rich brown leather with natural texture",
  },
  fabric: {
    class: Fabric,
    name: "🧵 Fabric",
    description: "Woven textile material with soft appearance",
  },
  velvet: {
    class: Velvet,
    name: "👑 Velvet",
    description: "Soft luxurious fabric with deep rich color",
  },

  // === SYNTHETICS ===
  glass: {
    class: Glass,
    name: "🪟 Glass",
    description: "Clear transparent glass with realistic refraction",
  },
  plastic: {
    class: Plastic,
    name: "🎀 Plastic",
    description: "Synthetic polymer with vibrant color",
  },
  rubber: {
    class: Rubber,
    name: "⚫ Rubber",
    description: "Elastic synthetic material with matte finish",
  },
  foam: {
    class: Foam,
    name: "🟡 Foam",
    description: "Light spongy material with soft texture",
  },

  // === SCI-FI & FUTURISTIC ===
  scifi: {
    class: SciFi,
    name: "🚀 Sci-Fi",
    description: "Futuristic metallic material with tech aesthetics",
  },
  scifiPanel: {
    class: SciFiPanel,
    name: "🖥️ Sci-Fi Panel",
    description: "Futuristic control panel with subtle glow",
  },
  plasma: {
    class: PlasmaField,
    name: "⚡ Plasma",
    description: "Electric plasma field with intense energy glow effects",
  },
  energyField: {
    class: EnergyField,
    name: "🔋 Energy Field",
    description: "Pure energy barrier with cyan glow",
  },
  holographic: {
    class: Holographic,
    name: "👻 Holographic",
    description: "Translucent hologram effect with sci-fi glow",
  },
  neonGlass: {
    class: NeonGlass,
    name: "💟 Neon Glass",
    description: "Glowing neon tubing with magenta light",
  },
  neon: {
    class: Neon,
    name: "🟢 Neon",
    description: "Bright glowing neon with electric green color",
  },
  electricity: {
    class: Electricity,
    name: "⚡ Electricity",
    description: "Electric lightning energy with cyan glow",
  },
  radioactive: {
    class: Radioactive,
    name: "☢️ Radioactive",
    description: "Glowing radioactive substance with green emission",
  },
  blackhole: {
    class: BlackHole,
    name: "🕳️ Black Hole",
    description: "Light-absorbing void with subtle purple glow",
  },
  iridescent: {
    class: Iridescent,
    name: "🌈 Iridescent",
    description: "Color-shifting rainbow effect material",
  },

  // === FANTASY & MAGICAL ===
  magicRune: {
    class: MagicRune,
    name: "🔮 Magic Rune",
    description: "Glowing magical inscription with purple energy",
  },
  dragonScale: {
    class: DragonScale,
    name: "🐉 Dragon Scale",
    description: "Mystical dragon hide with subtle green glow",
  },

  // === CARTOON & STYLIZED ===
  cartoonCel: {
    class: CartoonCel,
    name: "🎨 Cartoon Cel",
    description: "Flat cartoon shading with vibrant colors",
  },
  toonMetal: {
    class: ToonMetal,
    name: "🤖 Toon Metal",
    description: "Stylized cartoon metal with reduced reflections",
  },
  flatColor: {
    class: FlatColor,
    name: "🎯 Flat Color",
    description: "Simple solid color material without lighting",
  },
};
