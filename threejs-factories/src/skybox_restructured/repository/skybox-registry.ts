import { SkyboxInfo } from "../types/SkyboxTypes";

// Import all skybox classes
import { ClearSky } from "../skyboxes/ClearSky";
import { CloudySky } from "../skyboxes/CloudySky";
import { SunsetSky } from "../skyboxes/SunsetSky";
import { NightSky } from "../skyboxes/NightSky";
import { SpaceSky } from "../skyboxes/SpaceSky";

export const SkyboxRegistry = {
  nature: [
    {
      name: "Clear Sky",
      className: "ClearSky",
      category: "nature",
      description: "Beautiful clear blue sky with gradient",
      skyboxClass: ClearSky,
    },
    {
      name: "Cloudy Sky",
      className: "CloudySky",
      category: "nature",
      description: "Overcast sky with realistic cloud formations",
      skyboxClass: CloudySky,
    },
  ] as SkyboxInfo[],

  time: [
    {
      name: "Sunset Sky",
      className: "SunsetSky",
      category: "time",
      description: "Dramatic sunset with orange and purple gradients",
      skyboxClass: SunsetSky,
    },
    {
      name: "Night Sky",
      className: "NightSky",
      category: "time",
      description: "Dark night sky filled with twinkling stars",
      skyboxClass: NightSky,
    },
  ] as SkyboxInfo[],

  space: [
    {
      name: "Deep Space",
      className: "SpaceSky",
      category: "space",
      description: "Deep space environment with stars and nebulae",
      skyboxClass: SpaceSky,
    },
  ] as SkyboxInfo[],

  getAll(): SkyboxInfo[] {
    return [...this.nature, ...this.time, ...this.space];
  },

  getByCategory(category: string): SkyboxInfo[] {
    switch (category.toLowerCase()) {
      case "nature":
        return this.nature;
      case "time":
        return this.time;
      case "space":
        return this.space;
      default:
        return [];
    }
  },

  getByName(name: string): SkyboxInfo | undefined {
    return this.getAll().find(
      (skybox) => skybox.name.toLowerCase() === name.toLowerCase()
    );
  },

  getAllCategories(): string[] {
    return ["nature", "time", "space"];
  },
};
