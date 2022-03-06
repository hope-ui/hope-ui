import { Accessor, createContext, createEffect, createSignal, onMount, splitProps, useContext } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionStyles } from "./select.styles";
import { getOptionLabel, isOptionEqual } from "./select.utils";

export interface SelectOptionContextValue {
  selected: boolean;
}

const SelectOptionContext = createContext<Accessor<SelectOptionContextValue>>();

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

export type SelectOptionProps<C extends ElementType = "div", T = any> = HTMLHopeProps<C, SelectOptionOptions<T>>;

const hopeSelectOptionClass = "hope-select__option";

export function SelectOption<C extends ElementType = "div", T = any>(props: SelectOptionProps<C, T>) {
  const selectContext = useSelectContext();

  const [index, setIndex] = createSignal<number>(-1);

  let optionRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props as SelectOptionProps<"div">, ["ref", "class", "value", "disabled"]);

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

  const assignOptionRef = (el: HTMLDivElement) => {
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
      return false;
    }

    return isOptionEqual(local.value, selectContext.state.value, selectContext.state.compareKey);
  };

  const isActiveDescendant = () => index() === selectContext.state.activeIndex;

  const context: Accessor<SelectOptionContextValue> = () => ({
    selected: isSelected(),
  });

  const onOptionClick = (event: MouseEvent) => {
    event.stopPropagation();
    selectContext.onOptionClick(index());
  };

  const onOptionMouseMove = (event: MouseEvent) => {
    if (local.disabled) {
      selectContext.onOptionMouseMove(-1);
    }

    if (isActiveDescendant() || local.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    selectContext.onOptionMouseMove(index());
  };

  onMount(() => {
    const optionIndex = selectContext.registerOption({
      value: local.value,
      label: getOptionLabel(local.value, selectContext.state.labelKey),
      disabled: !!local.disabled,
    });

    setIndex(optionIndex);
  });

  createEffect(() => {
    if (isActiveDescendant() && optionRef) {
      selectContext.scrollToOption(optionRef);
    }
  });

  return (
    <SelectOptionContext.Provider value={context}>
      <Box
        ref={assignOptionRef}
        role="option"
        id={id()}
        aria-selected={isSelected()}
        data-active={isActiveDescendant() ? "" : undefined}
        data-disabled={local.disabled ? "" : undefined}
        class={classes()}
        onClick={onOptionClick}
        onMouseMove={onOptionMouseMove}
        onMouseDown={selectContext.onOptionMouseDown}
        {...others}
      />
    </SelectOptionContext.Provider>
  );
}

SelectOption.toString = () => createClassSelector(hopeSelectOptionClass);

export function useSelectOptionContext() {
  const context = useContext(SelectOptionContext);

  if (!context) {
    throw new Error("[Hope UI]: useSelectOptionContext must be used within a `<Select.Option />` component");
  }

  return context;
}
