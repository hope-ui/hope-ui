/**
 * Convert a value to percentage based on lower and upper bound values
 *
 * @param value the value in number
 * @param min the minimum value
 * @param max the maximum value
 */
export function valueToPercent(value: number, min: number, max: number) {
  return ((value - min) * 100) / (max - min);
}

export function getNextIndex(current: number, last: number, loop: boolean) {
  let next = current + 1;

  if (next > last) {
    next = loop ? 0 : last;
  }

  return next;
}

export function getPrevIndex(current: number, last: number, loop: boolean) {
  let next = current - 1;

  if (next < 0) {
    next = loop ? last : 0;
  }

  return next;
}
