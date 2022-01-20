import { StyledComponentProps, TransformProps } from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { Component, ComponentProps, JSX, PropsWithChildren } from "solid-js";

import { StyleProps } from "@/styled-system/props/styleProps";
import { CSSComposer, SystemMedia } from "@/styled-system/types";
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
export type ClassProps = {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
};

/**
 * The `as` props is an override of the default HTML tag.
 * Can also be another SolidJS component.
 */
export type AsProp<C extends ElementType> = {
  as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<
  ExtendedProps = Record<string, unknown>,
  OverrideProps = Record<string, unknown>
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type PolymorphicComponentProps<
  C extends ElementType,
  Props = Record<string, unknown>
> = ExtendableProps<PropsOf<C>, PropsWithChildren<Props & AsProp<C> & ClassProps>>;

/**
 * Props of an Hope UI component created with the Hope factory
 */
export type HopeComponentProps<
  C extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
> = PolymorphicComponentProps<
  C,
  /**
   * Override StyleProps with Stitches variant props that have same name.
   *
   * Order of priority/override for props that has same name is :
   * 1. Stitches variant props
   * 2. Style props
   * 3. Component props
   * */
  ExtendableProps<StyleProps, TransformProps<StyledComponentProps<Composers>, SystemMedia>>
>;

/**
 * An Hope UI component created with the Hope factory
 */
export type HopeComponent<
  C extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
> = {
  <T extends ElementType = C>(props: HopeComponentProps<T, Composers>): JSX.Element;
  className: string;
  displayName: string;
  selector: string;
  toString: () => string;
};

/**
 * Hope factory serves as an object of hope enabled JSX elements,
 * and also a function that can be used to enable custom component receive hope's style props.
 */
export type HopeFactory = {
  <
    C extends ElementType,
    Composers extends (string | Util.Function | { [name: string]: unknown })[]
  >(
    component: C,
    ...composers: CSSComposer<Composers>
  ): HopeComponent<C, Composers>;
} & {
  [Tag in DOMElements]: HopeComponent<Tag, []>;
};
