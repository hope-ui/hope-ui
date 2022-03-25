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

export function getNextIndex(current: number, max: number, loop: boolean) {
  let next = current + 1;

  if (next > max) {
    next = loop ? 0 : max;
  }

  return next;
}

export function getPrevIndex(current: number, max: number, loop: boolean) {
  let next = current - 1;

  if (next < 0) {
    next = loop ? max : 0;
  }

  return next;
}
