import { globSync } from "glob";
import { defineConfig } from 'vitest/config';
import type { ModuleFormat } from 'rollup';

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      input: ["src/bootstrap.ts"].concat(globSync("src/api/*.ts")),
      output: {
        format: (process.env.OUTPUT_FORMAT || "esm") as ModuleFormat,
        name: "app",
        entryFileNames: '[name].js',
      },
    },
  },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
