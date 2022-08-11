/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-utils/src/pack-sx/pack-sx.ts
 */

import { isArray } from "@hope-ui/utils";

export function packSx<T>(sx: T | T[]) {
  return isArray(sx) ? sx : [sx];
}
