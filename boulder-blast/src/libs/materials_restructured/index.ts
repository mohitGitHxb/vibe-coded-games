/**
 * Simple Materials System
 *
 * Clean, scalable material system with individual classes for each material.
 * Perfect for 100+ materials without complexity.
 *
 * Usage:
 * ```typescript
 * import { MaterialFactory, Emerald, Brick, Wood } from './materials_restructured';
 *
 * const factory = new MaterialFactory();
 *
 * // Create materials
 * const emeraldMaterial = factory.create(new Emerald());
 * const brickMaterial = factory.create(new Brick());
 * const woodMaterial = factory.create(new Wood());
 *
 * // Apply to meshes
 * mesh1.material = emeraldMaterial;
 * mesh2.material = brickMaterial;
 * mesh3.material = woodMaterial;
 * ```
 */

// Factory
export { MaterialFactory } from "./MaterialFactory.js";

// Types
export type { IMaterial, MaterialConfig } from "./types/MaterialTypes.js";

// === GEM & CRYSTAL MATERIALS ===
export { Emerald } from "./materials/Emerald.js";
export { Ruby } from "./materials/Ruby.js";
export { Diamond } from "./materials/Diamond.js";
export { Sapphire } from "./materials/Sapphire.js";
export { Crystal } from "./materials/Crystal.js";
export { GlowingCrystal } from "./materials/GlowingCrystal.js";

// === CONSTRUCTION & BUILDING MATERIALS ===
export { Brick } from "./materials/Brick.js";
export { Concrete } from "./materials/Concrete.js";
export { Wood } from "./materials/Wood.js";
export { Marble } from "./materials/Marble.js";
export { Ceramic } from "./materials/Ceramic.js";

// === METAL MATERIALS ===
export { Steel } from "./materials/Steel.js";
export { Gold } from "./materials/Gold.js";
export { Copper } from "./materials/Copper.js";
export { Chrome } from "./materials/Chrome.js";
export { Silver } from "./materials/Silver.js";
export { Brass } from "./materials/Brass.js";
export { Iron } from "./materials/Iron.js";
export { RustedMetal } from "./materials/RustedMetal.js";
export { Mirror } from "./materials/Mirror.js";

// === TERRAIN & NATURAL MATERIALS ===
export { Grass } from "./materials/Grass.js";
export { Sand } from "./materials/Sand.js";
export { Dirt } from "./materials/Dirt.js";
export { Clay } from "./materials/Clay.js";
export { Asphalt } from "./materials/Asphalt.js";
export { Cobblestone } from "./materials/Cobblestone.js";
export { Snow } from "./materials/Snow.js";

// === LIQUID MATERIALS ===
export { Water } from "./materials/Water.js";
export { Lava } from "./materials/Lava.js";
export { Ice } from "./materials/Ice.js";
export { Oil } from "./materials/Oil.js";
export { Mercury } from "./materials/Mercury.js";
export { Slime } from "./materials/Slime.js";

// === ORGANIC & FABRIC MATERIALS ===
export { Leather } from "./materials/Leather.js";
export { Fabric } from "./materials/Fabric.js";
export { Velvet } from "./materials/Velvet.js";

// === SYNTHETIC MATERIALS ===
export { Glass } from "./materials/Glass.js";
export { Plastic } from "./materials/Plastic.js";
export { Rubber } from "./materials/Rubber.js";
export { Foam } from "./materials/Foam.js";

// === SCI-FI & FUTURISTIC MATERIALS ===
export { SciFi } from "./materials/SciFi.js";
export { SciFiPanel } from "./materials/SciFiPanel.js";
export { PlasmaField } from "./materials/PlasmaField.js";
export { EnergyField } from "./materials/EnergyField.js";
export { Holographic } from "./materials/Holographic.js";
export { NeonGlass } from "./materials/NeonGlass.js";
export { Neon } from "./materials/Neon.js";
export { Electricity } from "./materials/Electricity.js";
export { Radioactive } from "./materials/Radioactive.js";
export { BlackHole } from "./materials/BlackHole.js";
export { Iridescent } from "./materials/Iridescent.js";

// === FANTASY & MAGICAL MATERIALS ===
export { MagicRune } from "./materials/MagicRune.js";
export { DragonScale } from "./materials/DragonScale.js";

// === CARTOON & STYLIZED MATERIALS ===
export { CartoonCel } from "./materials/CartoonCel.js";
export { ToonMetal } from "./materials/ToonMetal.js";
export { FlatColor } from "./materials/FlatColor.js";
