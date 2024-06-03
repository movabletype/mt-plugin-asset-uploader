import { globSync } from "glob";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  build:
    process.env.BUILD_MODE === "bundle" // for web browser
      ? {
          sourcemap: true,
          rollupOptions: {
            input: "src/bootstrap.ts",
            output: {
              dir: "dist/bundle",
              entryFileNames: "[name].js"
            }
          }
        }
      : process.env.BUILD_MODE === "lib-index" // import "@movabletype/app"
        ? {
            sourcemap: true,
            lib: {
              entry: ["src/index.ts"],
              formats: ["es", "cjs"]
            },
            outDir: "dist/lib"
          }
        : process.env.BUILD_MODE === "lib-object" // import { Asset } from "@movabletype/app/object"
          ? {
              sourcemap: true,
              lib: {
                entry: ["src/object/index.ts"],
                formats: ["es", "cjs"]
              },
              outDir: "dist/lib/object"
            }
          : undefined,
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
