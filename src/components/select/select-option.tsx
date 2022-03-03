import { createEffect, createSignal, mergeProps, onMount, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionStyles } from "./select.styles";

interface SelectOptionOptions {
  /**
   * The value of the option.
   */
  value: string;

  /**
   * If `true`, the option will be disabled.
   */
  disabled?: boolean;
}

export type SelectOptionProps<C extends ElementType = "li"> = HTMLHopeProps<C, SelectOptionOptions>;

const hopeSelectOptionClass = "hope-select__option";

export function SelectOption<C extends ElementType = "li">(props: SelectOptionProps<C>) {
  const selectContext = useSelectContext();

  const [index, setIndex] = createSignal<number>(-1);

  let optionRef: HTMLLIElement | undefined;

  const defaultProps: Omit<SelectOptionProps<"li">, "value"> = {
    as: "li",
  };

  const propsWithDefault: SelectOptionProps<"li"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["ref", "class", "value", "disabled"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSelectOptionClass,
      selectOptionStyles({
        active: isActiveDescendant(),
        selected: isSelected(),
        disabled: local.disabled,
      })
    );
  };

  const id = () => `${selectContext.state.optionIdPrefix}-${index()}`;

  const isSelected = () => local.value === selectContext.state.value;

  const isActiveDescendant = () => index() === selectContext.state.activeIndex;

  const onOptionClick = (event: MouseEvent) => {
    event.stopPropagation();
    selectContext.onOptionClick(index());
  };

  onMount(() => {
    const optionIndex = selectContext.setOptionMounted(local.value);
    setIndex(optionIndex);
  });

  createEffect(() => {
    if (isActiveDescendant() && optionRef) {
      selectContext.scrollToOption(optionRef);
    }
  });

  const assignOptionRef = (el: HTMLLIElement) => {
    optionRef = el;

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return (
    <Box
      ref={assignOptionRef}
      role="option"
      id={id()}
      aria-selected={isSelected()}
      class={classes()}
      onClick={onOptionClick}
      onMouseDown={selectContext.onOptionMouseDown}
      {...others}
    />
  );
}

SelectOption.toString = () => createClassSelector(hopeSelectOptionClass);
