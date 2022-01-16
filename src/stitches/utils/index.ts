import { background } from "./background";
import { border } from "./border";
import { display } from "./display";
import { margin } from "./margin";
import { padding } from "./padding";
import { position } from "./position";
import { pseudoSelectors } from "./pseudos";
import { shadow } from "./shadow";
import { size } from "./size";
import { spacing } from "./spacing";

export const utils = {
  ...background,
  ...border,
  ...display,
  ...margin,
  ...padding,
  ...position,
  ...pseudoSelectors,
  ...shadow,
  ...size,
  ...spacing,
};
