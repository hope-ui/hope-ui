import type { HopeStyleSystemProps } from "../types";

/** Split props into style-system props and others props. */
export function extractSystemStyles<T extends Record<string, any>>(
  others: HopeStyleSystemProps & T
) {
  const {
    m,
    mx,
    my,
    mt,
    mb,
    ml,
    mr,
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    w,
    minW,
    maxW,
    h,
    minH,
    maxH,
    boxSize,
    ...rest
  } = others;

  const systemStyles: any = {
    m,
    mx,
    my,
    mt,
    mb,
    ml,
    mr,
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    w,
    minW,
    maxW,
    h,
    minH,
    maxH,
    boxSize,
  };

  Object.keys(systemStyles).forEach(key => {
    if (systemStyles[key] === undefined) {
      delete systemStyles[key];
    }
  });

  return { systemStyles, rest };
}
