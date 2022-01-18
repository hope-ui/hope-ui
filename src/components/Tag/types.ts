import { JSX } from "solid-js";

import { HopeColor, HopeSize } from "@/theme";
import { ElementType, PolymorphicComponentProps } from "@/utils";

export type TagVariant = "filled" | "light" | "outline" | "dot";

export type ThemeableTagOptions = {
  variant?: TagVariant;
  color?: HopeColor;
  size?: Omit<HopeSize, "xs" | "xl">;
  radius?: HopeSize | "none" | "full";
};

export type TagOptions = ThemeableTagOptions & {
  leftSection?: JSX.Element;
  rightSection?: JSX.Element;
};

export type TagProps<C extends ElementType> = PolymorphicComponentProps<C, TagOptions>;
