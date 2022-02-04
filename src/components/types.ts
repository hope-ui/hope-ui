import { Component, ComponentProps, JSX, PropsWithChildren } from "solid-js";

import { StyleProps } from "@/styled-system/system";
import { SystemStyleObject } from "@/styled-system/types";
import { RightJoinProps } from "@/utils/types";

/**
 * Represent any HTML element or SolidJS component.
 */
export type ElementType = keyof JSX.IntrinsicElements | Component;

/**
 * Take the props of the passed HTML element or component and returns its type.
 * It uses a more precise version of just ComponentProps on its own.
 * Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
 */
export type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<C, ComponentProps<C>>;

/**
 * All SolidJS props that apply css classes.
 */
export interface ClassProps {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
}

/**
 * Props of a Hope UI component.
 */
export type HopeComponentProps<
  AsComponent extends ElementType,
  AdditionalProps extends object = {}
> = RightJoinProps<
  PropsOf<AsComponent>,
  PropsWithChildren<AdditionalProps> &
    StyleProps &
    ClassProps & {
      as?: AsComponent;
      __baseStyle?: SystemStyleObject;
    }
>;
