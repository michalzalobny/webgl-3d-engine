const resolve = require("@rollup/plugin-node-resolve");
const swc = require("rollup-plugin-swc").default;
const commonjs = require("@rollup/plugin-commonjs");
const glslify = require("rollup-plugin-glslify");

const isProduction = process.env.NODE_ENV === "production";

// Configuration for your main application
const mainConfig = {
  input: "src/app/index.ts",
  output: {
    dir: "dist/js",
    format: "esm",
    sourcemap: !isProduction,
  },
  plugins: [
    resolve({ extensions: [".js", ".ts"] }),
    commonjs(),
    glslify({
      include: ["**/*.vs", "**/*.fs", "**/*.vert", "**/*.frag", "**/*.glsl"],
      exclude: "node_modules/**",
      compress: true,
    }),
    swc({
      jsc: {
        target: "es2020",
        parser: {
          syntax: "typescript",
        },
      },
      sourceMaps: !isProduction,
      minify: isProduction,
    }),
  ],
};

module.exports = [mainConfig];
