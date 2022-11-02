import { ThemeProvider, ThemeProviderProps } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { ColorModeProvider, ColorModeProviderProps } from "../color-mode";
import { watchModals } from "../modal";
import { mergeDefaultProps } from "../utils";

export function HopeProvider(props: ColorModeProviderProps & ThemeProviderProps) {
  watchModals();

  props = mergeDefaultProps({ withCssReset: true }, props);

  const [local, others] = splitProps(props, ["storageManager", "disableTransitionOnChange"]);

  return (
    <ColorModeProvider
      storageManager={local.storageManager}
      disableTransitionOnChange={local.disableTransitionOnChange}
    >
      <ThemeProvider {...others} />
    </ColorModeProvider>
  );
}
