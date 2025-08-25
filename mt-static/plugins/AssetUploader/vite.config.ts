import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    base: "./",
    build: {
      rollupOptions: {
        input: ["src/bootstrap.ts"],
        output: {
          sourcemap: !isProduction,
          format: "esm",
          name: "app",
          dir: "dist",
          entryFileNames: "[name].js"
        }
      }
    },
    plugins: [svelte()],
    test: {
      environment: "jsdom",
      globals: true,
      watch: false,
      include: ["src/**/*.test.ts"]
    }
  };
});
