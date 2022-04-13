import { Show } from "solid-js";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useCheckboxPrimitiveContext } from "./checkbox-primitive";

export type CheckboxPrimitiveIndicatorProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * Renders when the checkbox primitive is in a checked or indeterminate state.
 * You can style this element directly, or you can use it as a wrapper to put an icon into, or both.
 */
export function CheckboxPrimitiveIndicator<C extends ElementType = "span">(props: CheckboxPrimitiveIndicatorProps<C>) {
  const checkboxPrimitiveContext = useCheckboxPrimitiveContext();

  return (
    <Show when={checkboxPrimitiveContext.state.checked || checkboxPrimitiveContext.state.indeterminate}>
      <hope.span
        aria-hidden={true}
        data-indeterminate={checkboxPrimitiveContext.state["data-indeterminate"]}
        data-focus={checkboxPrimitiveContext.state["data-focus"]}
        data-checked={checkboxPrimitiveContext.state["data-checked"]}
        data-required={checkboxPrimitiveContext.state["data-required"]}
        data-disabled={checkboxPrimitiveContext.state["data-disabled"]}
        data-invalid={checkboxPrimitiveContext.state["data-invalid"]}
        data-readonly={checkboxPrimitiveContext.state["data-readonly"]}
        {...props}
      />
    </Show>
  );
}
