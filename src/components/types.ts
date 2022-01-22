import {
  $$StyledComponentMedia,
  $$StyledComponentProps,
  $$StyledComponentType,
  StyledComponentProps,
  TransformProps,
} from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { Component, ComponentProps, JSX } from "solid-js";

import { StyleProps } from "@/styled-system/props/styleProps";
import { CSSComposer, SystemMedia, SystemStyleObject } from "@/styled-system/types";
import { DOMElements } from "@/styled-system/utils";

/**
 * Represent any HTML element or SolidJS component.
 */
export type ElementType = keyof JSX.IntrinsicElements | Component<any>;

/**
 * Take the props of the passed HTML element or component and returns its type.
 * It uses a more precise version of just ComponentProps on its own.
 * Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
 */
export type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<C, ComponentProps<C>>;

/**
 * All SolidJS props that apply css classes.
 */
type ClassProps = {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<ExtendedProps = unknown, OverrideProps = unknown> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Props of a Hope UI component created with the Hope factory
 */
export type HopeComponentProps<
  Type = "div",
  Props = unknown,
  Media = SystemMedia,
  CSS = SystemStyleObject
> = ExtendableProps<
  Type extends ElementType ? PropsOf<Type> : never,
  ExtendableProps<StyleProps, TransformProps<Props, Media>> &
    ClassProps & {
      as?: Type extends string | ElementType ? Type : never;
      css?: CSS;
    }
>;

/**
 * A Hope UI component created with the Hope factory
 */
export interface HopeComponent<
  Type = "div",
  Props = unknown,
  Media = SystemMedia,
  CSS = SystemStyleObject
> extends Component<HopeComponentProps<Type, Props, Media, CSS>> {
  (
    props: ExtendableProps<
      Type extends ElementType ? PropsOf<Type> : never,
      ExtendableProps<StyleProps, TransformProps<Props, Media>> &
        ClassProps & {
          as?: never;
          css?: CSS;
        }
    >
  ): JSX.Element | null;

  <As extends string | ElementType = Type extends string | ElementType ? Type : never>(
    props: ExtendableProps<
      Type extends ElementType ? PropsOf<Type> : never,
      ExtendableProps<StyleProps, TransformProps<Props, Media>> &
        ClassProps & {
          as?: As;
          css?: CSS;
        }
    >
  ): Component | null;

  className: string;
  displayName: string;
  selector: string;
  toString: () => string;

  [$$StyledComponentType]: Type;
  [$$StyledComponentProps]: Props;
  [$$StyledComponentMedia]: Media;
}

/**
 * Hope factory serves as an object of hope enabled JSX elements,
 * and also a function that can be used to enable custom component receive hope's style props.
 */
export type HopeFactory = {
  <
    Type extends ElementType,
    Composers extends (string | Util.Function | { [name: string]: unknown })[],
    Media = SystemMedia,
    CSS = SystemStyleObject
  >(
    type: Type,
    ...composers: CSSComposer<Composers>
  ): HopeComponent<Type, StyledComponentProps<Composers>, Media, CSS>;
} & {
  [Tag in DOMElements]: HopeComponent<Tag, unknown, SystemMedia, SystemStyleObject>;
};
