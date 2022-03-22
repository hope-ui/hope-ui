import { Show, splitProps } from "solid-js";

import {
  Select,
  SelectContent,
  SelectIcon,
  SelectListbox,
  SelectPlaceholder,
  SelectProps,
  SelectTrigger,
  SelectValue,
} from "../select";
import { HTMLHopeProps } from "../types";

interface SimpleSelectOptions extends SelectProps {
  /**
   * The placeholder to display when no option is selected.
   */
  placeholder?: string;
}

export type SimpleSelectProps = HTMLHopeProps<"button", SimpleSelectOptions>;

/**
 * A simple abstraction built on top of `Select`.
 * Use this if you don't need to customize every parts of `Select` and want a simpler API.
 */
export function SimpleSelect(props: SimpleSelectProps) {
  const [local, selectProps, others] = splitProps(
    props,
    ["children", "placeholder"],
    [
      "variant",
      "size",
      "offset",
      "compareKey",
      "id",
      "multiple",
      "value",
      "defaultValue",
      "required",
      "disabled",
      "invalid",
      "readOnly",
      "onChange",
      "onFocus",
      "onBlur",
    ]
  );

  return (
    <Select {...selectProps}>
      <SelectTrigger {...others}>
        <Show when={local.placeholder}>
          <SelectPlaceholder>{local.placeholder}</SelectPlaceholder>
        </Show>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectListbox>{local.children}</SelectListbox>
      </SelectContent>
    </Select>
  );
}
