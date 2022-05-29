import { JSX } from "solid-js";
import { fireEvent, render } from "solid-testing-library";

import { HopeProvider } from "../src";

/** Render the children in a HopeProvider. */
export function renderWithHopeProvider(callback: () => JSX.Element) {
  return render(() => (
    <HopeProvider config={{ initialColorMode: "light" }}>{callback}</HopeProvider>
  ));
}

/** Triggers a "press" event on an element. */
export async function triggerPress(element: any, opts = {}) {
  fireEvent.mouseDown(element, { detail: 1, ...opts });
  await Promise.resolve();

  fireEvent.mouseUp(element, { detail: 1, ...opts });
  await Promise.resolve();

  fireEvent.click(element, { detail: 1, ...opts });
  await Promise.resolve();
}
