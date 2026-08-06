import { createContext, useContext } from "solid-js";

// Where the preview's floating layers mount.
//
// The preview re-themes by carrying the derived `--hope-*` tokens as an inline style on one canvas
// element; every utility below it resolves `var(--hope-*)` from there. A Select/Combobox/Popover/
// Dialog popup portals to `document.body` by default, which is *outside* that element — so it would
// paint in the site's theme instead of the one being previewed. Every `*.Portal` in the preview
// therefore takes `mount={previewLayer()}`, pointing back at the canvas.
//
// It is an accessor, not an element: the canvas ref resolves after the first render, and Solid's
// `Portal` tracks `mount`, so the popup re-homes itself as soon as the element exists. Nothing is
// lost in the gap — every popup here starts closed and mounts nothing until then.

export type PreviewLayer = () => HTMLElement | undefined;

/** Defaults to `undefined` (i.e. `document.body`), so a part used outside the preview still works. */
export const PreviewLayerContext = createContext<PreviewLayer>(() => undefined);

export function usePreviewLayer(): PreviewLayer {
  return useContext(PreviewLayerContext);
}
