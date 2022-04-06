import { Accessor } from "solid-js";

import { AccordionStyleConfig } from "../components/accordion/accordion";
import { AlertStyleConfig } from "../components/alert/alert";
import { AnchorStyleConfig } from "../components/anchor/anchor";
import { AvatarStyleConfig } from "../components/avatar/avatar";
import { BadgeStyleConfig } from "../components/badge/badge";
import { BreadcrumbStyleConfig } from "../components/breadcrumb/breadcrumb";
import { ButtonStyleConfig } from "../components/button/button";
import { CheckboxStyleConfig } from "../components/checkbox/checkbox";
import { CircularProgressStyleConfig } from "../components/circular-progress/circular-progress";
import { CloseButtonStyleConfig } from "../components/close-button/close-button";
import { DrawerStyleConfig } from "../components/drawer/drawer";
import { FormControlStyleConfig } from "../components/form-control/form-control";
import { HeadingStyleConfig } from "../components/heading/heading";
import { IconButtonStyleConfig } from "../components/icon-button/icon-button";
import { InputStyleConfig } from "../components/input/input";
import { KbdStyleConfig } from "../components/kbd/kbd";
import { MenuStyleConfig } from "../components/menu/menu";
import { ModalStyleConfig } from "../components/modal/modal";
import { NotificationStyleConfig } from "../components/notification/notification";
import { PopoverStyleConfig } from "../components/popover/popover";
import { ProgressStyleConfig } from "../components/progress/progress";
import { RadioStyleConfig } from "../components/radio/radio";
import { SelectStyleConfig } from "../components/select/select";
import { SpinnerStyleConfig } from "../components/spinner/spinner";
import { SwitchStyleConfig } from "../components/switch/switch";
import { TableStyleConfig } from "../components/table/table";
import { TabsStyleConfig } from "../components/tabs/tabs";
import { TagStyleConfig } from "../components/tag/tag";
import { TextStyleConfig } from "../components/text/text";
import { TextareaStyleConfig } from "../components/textarea/textarea";
import { TooltipStyleConfig } from "../components/tooltip/tooltip";
import { baseTheme } from "../styled-system/stitches.config";
import { baseThemeTokens } from "../styled-system/tokens";

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

export interface ComponentStyleConfigs {
  Accordion?: AccordionStyleConfig;
  Alert?: AlertStyleConfig;
  Anchor?: AnchorStyleConfig;
  Avatar?: AvatarStyleConfig;
  Badge?: BadgeStyleConfig;
  Breadcrumb?: BreadcrumbStyleConfig;
  Button?: ButtonStyleConfig;
  Checkbox?: CheckboxStyleConfig;
  CircularProgress?: CircularProgressStyleConfig;
  CloseButton?: CloseButtonStyleConfig;
  Drawer?: DrawerStyleConfig;
  FormControl?: FormControlStyleConfig;
  Heading?: HeadingStyleConfig;
  IconButton?: IconButtonStyleConfig;
  Input?: InputStyleConfig;
  Kbd?: KbdStyleConfig;
  Menu?: MenuStyleConfig;
  Modal?: ModalStyleConfig;
  Notification?: NotificationStyleConfig;
  Popover?: PopoverStyleConfig;
  Progress?: ProgressStyleConfig;
  Radio?: RadioStyleConfig;
  Select?: SelectStyleConfig;
  Spinner?: SpinnerStyleConfig;
  Switch?: SwitchStyleConfig;
  Table?: TableStyleConfig;
  Tabs?: TabsStyleConfig;
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
  components?: ComponentStyleConfigs;
}

export interface HopeContextValue {
  components: ComponentStyleConfigs;
  theme: Accessor<HopeTheme>;
  colorMode: Accessor<ColorMode>;
  setColorMode: (value: ColorMode) => void;
  toggleColorMode: () => void;
}
