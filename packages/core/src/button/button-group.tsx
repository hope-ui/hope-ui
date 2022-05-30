import { withBemModifiers } from "@hope-ui/utils";
import clsx from "clsx";
import { Accessor, createContext, splitProps, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { ButtonOptions } from "./button";

interface ButtonGroupOptions extends Pick<ButtonOptions, "variant" | "colorScheme" | "size"> {
  /** If `true`, the borderRadius of button that are direct children will be altered to look flushed together. */
  isAttached?: boolean;

  /** If `true`, all wrapped button will be disabled. */
  isDisabled?: boolean;
}

export type ButtonGroupComponentProps = PropsWithAs<"div", ButtonGroupOptions>;

const baseClass = "hope-button__group";

function ButtonGroupComponent(props: ButtonGroupComponentProps) {
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "isAttached",
    "variant",
    "colorScheme",
    "size",
    "isDisabled",
  ]);

  const classes = () => {
    return clsx(
      local.class,
      baseClass,
      withBemModifiers(baseClass, [local.isAttached ? "is-attached" : null])
    );
  };

  const context: ButtonGroupContextValue = {
    variant: () => local.variant,
    colorScheme: () => local.colorScheme,
    size: () => local.size,
    isDisabled: () => local.isDisabled,
  };

  return (
    <ButtonGroupContext.Provider value={context}>
      <Dynamic component={local.as ?? "div"} role="group" class={classes()} {...others} />
    </ButtonGroupContext.Provider>
  );
}

/**
 * ButtonGroup handles a grouping of buttons whose actions are related to each other.
 */
export const ButtonGroup = createComponentWithAs<"div", ButtonGroupOptions>(ButtonGroupComponent);

/* -------------------------------------------------------------------------------------------------
 * ButtonContent
 * -----------------------------------------------------------------------------------------------*/

interface ButtonGroupContextValue {
  variant: Accessor<ButtonGroupOptions["variant"]>;
  colorScheme: Accessor<ButtonGroupOptions["colorScheme"]>;
  size: Accessor<ButtonGroupOptions["size"]>;
  isDisabled: Accessor<ButtonGroupOptions["isDisabled"]>;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue>();

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext);
}
