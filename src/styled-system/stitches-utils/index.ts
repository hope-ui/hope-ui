import { background } from "./background";
import { border } from "./border";
import { display } from "./display";
import { margin } from "./margin";
import { padding } from "./padding";
import { position } from "./position";
import { pseudoSelectors } from "./pseudo-selector";
import { radii } from "./radii";
import { shadow } from "./shadow";
import { size } from "./size";
import { typography } from "./typography";

export const utils = {
  ...background,
  ...border,
  ...display,
  ...position,
  ...pseudoSelectors,
  ...radii,
  ...margin,
  ...padding,
  ...shadow,
  ...size,
  ...typography,
};
