/// <reference types="vite/client" />

declare module "stats.js" {
  export default class Stats {
    showPanel: (panel: number) => void;
    begin: () => void;
    end: () => void;
    dom: HTMLDivElement;
  }
}
