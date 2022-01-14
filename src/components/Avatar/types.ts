import { Component } from "solid-js";

import { HopeColor, HopeSize } from "@/theme";

import { ElementType, PolymorphicComponentProps } from "..";

export type AvatarType = "image" | "name" | "icon";

export type AvatarVariant = "filled" | "light";

export type ThemeableAvatarOptions = {
  variant?: AvatarVariant;
  color?: HopeColor;
  size?: HopeSize;
  radius?: HopeSize | "none" | "full";
  icon?: Component<any>;
  getInitials?: (name: string) => string;
};

export type AvatarOptions = ThemeableAvatarOptions & {
  src?: string;
  name?: string;
};

export type AvatarProps<C extends ElementType> = PolymorphicComponentProps<C, AvatarOptions>;
