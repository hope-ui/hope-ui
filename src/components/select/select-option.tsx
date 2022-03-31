import { Accessor, createContext, createEffect, createSignal, onMount, splitProps, useContext } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionStyles } from "./select.styles";
import { SelectOptionData } from "./select.utils";

export interface SelectOptionContextValue {
  selected: Accessor<boolean>;
}

const SelectOptionContext = createContext<SelectOptionContextValue>();

type SelectOptionOptions = Required<Pick<SelectOptionData, "value">> &
  Partial<Pick<SelectOptionData, "textValue" | "disabled">>;

export type SelectOptionProps<C extends ElementType = "div"> = HTMLHopeProps<C, SelectOptionOptions>;

const hopeSelectOptionClass = "hope-select__option";

/**
 * The component that contains a select option.
 */
export function SelectOption<C extends ElementType = "div">(props: SelectOptionProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [index, setIndex] = createSignal<number>(-1);

  let optionRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props as SelectOptionProps<"div">, [
    "ref",
    "class",
    "value",
    "textValue",
    "disabled",
  ]);

  const optionData: Accessor<SelectOptionData> = () => ({
    value: local.value,
    textValue: local.textValue ?? optionRef?.textContent ?? String(local.value),
    disabled: !!local.disabled,
  });

  const id = () => `${selectContext.state.optionIdPrefix}-${index()}`;
  const isSelected = () => selectContext.isOptionSelected(optionData());
  const isActiveDescendant = () => selectContext.isOptionActiveDescendant(index());

  const classes = () => {
    return classNames(local.class, hopeSelectOptionClass, selectOptionStyles());
  };

  const assignOptionRef = (el: HTMLDivElement) => {
    optionRef = el;

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

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

  const context: SelectOptionContextValue = {
    selected: isSelected,
  };

  onMount(() => {
    setIndex(selectContext.registerOption(optionData()));
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
        data-group
        class={classes()}
        __baseStyle={theme?.baseStyle?.option}
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
