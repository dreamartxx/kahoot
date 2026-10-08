import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: { outDir: "assets-build", emptyOutDir: true },
  server: { proxy: { "/api": "http://127.0.0.1:8091" } },
});
