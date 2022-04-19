import { Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { IconCheck } from "../icons/IconCheck";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptionIndicatorStyles } from "./select.styles";
import { useSelectOptionContext } from "./select-option";

export type SelectOptionIndicatorProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSelectOptionIndicatorClass = "hope-select__option-indicator";

/**
 * Visual indicator rendered when the option is selected.
 */
export function SelectOptionIndicator<C extends ElementType = "span">(props: SelectOptionIndicatorProps<C>) {
  const theme = useStyleConfig().Select;

  const selectOptionContext = useSelectOptionContext();

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectOptionIndicatorClass, selectOptionIndicatorStyles());

  return (
    <Show when={selectOptionContext.selected()}>
      <hope.span class={classes()} __baseStyle={theme?.baseStyle?.optionIndicator} {...others}>
        <Show when={local.children} fallback={<IconCheck aria-hidden="true" boxSize="$5" />}>
          {local.children}
        </Show>
      </hope.span>
    </Show>
  );
}

SelectOptionIndicator.toString = () => createClassSelector(hopeSelectOptionIndicatorClass);
