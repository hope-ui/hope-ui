import { ComponentTheme, HopeProps } from "@hope-ui/styles";
import { ParentProps } from "solid-js";

import { BaseModalProps, ModalContextValue, ModalThemeProps } from "../modal";
import { DrawerStyleConfigProps } from "./drawer.styles";

export interface DrawerProps
  extends BaseModalProps,
    Omit<DrawerStyleConfigProps, keyof HopeProps>,
    ParentProps {}

export type DrawerTheme = ComponentTheme<DrawerProps, ModalThemeProps>;

export type DrawerContextValue = ModalContextValue;
