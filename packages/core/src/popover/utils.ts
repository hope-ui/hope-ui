/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/fbfcbaa44bcf398746c1d84ed155cc7f9290939c/packages/ariakit/src/popover/popover-state.ts
 */

import { AnchorRect } from "./types";

function createDOMRect(anchorRect?: AnchorRect) {
  const { x = 0, y = 0, width = 0, height = 0 } = anchorRect ?? {};

  if (typeof DOMRect === "function") {
    return new DOMRect(x, y, width, height);
  }

  // JSDOM doesn't support DOMRect constructor.
  const rect = {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
  };

  return { ...rect, toJSON: () => rect };
}

export function getAnchorElement(
  anchor: HTMLElement | undefined,
  getAnchorRect: (anchor?: HTMLElement) => AnchorRect | undefined
) {
  // https://floating-ui.com/docs/virtual-elements
  const contextElement = anchor;

  return {
    contextElement,
    getBoundingClientRect: () => {
      const anchorRect = getAnchorRect(anchor);

      if (anchorRect) {
        return createDOMRect(anchorRect);
      }

      if (anchor) {
        return anchor.getBoundingClientRect();
      }

      return createDOMRect();
    },
  };
}
