import { createEffect, createSignal, mergeProps, onMount, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionStyles } from "./select.styles";

interface SelectOptionOptions<T> {
  /**
   * The value of the option.
   */
  value: T;

  /**
   * If `true`, the option will be disabled.
   */
  disabled?: boolean;
}

export type SelectOptionProps<C extends ElementType = "li", T = any> = HTMLHopeProps<C, SelectOptionOptions<T>>;

const hopeSelectOptionClass = "hope-select__option";

export function SelectOption<C extends ElementType = "li", T = any>(props: SelectOptionProps<C, T>) {
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

  const assignOptionRef = (el: HTMLLIElement) => {
    optionRef = el;

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const isSelected = () => {
    if (selectContext.state.value == null) {
      return;
    }

    return selectContext.state.compareFn(local.value, selectContext.state.value);
  };

  const isActiveDescendant = () => index() === selectContext.state.activeIndex;

  const onOptionClick = (event: MouseEvent) => {
    event.stopPropagation();
    selectContext.onOptionClick(index());
  };

  const onOptionMouseEnter = (event: MouseEvent) => {
    if (local.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    selectContext.onOptionMouseEnter(index());
  };

  onMount(() => {
    const optionIndex = selectContext.registerOption({
      value: local.value,
      disabled: !!local.disabled,
      textValue: optionRef?.textContent?.toLowerCase() ?? "",
    });
    setIndex(optionIndex);
  });

  createEffect(() => {
    if (isActiveDescendant() && optionRef) {
      selectContext.scrollToOption(optionRef);
    }
  });

  return (
    <Box
      ref={assignOptionRef}
      role="option"
      id={id()}
      aria-selected={isSelected()}
      class={classes()}
      onClick={onOptionClick}
      onMouseEnter={onOptionMouseEnter}
      onMouseLeave={selectContext.onOptionMouseLeave}
      onMouseDown={selectContext.onOptionMouseDown}
      {...others}
    />
  );
}

SelectOption.toString = () => createClassSelector(hopeSelectOptionClass);
