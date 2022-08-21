/**
 * Return an rgb color + alpha channel.
 *
 * @example
 * rgba(vars.colors.primary.mainChannel, 0.5)
 * =>
 * "rgb(var(--hope-colors-primary-mainChannel) / 0.5)"
 */
export function rgba(cssVar: string, alpha: number): string {
  return `rgb(${cssVar} / ${alpha})`;
}
