import { splitProps } from "solid-js";

import { SelectOption, SelectOptionIndicator, SelectOptionProps, SelectOptionText } from "../select";
import { ElementType } from "../types";

/**
 * A simple abstraction built on top of `SelectOption`.
 * Use this if you don't need to customize every parts of `SelectOption` and want a simpler API.
 */
export function SimpleOption<C extends ElementType = "div">(props: SelectOptionProps<C>) {
  const [local, others] = splitProps(props, ["children", "value"]);

  return (
    <SelectOption value={local.value} {...others}>
      <SelectOptionText>{local.children}</SelectOptionText>
      <SelectOptionIndicator />
    </SelectOption>
  );
}
