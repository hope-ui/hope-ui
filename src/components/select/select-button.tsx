import { mergeProps, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { IconSelector } from "../icons/IconSelector";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectButtonIconStyles, selectButtonStyles, selectButtonTextStyles } from "./select.styles";

export type SelectButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeSelectButtonClass = "hope-select__button";

export function SelectButton<C extends ElementType = "button">(props: SelectButtonProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectButtonProps<"button"> = {
    as: "button",
  };

  const propsWithDefault: SelectButtonProps<"button"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["ref", "class", "children"]);

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
      tabindex="0"
      aria-haspopup="listbox"
      aria-activedescendant={activeDescendantId()}
      aria-controls={selectContext.state.optionsId}
      aria-expanded={selectContext.state.opened}
      id={selectContext.state.buttonId}
      onBlur={selectContext.onButtonBlur}
      onClick={selectContext.onButtonClick}
      onKeyDown={selectContext.onButtonKeyDown}
      {...others}
    >
      <span class={selectButtonTextStyles()}>{local.children}</span>
      <IconSelector aria-hidden="true" class={selectButtonIconStyles()} />
    </Box>
  );
}

SelectButton.toString = () => createClassSelector(hopeSelectButtonClass);
