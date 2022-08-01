import { Property } from "csstype";

import { KeysOf } from "../../types";
import { ThemeColorShade } from "../../types/token";
import { ResponsiveProps } from "./responsive-value";

export type InteractivityProps = ResponsiveProps<{
  /** The CSS `appearance` property. */
  appearance: Property.Appearance;

  /** The CSS `user-select` property. */
  userSelect: Property.UserSelect;

  /** The CSS `pointer-events` property. */
  pointerEvents: Property.PointerEvents;

  /** The CSS `resize` property. */
  resize: Property.Resize;

  /** The CSS `cursor` property. */
  cursor: Property.Cursor;

  /** The CSS `outline` property. */
  outline: Property.Outline<string | 0 | number>;

  /** The CSS `outline-offset` property. */
  outlineOffset: Property.OutlineOffset<string | 0 | number>;

  /** The CSS `outline-color` property. */
  outlineColor: Property.OutlineColor | ThemeColorShade;
}>;

export const interactivityPropNames: KeysOf<InteractivityProps> = {
  appearance: true,
  userSelect: true,
  pointerEvents: true,
  resize: true,
  cursor: true,
  outline: true,
  outlineOffset: true,
  outlineColor: true,
};
