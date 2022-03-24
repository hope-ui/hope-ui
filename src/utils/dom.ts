import { EventKeys } from "./types";

export function isElement(el: any): el is Element {
  return el != null && typeof el == "object" && "nodeType" in el && el.nodeType === Node.ELEMENT_NODE;
}

export function isHTMLElement(el: any): el is HTMLElement {
  if (!isElement(el)) {
    return false;
  }

  const win = el.ownerDocument.defaultView ?? window;
  return el instanceof win.HTMLElement;
}

export function getOwnerDocument(node?: Element | null): Document {
  return isElement(node) ? node.ownerDocument ?? document : document;
}

export function isValidEvent(event: any, element?: HTMLElement) {
  const target = event.target as HTMLElement;
  if (event.button > 0) return false;
  // if the event target is no longer in the document
  if (target) {
    const doc = getOwnerDocument(target);
    if (!doc.body.contains(target)) return false;
  }

  return !element?.contains(target);
}

/**
 * Get the normalized event key across all browsers
 */
export function normalizeEventKey(event: Pick<KeyboardEvent, "key" | "keyCode">) {
  const { key, keyCode } = event;

  const isArrowKey = keyCode >= 37 && keyCode <= 40 && key.indexOf("Arrow") !== 0;

  const eventKey = isArrowKey ? `Arrow${key}` : key;

  return eventKey as EventKeys;
}
