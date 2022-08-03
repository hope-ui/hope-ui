import * as Stitches from "@stitches/core";
import { createStitches } from "@stitches/core";

export const { css, globalCss, keyframes, getCssText, config } = createStitches({
  prefix: "hope",
});

export type CSSObject = Stitches.CSS<typeof config>;
