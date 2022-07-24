import withSolid from "rollup-preset-solid";

import { dependencies, peerDependencies } from "./package.json";

const externals = [
  ...Object.keys(peerDependencies),
  ...Object.keys(dependencies),
  "solid-js",
  "solid-js/web",
  "solid-js/store",
  "@vanilla-extract/recipes/createRuntimeFn",
];

const moduleFormats = ["esm", "cjs"];

export default withSolid({
  input: "src/index.tsx",
  targets: moduleFormats,
  external: externals,
  output: moduleFormats.map(format => ({
    exports: "named",
    dir: `./dist/${format}`,
    format: format,
    preserveModules: true,
    preserveModulesRoot: "src",
    assetFileNames({ name }) {
      return name?.replace(/^src\//, "") ?? "";
    },
  })),
});
