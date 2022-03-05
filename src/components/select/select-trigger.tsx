import { mergeProps, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectTriggerStyles } from "./select.styles";

export type SelectTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeSelectTriggerClass = "hope-select__trigger";

export function SelectTrigger<C extends ElementType = "button">(props: SelectTriggerProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectTriggerProps<"button"> = {
    as: "button",
  };

  const propsWithDefault: SelectTriggerProps<"button"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["ref", "class"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSelectTriggerClass,
      selectTriggerStyles({
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
    />
  );
}

SelectTrigger.toString = () => createClassSelector(hopeSelectTriggerClass);
