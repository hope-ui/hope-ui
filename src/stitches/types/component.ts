import type { StyledComponentProps } from "@stitches/core/types/styled-component";
import type * as Util from "@stitches/core/types/util";
import { Component, ComponentProps, JSX } from "solid-js";

import { SystemStyleObject } from "..";
import { PseudoProps, StyleProps } from ".";

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
 * The children prop allow passing others HTML element or components between a component tag
 */
export type ChildrenProp = {
  children?: JSX.Element;
};

/**
 * All SolidJS props that apply css classes.
 */
export type ClassProps = {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
};

/**
 * The `sx` props allow you to overriding styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type SxProp = {
  sx?: SystemStyleObject;
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
export type InheritableElementProps<
  C extends ElementType,
  Props = Record<string, unknown>
> = ExtendableProps<PropsOf<C>, Props>;

/**
 * Props of an Hope UI component
 */
type HopeComponentProps<C extends ElementType> = InheritableElementProps<
  C,
  ChildrenProp & ClassProps & StyleProps & PseudoProps & SxProp
>;

/**
 * Props of a styled Hope UI component
 */
export type HopeStyledComponentProps<
  C extends ElementType,
  Composers extends (string | Util.Function | { [name: string]: unknown })[]
> = StyledComponentProps<Composers> &
  Omit<HopeComponentProps<C>, keyof StyledComponentProps<Composers>> &
  AsProp<C>;
