/** Extracts class names from useStyles primitive */
export type Selectors<
  T extends (...args: any) => { classes: Record<string, any>; cx: (...cx: any) => string }
> = keyof ReturnType<T>["classes"];
