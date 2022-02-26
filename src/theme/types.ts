import { Accessor } from "solid-js";

import { ThemeableAlertOptions } from "@/components/alert/alert";
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
import { SystemStyleObject } from "@/styled-system/types";

export type ColorMode = "light" | "dark" | "system";

/**
 * Hope UI - Stitches theme interface.
 */
export type HopeTheme = typeof baseTheme;

/**
 * Stitches theme config interface.
 */
export type StitchesThemeConfig = {
  [Scale in keyof HopeTheme]?: {
    [Token in keyof HopeTheme[Scale]]?: boolean | number | string;
  };
} & {
  [scale in string]: {
    [token in number | string]: boolean | number | string;
  };
};

/**
 * Theme configuration for Hope UI component.
 */
export interface ComponentStyle<Props> {
  /**
   * Style object for base or default style
   */
  baseStyle?: SystemStyleObject;

  /**
   * Default component props values.
   */
  defaultProps?: Props;
}

export interface ComponentsStyles {
  Alert?: ComponentStyle<ThemeableAlertOptions>;
  Button?: ComponentStyle<ThemeableButtonOptions>;
  Checkbox?: ComponentStyle<ThemeableCheckboxOptions>;
  FormLabel?: ComponentStyle<ThemeableFormLabelOptions>;
  Heading?: ComponentStyle<void>;
  IconButton?: ComponentStyle<ThemeableIconButtonOptions>;
  Input?: ComponentStyle<ThemeableInputOptions>;
  InputGroup?: ComponentStyle<ThemeableInputGroupOptions>;
  Radio?: ComponentStyle<ThemeableRadioOptions>;
  Switch?: ComponentStyle<ThemeableSwitchOptions>;
  Text?: ComponentStyle<void>;
  Textarea?: ComponentStyle<ThemeableTextareaOptions>;
  Tag?: ComponentStyle<ThemeableTagOptions>;
}

/**
 * Hope UI theme override configuration.
 */
export interface HopeThemeConfig<T extends StitchesThemeConfig = StitchesThemeConfig> {
  initialColorMode?: ColorMode;
  lightTheme?: T;
  darkTheme?: T;
  components?: ComponentsStyles;
}

// export interface HopeContextValue<T extends HopeTheme = HopeTheme> {
export interface HopeContextValue {
  components: ComponentsStyles;
  theme: Accessor<HopeTheme>;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}
