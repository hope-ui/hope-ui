import { Tuple } from "./Tuple";

export type DefaultHopeColor =
  | "primary"
  | "accent"
  | "neutral"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | (string & {});

/*
export type DefaultMantineColor =
  | 'dark'
  | 'gray'
  | 'red'
  | 'pink'
  | 'grape'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'lime'
  | 'yellow'
  | 'orange'
  | 'teal'
  | (string & {});
*/

export type HopeThemeColorsOverride = {};

export type HopeThemeColors = HopeThemeColorsOverride extends {
  colors: Record<infer CustomColors, Tuple<string, 10>>;
}
  ? Record<CustomColors, Tuple<string, 10>>
  : Record<DefaultHopeColor, Tuple<string, 10>>;

export type HopeColor = keyof HopeThemeColors;
