import { children, For, JSX, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectMultiValueStyles, selectSingleValueStyles } from "./select.styles";
import { SelectOptionData } from "./select.utils";
import { SelectTag } from "./select-tag";
import { SelectTagCloseButton } from "./select-tag-close-button";

interface SelectValueOptions {
  children?: JSX.Element | ((props: { selectedOptions: SelectOptionData[] }) => JSX.Element);
}

export type SelectValueProps<C extends ElementType = "div"> = HTMLHopeProps<C, SelectValueOptions>;

const hopeSelectValueClass = "hope-select__value";

/**
 * The part that reflects the selected value.
 */
export function SelectValue<C extends ElementType = "div">(props: SelectValueProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectValueProps<"div">, ["class", "children"]);

  const singleValueClasses = () => classNames(local.class, hopeSelectValueClass, selectSingleValueStyles());

  const multiValueClasses = () => classNames(local.class, hopeSelectValueClass, selectMultiValueStyles());

  const onTagCloseButtonClick = (event: MouseEvent, option: SelectOptionData) => {
    event.preventDefault();
    event.stopPropagation();

    selectContext.unselectOption(option);
  };

  const resolvedChildren = children(() => {
    if (isFunction(local.children)) {
      return local.children({ selectedOptions: selectContext.state.selectedOptions });
    }

    return local.children;
  });

  return (
    <Show when={selectContext.state.hasSelectedOptions}>
      <Show when={!resolvedChildren()} fallback={resolvedChildren()}>
        <Show
          when={selectContext.state.multiple}
          fallback={
            <Box class={singleValueClasses()} __baseStyle={theme?.baseStyle?.singleValue} {...others}>
              {selectContext.state.selectedOptions[0].textValue}
            </Box>
          }
        >
          <Box class={multiValueClasses()} __baseStyle={theme?.baseStyle?.multiValue} {...others}>
            <For each={selectContext.state.selectedOptions}>
              {option => (
                <SelectTag>
                  <span>{option.textValue}</span>
                  <SelectTagCloseButton onClick={(e: MouseEvent) => onTagCloseButtonClick(e, option)} />
                </SelectTag>
              )}
            </For>
          </Box>
        </Show>
      </Show>
    </Show>
  );
}

SelectValue.toString = () => createClassSelector(hopeSelectValueClass);
