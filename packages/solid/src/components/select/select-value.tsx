import { children, For, JSX, Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { isChildrenFunction } from "../../utils/solid";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectMultiValueStyles, selectSingleValueStyles } from "./select.styles";
import { SelectOptionData } from "./select.utils";
import { SelectTag } from "./select-tag";
import { SelectTagCloseButton } from "./select-tag-close-button";

type SelectValueChildrenRenderProp = (props: { selectedOptions: SelectOptionData[] }) => JSX.Element;

interface SelectValueOptions {
  children?: JSX.Element | SelectValueChildrenRenderProp;
}

export type SelectValueProps<C extends ElementType = "div"> = HTMLHopeProps<C, SelectValueOptions>;

const hopeSelectValueClass = "hope-select__value";

/**
 * The part that reflects the selected value.
 */
export function SelectValue<C extends ElementType = "div">(props: SelectValueProps<C>) {
  const theme = useStyleConfig().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectValueProps<"div">, ["class", "children"]);

  const singleValueClasses = () => classNames(local.class, hopeSelectValueClass, selectSingleValueStyles());

  const multiValueClasses = () => {
    return classNames(local.class, hopeSelectValueClass, selectMultiValueStyles({ size: selectContext.state.size }));
  };

  const onTagCloseButtonClick = (event: MouseEvent, option: SelectOptionData) => {
    event.preventDefault();
    event.stopPropagation();

    selectContext.unselectOption(option);
  };

  const resolvedChildren = children(() => {
    if (isChildrenFunction(local)) {
      return (local.children as SelectValueChildrenRenderProp)?.({
        selectedOptions: selectContext.state.selectedOptions,
      });
    }

    return local.children as JSX.Element;
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
