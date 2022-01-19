import { PseudoSelectorShorthands } from "../shorthands/pseudo";
import { SystemStyleObject } from "../types";

/**
 * Types for pseudo selectors utilities
 */
export type PseudoProps = {
  [K in keyof PseudoSelectorShorthands]?: SystemStyleObject;
};
