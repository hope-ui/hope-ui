import { For, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { HStack } from "../stack/stack";
import { Tag } from "../tag/tag";
import { TagCloseButton } from "../tag/tag-close-button";
import { TagLabel } from "../tag/tag-label";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectValueStyles } from "./select.styles";
import { SelectOptionData } from "./select.utils";

export type SelectValueProps<C extends ElementType = "span"> = HTMLHopeProps<C>;
const hopeSelectValueClass = "hope-select__value";

/**
 * The part that reflects the selected value.
 */
export function SelectValue<C extends ElementType = "span">(props: SelectValueProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectValueProps<"span">, ["class"]);

  const classes = () => classNames(local.class, hopeSelectValueClass, selectValueStyles());

  const unselectOption = (event: MouseEvent, option: SelectOptionData) => {
    event.preventDefault();
    event.stopPropagation();

    selectContext.onSelectTagCloseButtonClick(option);
  };

  return (
    <Show
      when={selectContext.state.multiple}
      fallback={
        <hope.span class={classes()} __baseStyle={theme?.baseStyle?.value} {...others}>
          {selectContext.state.selectedOptions[0].textValue}
        </hope.span>
      }
    >
      <HStack wrap="wrap" spacing="$1" py="$1" mt="-4px" class={classes()} {...others}>
        <For each={selectContext.state.selectedOptions}>
          {option => (
            <Tag colorScheme="neutral" size="sm" mt="4px">
              <TagLabel>{option.textValue}</TagLabel>
              <TagCloseButton onClick={(e: MouseEvent) => unselectOption(e, option)} />
            </Tag>
          )}
        </For>
      </HStack>
    </Show>
  );
}

SelectValue.toString = () => createClassSelector(hopeSelectValueClass);
