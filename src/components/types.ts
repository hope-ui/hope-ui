import { Component, ComponentProps, JSX, PropsWithChildren } from "solid-js";

import { SystemStyleObject } from "@/theme/types";

/**
 * Represent any HTML element or SolidJS component.
 */
export type ElementType = keyof JSX.IntrinsicElements | Component<any>;

/**
 * Take the props of the passed HTML element or component and returns its type.
 * It uses a more precise version of just ComponentProps on its own.
 * Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
 */
type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<C, ComponentProps<C>>;

/**
 * All SolidJS props that apply css classes.
 */
export type ClassProps = {
  class?: string;
  className?: string;
  classList?: { [key: string]: boolean };
};

/**
 * The `css` prop allow you to override styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type CSSProp = {
  css?: SystemStyleObject;
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
export type ExtendableProps<ExtendedProps = unknown, OverrideProps = unknown> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type PolymorphicComponentProps<C extends ElementType, Props = unknown> = ExtendableProps<
  PropsOf<C>,
  PropsWithChildren<Props & ClassProps & CSSProp & AsProp<C>>
>;
