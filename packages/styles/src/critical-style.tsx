import { useAssets } from "solid-js/web";

import { getCssText } from "./stitches.config";

/** Inject all critical CSS during server-side rendering. */
export function HopeCriticalStyle() {
  // eslint-disable-next-line solid/no-innerhtml
  return useAssets(() => (<style id="stitches" innerHTML={getCssText()} $ServerOnly />) as string);
}
