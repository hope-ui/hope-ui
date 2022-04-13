import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSwitcPrimitivehContext } from "./switch-primitive";

export type SwitchPrimitiveThumbProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * The thumb that is used to visually indicate whether the switch is on or off.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export function SwitchPrimitiveThumb<C extends ElementType = "span">(props: SwitchPrimitiveThumbProps<C>) {
  const switchPrimitiveContext = useSwitcPrimitivehContext();

  return (
    <hope.span
      aria-hidden={true}
      data-focus={switchPrimitiveContext.state["data-focus"]}
      data-checked={switchPrimitiveContext.state["data-checked"]}
      data-required={switchPrimitiveContext.state["data-required"]}
      data-disabled={switchPrimitiveContext.state["data-disabled"]}
      data-invalid={switchPrimitiveContext.state["data-invalid"]}
      data-readonly={switchPrimitiveContext.state["data-readonly"]}
      {...props}
    />
  );
}
