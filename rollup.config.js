import path from "path";
import withSolid from "rollup-preset-solid";

import pkg from "./package.json";

export default withSolid({
  input: path.resolve(__dirname, "src/index.ts"),
  targets: ["esm", "cjs"],
  external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies), "solid-js/web", "solid-js/store"],
});
