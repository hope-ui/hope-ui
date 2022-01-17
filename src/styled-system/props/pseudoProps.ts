import { SystemStyleObject } from "..";
import { Pseudos } from "../shorthands/pseudos";

export type PseudoProps = {
  [K in keyof Pseudos]?: SystemStyleObject;
};
