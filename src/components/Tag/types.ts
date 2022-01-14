import { JSX } from "solid-js";

import { ChildrenProp, ElementType, PolymorphicComponentProps } from "@/components";
import { HopeColor, HopeSize } from "@/theme";

export type TagVariant = "filled" | "light" | "outline" | "dot";

export type ThemeableTagOptions = {
  variant?: TagVariant;
  color?: HopeColor;
  size?: Omit<HopeSize, "xs" | "xl">;
  radius?: HopeSize | "none" | "full";
};

export type TagOptions = ThemeableTagOptions &
  ChildrenProp & {
    leftSection?: JSX.Element;
    rightSection?: JSX.Element;
  };

export type TagProps<C extends ElementType> = PolymorphicComponentProps<C, TagOptions>;
