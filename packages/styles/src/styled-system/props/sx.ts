import { KeysOf, Theme } from "../../types";
import { SystemStyleObject } from "../system";

export type Sx = SystemStyleObject | ((theme: Theme) => SystemStyleObject);

export interface SxProp {
  /** The style applied to the root element, will be parsed by `emotion` and added to the head. */
  sx?: Sx | (Sx | undefined)[];
}

export const sxPropName: KeysOf<SxProp> = {
  sx: true,
};
