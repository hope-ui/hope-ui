import { JSX, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectTriggerStyles } from "./select.styles";

export type SelectTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeSelectTriggerClass = "hope-select__trigger";

export function SelectTrigger<C extends ElementType = "button">(props: SelectTriggerProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectTriggerProps<"button">, ["ref", "class"]);

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

  const onBlur: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    const allHanders = callAllHandlers(selectContext.onButtonBlur, selectContext.formControlProps.onBlur);
    allHanders(event);
  };

  return (
    <hope.button
      ref={assignButtonRef}
      id={selectContext.state.buttonId}
      disabled={selectContext.state.disabled}
      type="button"
      role="combobox"
      tabindex="0"
      aria-haspopup="listbox"
      aria-activedescendant={activeDescendantId()}
      aria-controls={selectContext.state.listboxId}
      aria-expanded={selectContext.state.opened}
      aria-required={selectContext.formControlProps["aria-required"]}
      aria-invalid={selectContext.formControlProps["aria-invalid"]}
      aria-readonly={selectContext.formControlProps["aria-readonly"]}
      aria-describedby={selectContext.formControlProps["aria-describedby"]}
      class={classes()}
      __baseStyle={theme?.baseStyle?.trigger}
      onFocus={selectContext.formControlProps.onFocus}
      onBlur={onBlur}
      onClick={selectContext.onButtonClick}
      onKeyDown={selectContext.onButtonKeyDown}
      {...others}
    />
  );
}

SelectTrigger.toString = () => createClassSelector(hopeSelectTriggerClass);
