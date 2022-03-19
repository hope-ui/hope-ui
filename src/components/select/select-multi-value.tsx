import { For, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { Tag } from "../tag/tag";
import { TagCloseButton } from "../tag/tag-close-button";
import { TagLabel } from "../tag/tag-label";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectMultiValueStyles } from "./select.styles";
import { SelectOptionData } from "./select.utils";

export type SelectMultiValueProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectMultiValueClass = "hope-select__multi-value";

/**
 * The part that reflects the selected values (multi-select).
 */
export function SelectMultiValue<C extends ElementType = "div">(props: SelectMultiValueProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSelectMultiValueClass, selectMultiValueStyles());

  const onTagCloseButtonClick = (event: MouseEvent, option: SelectOptionData) => {
    event.preventDefault();
    event.stopPropagation();

    selectContext.unselectOption(option);
  };

  return (
    <Show when={selectContext.state.hasSelectedOptions}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.multiValue} {...others}>
        <For each={selectContext.state.selectedOptions}>
          {option => (
            <Tag variant="subtle" colorScheme="neutral" size="md" rounded="$sm">
              <TagLabel>{option.textValue}</TagLabel>
              <TagCloseButton me="-4px" onClick={(e: MouseEvent) => onTagCloseButtonClick(e, option)} />
            </Tag>
          )}
        </For>
      </Box>
    </Show>
  );
}

SelectMultiValue.toString = () => createClassSelector(hopeSelectMultiValueClass);
