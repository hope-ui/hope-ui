// Thanks https://github.com/reakit/reakit/blob/master/packages/reakit-utils/src/tabbable.ts

import { isHTMLElement } from "./dom";

export const hasTabIndex = (element: HTMLElement) => element.hasAttribute("tabindex");

export function isHidden(element: HTMLElement) {
  if (element.parentElement && isHidden(element.parentElement)) {
    return true;
  }

  return element.hidden;
}

export function isDisabled(element: HTMLElement) {
  return Boolean(element.getAttribute("disabled")) === true || Boolean(element.getAttribute("aria-disabled")) === true;
}

export function isContentEditable(element: HTMLElement) {
  const value = element.getAttribute("contenteditable");
  return value !== "false" && value != null;
}

export function isFocusable(element: HTMLElement) {
  if (!isHTMLElement(element) || isHidden(element) || isDisabled(element)) {
    return false;
  }

  const { localName } = element;
  const focusableTags = ["input", "select", "textarea", "button"];

  if (focusableTags.indexOf(localName) >= 0) {
    return true;
  }

  const others = {
    a: () => element.hasAttribute("href"),
    audio: () => element.hasAttribute("controls"),
    video: () => element.hasAttribute("controls"),
  };

  if (localName in others) {
    return others[localName as keyof typeof others]();
  }

  if (isContentEditable(element)) {
    return true;
  }

  return hasTabIndex(element);
}
