import { ComponentProps, JSX, mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType } from "../components/types";
import { css, SystemStyleObject } from "./stitches.config";

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithoutRef on its own
type PropsOf<C extends ElementType> = JSX.LibraryManagedAttributes<C, ComponentProps<C>>;

type PropsOfMaybeStyledComponent<C extends ElementType> = C extends StyledComponent<infer P>
  ? PropsOf<P>
  : PropsOf<C>;

type AsProp<C extends ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another SolidJS component.
   */
  as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
type ExtendableProps<ExtendedProps = {}, OverrideProps = {}> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
type InheritableElementProps<C extends ElementType, Props = {}> = ExtendableProps<
  PropsOfMaybeStyledComponent<C>,
  Props
>;

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
type PolymorphicComponentProps<C extends ElementType, Props = {}> = InheritableElementProps<
  C,
  Props & AsProp<C>
>;

/**
 * A more sophisticated version of `PolymorphicComponentProps` where
 * the passed in `sx` prop will apply stitches styles
 */
type StyledComponentProps<C extends ElementType, Props = {}> = PolymorphicComponentProps<
  C,
  Props & { sx?: SystemStyleObject; className?: string }
>;

type StyledComponent<C extends ElementType> = <OverrideElement extends ElementType = C>(
  props: StyledComponentProps<OverrideElement>
) => JSX.Element;

export function styled<T extends ElementType>(element: T, styles: SystemStyleObject = {}) {
  const cssComponent = css(styles);

  const styledComponent: StyledComponent<T> = props => {
    const propsWithDefault = mergeProps(
      {
        as: element,
        sx: {},
        className: "",
      },
      props
    );

    const [local, others] = splitProps(propsWithDefault, ["as", "sx", "className"]);

    const classNames = [cssComponent({ css: local.sx }), local.className].join(" ");

    return <Dynamic {...others} component={local.as} className={classNames} />;
  };

  return styledComponent;
}
