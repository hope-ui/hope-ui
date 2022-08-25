import * as Stitches from "@stitches/core";
import { createStitches } from "@stitches/core";

const stitches = createStitches({ prefix: "hope" });

export const { css, globalCss, getCssText, keyframes } = stitches;

export type CSSObject = Stitches.CSS<typeof stitches.config>;
