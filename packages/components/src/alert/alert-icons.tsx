import type { AlertColorScheme } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";

// hope's built-in status glyphs — hand-inlined Lucide paths (hope ships no icon-library dependency),
// `stroke="currentColor"` so they adopt the surface/role color the recipe sets, and `aria-hidden`
// (the accessible name comes from the title/description). The recipe's `icon` slot sizes them per
// `size`. Only the four status roles have one; `primary`/`neutral` ship none.

function statusSvg(children: JSX.Element): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Lucide `info`. */
const InfoIcon = (): JSX.Element =>
  statusSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>,
  );

/** Lucide `circle-check`. */
const CircleCheckIcon = (): JSX.Element =>
  statusSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>,
  );

/** Lucide `triangle-alert`. */
const TriangleAlertIcon = (): JSX.Element =>
  statusSvg(
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>,
  );

/** Lucide `circle-x`. */
const CircleXIcon = (): JSX.Element =>
  statusSvg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>,
  );

/** The built-in glyph per role (`primary`/`neutral` ship none — they need an explicit `icon`). */
export const BUILTIN_STATUS_ICONS: Record<AlertColorScheme, (() => JSX.Element) | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  danger: CircleXIcon,
};

/** The `AlertThemeableProps` factory key that supplies a preset-level default glyph, per role. */
export type StatusIconKey = "infoIcon" | "successIcon" | "warningIcon" | "dangerIcon";

export const STATUS_ICON_KEYS: Record<AlertColorScheme, StatusIconKey | undefined> = {
  primary: undefined,
  neutral: undefined,
  info: "infoIcon",
  success: "successIcon",
  warning: "warningIcon",
  danger: "dangerIcon",
};
