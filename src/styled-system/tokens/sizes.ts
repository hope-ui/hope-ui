import { baseSpace } from "./space";

export const sizes = {
  ...baseSpace, // use baseSpace because space 80 and 96 have same values as sizes xs and sm
  full: "100%",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "40rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  "8xl": "96rem",
};
