import { SystemStyleObject } from "..";
import { Pseudos } from "../utils/pseudos";

export type PseudoProps = {
  [K in keyof Pseudos]?: SystemStyleObject;
};
