import { background } from "./background";
import { margin } from "./margin";
import { padding } from "./padding";
import { pseudoSelectors } from "./pseudo";
import { size } from "./size";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const shorthands = {
  ...background,
  ...margin,
  ...padding,
  ...pseudoSelectors,
  ...size,
  ...spacing,
  ...typography,
};
