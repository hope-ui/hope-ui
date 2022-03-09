import { Accessor, createContext, createEffect, createSignal, onMount, splitProps, useContext } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionStyles } from "./select.styles";

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
   * Optional text used for typeahead purposes.
   * By default the typeahead behavior will use the `.textContent` of the `Select.Option`.
   * Use this when the content is complex, or you have non-textual content inside.
   */
  textValue?: string;

  /**
   * If `true`, the option will be disabled.
   */
  disabled?: boolean;
}

export type SelectOptionProps<C extends ElementType = "div", T = any> = HTMLHopeProps<C, SelectOptionOptions<T>>;

const hopeSelectOptionClass = "hope-select__option";

export function SelectOption<C extends ElementType = "div", T = any>(props: SelectOptionProps<C, T>) {
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

  const id = () => `${selectContext.state.optionIdPrefix}-${index()}`;
  const isSelected = () => selectContext.isOptionSelected(local.value);
  const isActiveDescendant = () => selectContext.isOptionActiveDescendant(index());

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

  const assignOptionRef = (el: HTMLDivElement) => {
    optionRef = el;

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

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
      textValue: local.textValue ?? optionRef?.textContent ?? local.value,
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
