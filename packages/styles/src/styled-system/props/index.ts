import { KeysOf } from "../../types";
import { BaseSystemStyleProps } from "./base";
import { borderPropNames } from "./border";
import { colorPropNames } from "./color";
import { flexboxPropNames } from "./flexbox";
import { gridLayoutPropNames } from "./grid";
import { interactivityPropNames } from "./interactivity";
import { layoutPropNames } from "./layout";
import { marginPropNames } from "./margin";
import { paddingPropNames } from "./padding";
import { positionPropNames } from "./position";
import { pseudoSelectorPropNames, PseudoSelectorProps } from "./pseudos";
import { radiiPropNames } from "./radii";
import { shadowPropNames } from "./shadow";
import { sizePropNames } from "./size";
import { typographyPropNames } from "./typography";

export type SystemStyleProps = BaseSystemStyleProps & PseudoSelectorProps;

export const stylePropNames: KeysOf<SystemStyleProps> = {
  ...borderPropNames,
  ...colorPropNames,
  ...flexboxPropNames,
  ...gridLayoutPropNames,
  ...interactivityPropNames,
  ...layoutPropNames,
  ...marginPropNames,
  ...paddingPropNames,
  ...positionPropNames,
  ...radiiPropNames,
  ...shadowPropNames,
  ...sizePropNames,
  ...typographyPropNames,
  ...pseudoSelectorPropNames,
};
