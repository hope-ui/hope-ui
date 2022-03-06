import { mergeProps, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { IconCheck } from "../icons/IconCheck";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptionIndicatorStyles } from "./select.styles";
import { useSelectOptionContext } from "./select-option";

const hopeSelectOptionIndicatorClass = "hope-select__option__indicator";

export type SelectOptionIndicatorProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * Visual indicator rendered when the option is selected.
 */
export function SelectOptionIndicator<C extends ElementType = "span">(props: SelectOptionIndicatorProps<C>) {
  const selectOptionContext = useSelectOptionContext();

  const defaultProps: SelectOptionIndicatorProps<"span"> = {
    as: "span",
  };

  const propsWithDefault: SelectOptionIndicatorProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectOptionIndicatorClass, selectOptionIndicatorStyles());

  return (
    <Show when={selectOptionContext().selected}>
      <Box class={classes()} {...others}>
        <Show when={local.children} fallback={<IconCheck aria-hidden="true" boxSize="$5" />}>
          {local.children}
        </Show>
      </Box>
    </Show>
  );
}

SelectOptionIndicator.toString = () => createClassSelector(hopeSelectOptionIndicatorClass);
