import { Accessor } from "solid-js";

import { AlertStyleConfig } from "@/components/alert/alert";
import { AnchorStyleConfig } from "@/components/anchor/anchor";
import { BreadcrumbStyleConfig } from "@/components/breadcrumb/breadcrumb";
import { ButtonStyleConfig } from "@/components/button/button";
import { CheckboxStyleConfig } from "@/components/checkbox/checkbox";
import { CloseButtonStyleConfig } from "@/components/close-button/close-button";
import { DrawerStyleConfig } from "@/components/drawer/drawer";
import { FormControlStyleConfig } from "@/components/form-control/form-control";
import { HeadingStyleConfig } from "@/components/heading/heading";
import { IconButtonStyleConfig } from "@/components/icon-button/icon-button";
import { InputStyleConfig } from "@/components/input/input";
import { ModalStyleConfig } from "@/components/modal/modal";
import { RadioStyleConfig } from "@/components/radio/radio";
import { SpinnerStyleConfig } from "@/components/spinner/spinner";
import { SwitchStyleConfig } from "@/components/switch/switch";
import { TableStyleConfig } from "@/components/table/table";
import { TagStyleConfig } from "@/components/tag/tag";
import { TextStyleConfig } from "@/components/text/text";
import { TextareaStyleConfig } from "@/components/textarea/textarea";
import { TooltipStyleConfig } from "@/components/tooltip/tooltip";
import { baseTheme } from "@/styled-system/stitches.config";
import { baseThemeTokens } from "@/styled-system/tokens";
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
  Breadcrumb?: BreadcrumbStyleConfig;
  Button?: ButtonStyleConfig;
  Checkbox?: CheckboxStyleConfig;
  CloseButton?: CloseButtonStyleConfig;
  Drawer?: DrawerStyleConfig;
  FormControl?: FormControlStyleConfig;
  Heading?: HeadingStyleConfig;
  IconButton?: IconButtonStyleConfig;
  Input?: InputStyleConfig;
  Modal?: ModalStyleConfig;
  Radio?: RadioStyleConfig;
  Spinner?: SpinnerStyleConfig;
  Switch?: SwitchStyleConfig;
  Table?: TableStyleConfig;
  Tag?: TagStyleConfig;
  Text?: TextStyleConfig;
  Textarea?: TextareaStyleConfig;
  Tooltip?: TooltipStyleConfig;
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
