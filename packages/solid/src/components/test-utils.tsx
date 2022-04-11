import { JSX } from "solid-js";
import { render } from "solid-testing-library";

import { HopeProvider, HopeThemeConfig } from "../hope-provider";

export function renderWithHopeProvider(callback: () => JSX.Element, config: HopeThemeConfig = {}) {
  return render(() => <HopeProvider config={config}>{callback}</HopeProvider>);
}
