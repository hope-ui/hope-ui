import { CSSObject as EmotionCSSObject } from "@emotion/css";

export interface CSSObject extends EmotionCSSObject {
  ref?: string;
}
