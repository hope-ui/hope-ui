import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import {
  selectButtonIconContainerStyles,
  selectButtonPlaceholderStyles,
  selectButtonStyles,
  selectButtonTextStyles,
} from "./select.styles";
import { SelectDropdownIcon } from "./select-icon";

export interface SelectButtonRenderPropParams<T = any> {
  /**
   * The selected value.
   */
  value?: T;

  /**
   * Whether or not the `Select` listbox is open.
   */
  opened: boolean;

  /**
   * Whether or not the `Select` is disabled.
   */
  disabled: boolean;
}

interface SelectButtonOptions {
  /**
   * The dropdown icon.
   */
  icon?: JSX.Element;

  children?: JSX.Element | ((params: SelectButtonRenderPropParams) => JSX.Element);
}

export type SelectButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, SelectButtonOptions>;

const hopeSelectButtonClass = "hope-select__button";

export function SelectButton<C extends ElementType = "button">(props: SelectButtonProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectButtonProps<"button"> = {
    as: "button",
    icon: <SelectDropdownIcon />,
  };

  const propsWithDefault: SelectButtonProps<"button"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["ref", "class", "children", "icon"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSelectButtonClass,
      selectButtonStyles({
        variant: selectContext.state.variant,
        size: selectContext.state.size,
      })
    );
  };

  const activeDescendantId = () => {
    return selectContext.state.opened
      ? `${selectContext.state.optionIdPrefix}-${selectContext.state.activeIndex}`
      : undefined;
  };

  const assignButtonRef = (el: HTMLButtonElement) => {
    selectContext.assignButtonRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return (
    <Box
      ref={assignButtonRef}
      class={classes()}
      type="button"
      role="combobox"
      tabindex="0"
      aria-haspopup="listbox"
      aria-activedescendant={activeDescendantId()}
      aria-controls={selectContext.state.listboxId}
      aria-expanded={selectContext.state.opened}
      id={selectContext.state.buttonId}
      onBlur={selectContext.onButtonBlur}
      onClick={selectContext.onButtonClick}
      onKeyDown={selectContext.onButtonKeyDown}
      {...others}
    >
      <Show
        when={selectContext.state.value != null}
        fallback={<span class={selectButtonPlaceholderStyles()}>{selectContext.state.placeholder}</span>}
      >
        <span class={selectButtonTextStyles()}>
          {isFunction(local.children)
            ? local.children({
                value: selectContext.state.value,
                opened: selectContext.state.opened,
                disabled: !!selectContext.state.disabled,
              })
            : local.children}
        </span>
      </Show>
      <span class={selectButtonIconContainerStyles()}>{local.icon}</span>
    </Box>
  );
}

SelectButton.toString = () => createClassSelector(hopeSelectButtonClass);
