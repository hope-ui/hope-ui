export function isElement(el: any): el is Element {
  return el != null && typeof el == "object" && "nodeType" in el && el.nodeType === Node.ELEMENT_NODE;
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
