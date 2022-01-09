import { background } from "./background";
import { border } from "./border";
import { layout } from "./layout";
import { margin } from "./margin";
import { padding } from "./padding";
import { shadow } from "./shadow";
import { size } from "./size";

export const utils = {
  ...background,
  ...border,
  ...layout,
  ...margin,
  ...padding,
  ...shadow,
  ...size
};
