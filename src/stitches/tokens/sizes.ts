import { AddStitchesTokenPrefix } from "../stitches.config";
import { baseSpace } from "./space";

export const sizes = {
  ...baseSpace, // use baseSpace so there are no duplicate token for 80 & 96 in the space scale
  full: "100%",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  containerSm: "640px",
  containerMd: "768px",
  containerLg: "1024px",
  containerXl: "1280px",
  container2xl: "1536px",
};

export type SizeTokens = AddStitchesTokenPrefix<keyof typeof sizes>;
