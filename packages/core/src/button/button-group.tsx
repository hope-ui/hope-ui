import { withBemModifiers } from "@hope-ui/utils";
import clsx from "clsx";
import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { ButtonOptions } from "./button";

interface ButtonGroupOptions extends Pick<ButtonOptions, "variant" | "colorScheme" | "size"> {
  /**
   * If `true`, the borderRadius of button that are direct children will be altered
   * to look flushed together.
   */
  isAttached?: boolean;

  /** If `true`, all wrapped button will be disabled. */
  isDisabled?: boolean;
}

type ButtonGroupComponentProps = PropsWithAs<"div", ButtonGroupOptions>;

const baseClass = "hope-button__group";

function ButtonGroupComponent(props: ButtonGroupComponentProps) {
  const [state] = createStore<ButtonGroupState>({
    get variant() {
      return props.variant;
    },
    get colorScheme() {
      return props.colorScheme;
    },
    get size() {
      return props.size;
    },
    get isDisabled() {
      return props.isDisabled;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props,
    ["as", "class", "isAttached"],
    ["variant", "colorScheme", "size", "isDisabled"]
  );

  const classes = () => {
    return clsx(
      local.class,
      baseClass,
      withBemModifiers(baseClass, [local.isAttached ? "is-attached" : null])
    );
  };

  const context: ButtonGroupContextValue = {
    state,
  };

  return (
    <ButtonGroupContext.Provider value={context}>
      <Dynamic component={local.as ?? "div"} role="group" class={classes()} {...others} />
    </ButtonGroupContext.Provider>
  );
}

export const ButtonGroup = createComponentWithAs<"div", ButtonGroupOptions>(ButtonGroupComponent);

/* -------------------------------------------------------------------------------------------------
 * ButtonContent
 * -----------------------------------------------------------------------------------------------*/

type ButtonGroupState = Pick<
  ButtonGroupComponentProps,
  "variant" | "colorScheme" | "size" | "isDisabled"
>;

interface ButtonGroupContextValue {
  state: ButtonGroupState;
}

const ButtonGroupContext = createContext<ButtonGroupContextValue>();

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext);
}
