import { vanillaExtractPlugin } from "@vanilla-extract/rollup-plugin";
import withSolid from "rollup-preset-solid";

function buildOutput(format) {
  return {
    preserveModules: true,
    preserveModulesRoot: "src",
    assetFileNames({ name }) {
      return name?.replace(/^src\//, "") ?? "";
    },
    exports: "named",
    dir: `./dist/${format}`,
    format: format,
  };
}

export default withSolid({
  input: "src/index.tsx",
  targets: ["esm", "cjs"],
  plugins: [vanillaExtractPlugin()],
  output: [buildOutput("esm"), buildOutput("cjs")],
});
