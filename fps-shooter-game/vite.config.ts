import { defineConfig } from "vite";

export default defineConfig({
  // Use relative paths for production deployment
  base: "./",

  build: {
    outDir: "dist",
    sourcemap: true,
  },

  server: {
    port: 5173,
  },

  // Include 3D model files as assets
  assetsInclude: ["**/*.glb", "**/*.gltf"],
});
