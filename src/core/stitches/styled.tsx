import { ComponentProps, JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType } from "../components/types";
import { css, SystemStyleObject } from "./stitches.config";

type UIPieceProps<T extends ElementType> = {
  as?: T;
  sx?: SystemStyleObject;
  children?: JSX.Element;
};

type StyledComponentProps<T extends ElementType> = UIPieceProps<T> &
  Omit<ComponentProps<T>, keyof UIPieceProps<T>>;

export function styled<T extends ElementType>(element: T, styles: SystemStyleObject = {}) {
  const cssComponent = css(styles);

  return <U extends ElementType = T>(props: StyledComponentProps<U>) => {
    const [local, others] = splitProps(props, ["as", "sx"]);
    const component = local.as || element;

    return (
      <Dynamic component={component} className={cssComponent({ css: local.sx })} {...others} />
    );
  };
}
