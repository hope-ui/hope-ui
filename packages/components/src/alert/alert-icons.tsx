import type { AlertColorScheme, AlertStatusIconKey } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon } from "../icons";

// This file owns only *which* glyph each role gets; the glyphs themselves live in the shared
// `../icons` set.

/** The built-in glyph per role (`primary`/`neutral` ship none — they need an explicit `icon`). */
export const BUILTIN_STATUS_ICONS: Record<AlertColorScheme, (() => JSX.Element) | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleXIcon,
};

// Maps each role to the name of the prop a preset overrides its glyph with. Typing the *values*
// against the theming contract's own key union is what makes renaming a role over there a compile
// error here — the literal stops matching — rather than a silently unreachable branch.
export const STATUS_ICON_KEYS: Record<AlertColorScheme, AlertStatusIconKey | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: "infoIcon",
  success: "successIcon",
  warning: "warningIcon",
  danger: "dangerIcon",
};
