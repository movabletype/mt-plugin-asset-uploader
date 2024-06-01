import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: ["src/bootstrap.ts", "src/main.ts"],
      output: {
        sourcemap: true,
        format: "esm",
        name: "app",
        dir: "dist",
        entryFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      }
    }
  },
  plugins: [svelte()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
