// Thanks https://github.com/chakra-ui/chakra-ui/blob/main/packages/utils/src/tabbable.ts

import { getOwnerDocument, isHTMLElement } from "./dom";

export interface FocusableElement {
  focus(options?: FocusOptions): void;
}

export function isInputElement(element: FocusableElement): element is HTMLInputElement {
  return isHTMLElement(element) && element.tagName.toLowerCase() === "input" && "select" in element;
}

export function isActiveElement(element: FocusableElement) {
  const doc = isHTMLElement(element) ? getOwnerDocument(element) : document;
  return doc.activeElement === (element as HTMLElement);
}
