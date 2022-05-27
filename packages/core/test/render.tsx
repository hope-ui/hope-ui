import { JSX } from "solid-js";
import { render } from "solid-testing-library";

import { HopeProvider } from "../src";

export function renderWithHopeProvider(callback: () => JSX.Element) {
  return render(() => (
    <HopeProvider config={{ initialColorMode: "light" }}>{callback}</HopeProvider>
  ));
}
