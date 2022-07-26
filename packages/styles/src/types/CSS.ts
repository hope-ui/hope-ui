import type { CSSInterpolation } from "./CSSObject";

export interface CSS {
  (template: TemplateStringsArray, ...args: CSSInterpolation[]): string;
  (...args: CSSInterpolation[]): string;
}
