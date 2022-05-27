import { DeepPartial } from "@hope-ui/utils";

import { ColorMode } from "../color-mode";
import { defaultAlertConfig } from "./alert";
import { defaultButtonConfig } from "./button";

/**
 * Default Hope UI configuration.
 */
export const defaultHopeConfig = {
  initialColorMode: "system" as ColorMode,
  components: {
    Alert: defaultAlertConfig,
    Button: defaultButtonConfig,
  },
};

/**
 * Shape of the Hope UI provider configuration.
 */
export type HopeConfig = typeof defaultHopeConfig;

export type OverrideHopeConfig = DeepPartial<HopeConfig>;

export type HopeComponentNames = keyof HopeConfig["components"];
