import { JSX } from "solid-js";
import { render } from "solid-testing-library";

import { HopeProvider } from "../theme/provider";
import { HopeThemeConfig } from "../theme/types";

export function renderWithHopeProvider(callback: () => JSX.Element, config: HopeThemeConfig = {}) {
  return render(() => <HopeProvider config={config}>{callback}</HopeProvider>);
}
