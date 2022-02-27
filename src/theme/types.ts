import { Accessor } from "solid-js";

import { AlertStyleConfig } from "@/components/alert/alert";
import { ThemeableButtonOptions } from "@/components/button/button";
import { ThemeableCheckboxOptions } from "@/components/checkbox/checkbox";
import { ThemeableFormLabelOptions } from "@/components/form-control/form-label";
import { ThemeableIconButtonOptions } from "@/components/icon-button/icon-button";
import { ThemeableInputOptions } from "@/components/input/input";
import { ThemeableInputGroupOptions } from "@/components/input/input-group";
import { ThemeableRadioOptions } from "@/components/radio/radio";
import { ThemeableSwitchOptions } from "@/components/switch/switch";
import { ThemeableTagOptions } from "@/components/tag/tag";
import { ThemeableTextareaOptions } from "@/components/textarea/textarea";
import { baseTheme } from "@/styled-system/stitches.config";
import { baseThemeTokens } from "@/styled-system/tokens";
import { SystemStyleObject } from "@/styled-system/types";
import { AnchorStyleConfig } from "@/components/anchor/anchor";

export type ColorMode = "light" | "dark" | "system";

/**
 * Hope UI - Stitches theme interface.
 */
export type HopeTheme = typeof baseTheme;

/**
 * Stitches theme config interface.
 */
export type StitchesThemeConfig = {
  [Scale in keyof typeof baseThemeTokens]?: {
    [Token in keyof typeof baseThemeTokens[Scale]]?: boolean | number | string;
  };
} & {
  [Scale in keyof typeof baseThemeTokens]?: {
    [Token in string]: boolean | number | string;
  };
} & {
  [Scale in string]: {
    [Token in string]: boolean | number | string;
  };
};

/**
 * Style configuration for Hope UI single-part component.
 */
export interface SinglePartComponentStyleConfig<Props> {
  /**
   * Style object for base or default style
   */
  baseStyle?: SystemStyleObject;

  /**
   * Default component props values.
   */
  defaultProps?: Props;
}

interface ComponentsStyleConfigs {
  Alert?: AlertStyleConfig;
  Anchor?: AnchorStyleConfig;
  // TODO: refactor style configs below
  Button?: SinglePartComponentStyleConfig<ThemeableButtonOptions>;
  Checkbox?: SinglePartComponentStyleConfig<ThemeableCheckboxOptions>;
  FormLabel?: SinglePartComponentStyleConfig<ThemeableFormLabelOptions>;
  Heading?: SinglePartComponentStyleConfig<void>;
  IconButton?: SinglePartComponentStyleConfig<ThemeableIconButtonOptions>;
  Input?: SinglePartComponentStyleConfig<ThemeableInputOptions>;
  InputGroup?: SinglePartComponentStyleConfig<ThemeableInputGroupOptions>;
  Radio?: SinglePartComponentStyleConfig<ThemeableRadioOptions>;
  Switch?: SinglePartComponentStyleConfig<ThemeableSwitchOptions>;
  Text?: SinglePartComponentStyleConfig<void>;
  Textarea?: SinglePartComponentStyleConfig<ThemeableTextareaOptions>;
  Tag?: SinglePartComponentStyleConfig<ThemeableTagOptions>;
}

/**
 * Hope UI theme override configuration.
 */
export interface HopeThemeConfig {
  initialColorMode?: ColorMode;
  lightTheme?: StitchesThemeConfig;
  darkTheme?: StitchesThemeConfig;
  components?: ComponentsStyleConfigs;
}

export interface HopeContextValue {
  components: ComponentsStyleConfigs;
  theme: Accessor<HopeTheme>;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}
