import { getCssText } from "./stitches.config";

/** Inject all critical CSS during server-side rendering. */
export function HopeCriticalStyle() {
  // eslint-disable-next-line solid/no-innerhtml
  return <style id="stitches" innerHTML={getCssText()} />;
}
