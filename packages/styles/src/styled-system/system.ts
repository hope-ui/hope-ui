import { KeysOf } from "../types";
import { BaseSystemStyleObject, BaseSystemStyleProps } from "./base-system-style-object";
import { borderPropNames } from "./props/border";
import { colorPropNames } from "./props/color";
import { flexboxPropNames } from "./props/flexbox";
import { gridLayoutPropNames } from "./props/grid";
import { interactivityPropNames } from "./props/interactivity";
import { layoutPropNames } from "./props/layout";
import { marginPropNames } from "./props/margin";
import { paddingPropNames } from "./props/padding";
import { positionPropNames } from "./props/position";
import { pseudoSelectorPropNames, PseudoSelectorProps } from "./props/pseudos";
import { radiiPropNames } from "./props/radii";
import { shadowPropNames } from "./props/shadow";
import { sizePropNames } from "./props/size";
import { SxProp, sxPropName } from "./props/sx";
import { typographyPropNames } from "./props/typography";

type AdditionalProps = PseudoSelectorProps & SxProp;

export type SystemStyleProps = BaseSystemStyleProps & AdditionalProps;

export type SystemStyleObject = BaseSystemStyleObject & AdditionalProps;

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
  ...sxPropName,
};
