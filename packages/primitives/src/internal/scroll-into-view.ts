/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/utils`,
 * `src/scrollIntoView.ts` — the scroll-port arithmetic: border widths, `scroll-padding-*`,
 * `scroll-margin-*`, scrollbar thickness, the RTL scrollbar side, and the `"nearest"`
 * minimum-distance delta).
 * Copyright 2020 Adobe. All rights reserved.
 * https://github.com/adobe/react-spectrum
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. A copy of the License is distributed with this
 * package as LICENSE-APACHE-2.0.txt, and is available at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * This file has been modified from the original.
 */

/** Per-axis alignment of the element inside the scroll port. */
export interface ScrollIntoViewAlignment {
  /** Block (vertical) alignment. Default `"nearest"` — the smallest scroll that reveals the element. */
  block?: ScrollLogicalPosition;
  /** Inline (horizontal) alignment. Default `"nearest"`. */
  inline?: ScrollLogicalPosition;
}

/** A one-dimensional band in viewport coordinates. */
interface Span {
  readonly start: number;
  readonly end: number;
}

/** A resolved computed `<length>` in px. Anything unparseable (`"auto"`, `""`) counts as zero. */
function cssPixels(value: string): number {
  return Number.parseFloat(value) || 0;
}

/**
 * The band the element has to end up inside: its border box grown by its own `scroll-margin-*`.
 */
function scrollArea(element: HTMLElement): { block: Span; inline: Span } {
  const box = element.getBoundingClientRect();
  const elementStyle = getComputedStyle(element);
  return {
    block: {
      start: box.top - cssPixels(elementStyle.scrollMarginTop),
      end: box.bottom + cssPixels(elementStyle.scrollMarginBottom),
    },
    inline: {
      start: box.left - cssPixels(elementStyle.scrollMarginLeft),
      end: box.right + cssPixels(elementStyle.scrollMarginRight),
    },
  };
}

/**
 * The container's visible scroll port: its border box, minus its borders, its `scroll-padding-*`
 * and whatever the scrollbar occupies. Borders and the scrollbar sit *inside* the border box but
 * outside the scrollable area, so leaving them in would tuck the last row under the scrollbar.
 *
 * The physical sides here are correct and must stay physical: this is measured geometry, the same
 * class as the `getBoundingClientRect()` reads `check:rtl-safety` deliberately never flags. Reading
 * direction is handled explicitly instead — the vertical scrollbar occupies the inline *end*, which
 * is the left edge under `rtl`.
 */
function scrollPort(scrollContainer: HTMLElement): { block: Span; inline: Span } {
  const box = scrollContainer.getBoundingClientRect();
  const containerStyle = getComputedStyle(scrollContainer);
  const ownerDocument = scrollContainer.ownerDocument;
  const isRoot =
    scrollContainer === (ownerDocument.scrollingElement ?? ownerDocument.documentElement);

  // The document scroller's port *is* the viewport: its borders and scrollbar fall outside the
  // scrolled area rather than inside it, so none of them come off the band.
  const borderTop = isRoot ? 0 : cssPixels(containerStyle.borderTopWidth);
  const borderBottom = isRoot ? 0 : cssPixels(containerStyle.borderBottomWidth);
  const borderLeft = isRoot ? 0 : cssPixels(containerStyle.borderLeftWidth);
  const borderRight = isRoot ? 0 : cssPixels(containerStyle.borderRightWidth);

  const scrollbarWidth = isRoot
    ? 0
    : scrollContainer.offsetWidth - scrollContainer.clientWidth - borderLeft - borderRight;
  const scrollbarHeight = isRoot
    ? 0
    : scrollContainer.offsetHeight - scrollContainer.clientHeight - borderTop - borderBottom;

  const top = (isRoot ? 0 : box.top) + borderTop + cssPixels(containerStyle.scrollPaddingTop);
  const bottom =
    (isRoot ? scrollContainer.clientHeight : box.bottom) -
    borderBottom -
    cssPixels(containerStyle.scrollPaddingBottom) -
    scrollbarHeight;
  const left = (isRoot ? 0 : box.left) + borderLeft + cssPixels(containerStyle.scrollPaddingLeft);
  const right =
    (isRoot ? scrollContainer.clientWidth : box.right) -
    borderRight -
    cssPixels(containerStyle.scrollPaddingRight);

  const readsRightToLeft = containerStyle.direction === "rtl";
  return {
    block: { start: top, end: bottom },
    inline: {
      start: readsRightToLeft ? left + scrollbarWidth : left,
      end: readsRightToLeft ? right : right - scrollbarWidth,
    },
  };
}

/** How far to scroll along one axis so `area` sits at `align` inside `port`. */
function scrollDelta(align: ScrollLogicalPosition, area: Span, port: Span): number {
  if (area.start >= port.start && area.end <= port.end) {
    return 0;
  }
  switch (align) {
    case "start":
      return area.start - port.start;
    case "center":
      return (area.start + area.end) / 2 - (port.start + port.end) / 2;
    case "end":
      return area.end - port.end;
    default: {
      // `"nearest"`: whichever edge correction is smaller, so the list moves as little as possible.
      const toStart = area.start - port.start;
      const toEnd = area.end - port.end;
      return Math.abs(toStart) <= Math.abs(toEnd) ? toStart : toEnd;
    }
  }
}

/**
 * Scrolls `scrollContainer` so `element` is visible inside it — and **nothing above it moves**.
 *
 * That containment is the whole reason this exists rather than `element.scrollIntoView()`: the
 * native call walks every scrollable ancestor up to the document, so revealing an option inside a
 * floating popup drags the page (and therefore the popup) out from under the reader.
 *
 * It is needed at all because `aria-activedescendant` moves no DOM focus. Roving focus has been
 * hiding that: a real `.focus()` scrolls the element into view by itself, whereas in a Select the
 * browser scrolls nothing and an offscreen option stays offscreen while ARIA calls it active.
 */
export function scrollIntoView(
  scrollContainer: HTMLElement,
  element: HTMLElement,
  alignment: ScrollIntoViewAlignment = {},
): void {
  if (scrollContainer === element) {
    return;
  }

  const port = scrollPort(scrollContainer);
  const area = scrollArea(element);

  scrollContainer.scrollTo({
    left:
      scrollContainer.scrollLeft +
      scrollDelta(alignment.inline ?? "nearest", area.inline, port.inline),
    top:
      scrollContainer.scrollTop + scrollDelta(alignment.block ?? "nearest", area.block, port.block),
  });
}
