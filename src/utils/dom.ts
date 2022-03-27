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

  if (event.button > 0) {
    return false;
  }

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

/**
 * Sort an array of DOM nodes according to the HTML tree order
 * @see http://www.w3.org/TR/html5/infrastructure.html#tree-order and https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
 */
export function sortNodes(nodes: Node[]) {
  return nodes.sort((a, b) => {
    const compare = a.compareDocumentPosition(b);

    // b is after or is a descendant of a.
    if (compare & Node.DOCUMENT_POSITION_FOLLOWING || compare & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      // a < b
      return -1;
    }

    // b is before or is an ancestor of a.
    if (compare & Node.DOCUMENT_POSITION_PRECEDING || compare & Node.DOCUMENT_POSITION_CONTAINS) {
      // a > b
      return 1;
    }

    // b and a is not in same tree.
    if (compare & Node.DOCUMENT_POSITION_DISCONNECTED || compare & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC) {
      throw Error("Cannot sort the given nodes.");
    } else {
      return 0;
    }
  });
}
