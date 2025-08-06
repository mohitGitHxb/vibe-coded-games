import type { LightingInfo } from "../types/LightingTypes";

// Import all lighting classes
import { IndoorOffice } from "../lighting/IndoorOffice";
import { IndoorCozy } from "../lighting/IndoorCozy";
import { OutdoorSunny } from "../lighting/OutdoorSunny";
import { OutdoorCloudy } from "../lighting/OutdoorCloudy";
import { NightTime } from "../lighting/NightTime";
import { Dawn } from "../lighting/Dawn";
import { Dusk } from "../lighting/Dusk";

export const LightingRegistry = {
  indoor: [
    {
      name: "Office",
      className: "IndoorOffice",
      category: "indoor",
      description: "Bright fluorescent office lighting with window light",
      lightingClass: IndoorOffice,
    },
    {
      name: "Cozy",
      className: "IndoorCozy",
      category: "indoor",
      description: "Warm, intimate lighting with fireplace and lamps",
      lightingClass: IndoorCozy,
    },
  ] as LightingInfo[],

  outdoor: [
    {
      name: "Sunny",
      className: "OutdoorSunny",
      category: "outdoor",
      description: "Bright sunny day with strong directional sunlight",
      lightingClass: OutdoorSunny,
    },
    {
      name: "Cloudy",
      className: "OutdoorCloudy",
      category: "outdoor",
      description: "Overcast day with diffused soft lighting",
      lightingClass: OutdoorCloudy,
    },
  ] as LightingInfo[],

  time: [
    {
      name: "Dawn",
      className: "Dawn",
      category: "time",
      description: "Warm sunrise lighting with low angle sun",
      lightingClass: Dawn,
    },
    {
      name: "Dusk",
      className: "Dusk",
      category: "time",
      description: "Golden hour sunset with warm orange tones",
      lightingClass: Dusk,
    },
    {
      name: "Night",
      className: "NightTime",
      category: "time",
      description: "Dark night atmosphere with moonlight and street lamps",
      lightingClass: NightTime,
    },
  ] as LightingInfo[],

  getAll(): LightingInfo[] {
    return [...this.indoor, ...this.outdoor, ...this.time];
  },

  getByCategory(category: string): LightingInfo[] {
    switch (category.toLowerCase()) {
      case "indoor":
        return this.indoor;
      case "outdoor":
        return this.outdoor;
      case "time":
        return this.time;
      default:
        return [];
    }
  },

  getByName(name: string): LightingInfo | undefined {
    return this.getAll().find(
      (lighting) => lighting.name.toLowerCase() === name.toLowerCase()
    );
  },

  getAllCategories(): string[] {
    return ["indoor", "outdoor", "time"];
  },
};
