import withSolid from "rollup-preset-solid";

export default withSolid({
  input: "src/index.js",
  targets: ["esm", "cjs"],
});
