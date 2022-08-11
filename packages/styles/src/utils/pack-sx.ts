import { isArray } from "@hope-ui/utils";

export function packSx<T>(sx: T | T[]) {
  return isArray(sx) ? sx : [sx];
}
