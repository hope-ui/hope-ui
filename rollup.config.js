import path from "path";
import alias from "@rollup/plugin-alias";
import withSolid from "rollup-preset-solid";

import pkg from "./package.json";

export default withSolid({
  input: path.resolve(__dirname, "src/index.ts"),
  targets: ["esm", "cjs"],
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    }),
  ],
  external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies), "solid-js/web", "solid-js/store"],
});
