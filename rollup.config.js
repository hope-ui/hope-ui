import path from "path";
import withSolid from "rollup-preset-solid";

export default withSolid({
  input: path.resolve(__dirname, "src/index.ts"),
  targets: ["esm", "cjs"],
});
