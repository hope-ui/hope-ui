import { HopeProvider } from "@hope-ui/theme";
import { JSX } from "solid-js";
import { render } from "solid-testing-library";

export function renderWithHopeProvider(callback: () => JSX.Element) {
  return render(() => (
    <HopeProvider config={{ initialColorMode: "light" }}>{callback}</HopeProvider>
  ));
}
