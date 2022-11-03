import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

import { kbdStyles } from "./kbd.css";

export const useKbdStyleConfig = createStyleConfig<"root", {}>({
  root: {
    baseStyle: {
      __staticClass: kbdStyles.root,
    },
  },
});

export type KbdStyleConfigProps = StyleConfigProps<typeof useKbdStyleConfig>;
