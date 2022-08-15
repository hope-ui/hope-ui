/*!
 * Original code by Ariakit
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/main/packages/ariakit-utils/src/dom.ts
 */

const BUTTON_INPUT_TYPES = ["button", "color", "file", "image", "reset", "submit"];

/**
 * Checks whether `element` is a native HTML button element.
 * @example
 * isButton(document.querySelector("button")); // true
 * isButton(document.querySelector("input[type='button']")); // true
 * isButton(document.querySelector("div")); // false
 * isButton(document.querySelector("input[type='text']")); // false
 * isButton(document.querySelector("div[role='button']")); // false
 */
export function isButton(tagName: string, inputType?: string) {
  if (tagName.toLowerCase() === "button") {
    return true;
  }

  if (tagName.toLowerCase() === "input" && inputType) {
    return BUTTON_INPUT_TYPES.indexOf(inputType) !== -1;
  }

  return false;
}
