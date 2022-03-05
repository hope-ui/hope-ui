import { mergeProps, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { createIcon } from "../icon/create-icon";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptionIndicatorStyles } from "./select.styles";
import { useSelectOptionContext } from "./select-option";

const hopeSelectOptionIndicatorClass = "hope-select__option__indicator";

export type SelectOptionIndicatorProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const SelectOptionCheckIcon = createIcon({
  path: () => (
    <g fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </g>
  ),
});

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
        <Show when={local.children} fallback={<SelectOptionCheckIcon aria-hidden="true" boxSize="$5" />}>
          {local.children}
        </Show>
      </Box>
    </Show>
  );
}

SelectOptionIndicator.toString = () => createClassSelector(hopeSelectOptionIndicatorClass);
