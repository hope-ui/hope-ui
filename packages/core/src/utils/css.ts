export function toClassSelector(cssClass: string): string {
  return `.${cssClass}`;
}

export function rgbVar(cssVar: string, alpha?: string): string {
  if (alpha == null) {
    return `rgb(${cssVar})`;
  }

  return `rgb(${cssVar} / ${alpha})`;
}
