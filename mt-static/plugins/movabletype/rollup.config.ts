// rollup.config.js
import glob from "glob";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import esbuild from 'rollup-plugin-esbuild'

const production = !process.env.ROLLUP_WATCH;

export default {
  input: ["src/bootstrap.ts"].concat(glob.sync("src/api/*.ts")),
  output: {
    dir: "../AssetUploader/public/build/movabletype",
    format: "esm",
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    esbuild({
      sourceMap: true,
      minify: production,
    }),
  ],
};
