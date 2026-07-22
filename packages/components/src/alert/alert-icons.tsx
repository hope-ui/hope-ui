import type { AlertColorScheme, AlertStatusIconKey } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon } from "../icons";

// The Alert status role → built-in glyph mapping. The glyphs themselves live in the shared `../icons`
// set (hand-inlined Lucide paths, `currentColor` stroke, `aria-hidden`, sized by the recipe's `icon`
// slot); this file owns only which glyph each `colorScheme` role gets. Only the four status roles have
// one; `primary`/`neutral` ship none (they need an explicit `icon`).

/** The built-in glyph per role (`primary`/`neutral` ship none — they need an explicit `icon`). */
export const BUILTIN_STATUS_ICONS: Record<AlertColorScheme, (() => JSX.Element) | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleXIcon,
};

// `AlertStatusIconKey` (the `{role}Icon` factory keys) is owned by `@hope-ui/theming`, constructed
// there from `AlertStatusRole`. Typing the values against it means renaming a status role in the
// theming contract is a **compile error** here (a value literal stops matching), never a silent miss.
export const STATUS_ICON_KEYS: Record<AlertColorScheme, AlertStatusIconKey | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: "infoIcon",
  success: "successIcon",
  warning: "warningIcon",
  danger: "dangerIcon",
};
