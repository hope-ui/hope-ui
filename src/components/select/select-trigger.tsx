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

/**
 * The trigger that toggles the select.
 */
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

  const assignTriggerRef = (el: HTMLButtonElement) => {
    selectContext.assignTriggerRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onBlur: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    const allHanders = callAllHandlers(selectContext.onTriggerBlur, selectContext.formControlProps.onBlur);
    allHanders(event);
  };

  return (
    <hope.button
      ref={assignTriggerRef}
      id={selectContext.state.triggerId}
      disabled={selectContext.state.disabled}
      type="button"
      role="combobox"
      tabindex="0"
      aria-haspopup="listbox"
      aria-activedescendant={selectContext.state.activeDescendantId}
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
      onClick={selectContext.onTriggerClick}
      onKeyDown={selectContext.onTriggerKeyDown}
      {...others}
    />
  );
}

SelectTrigger.toString = () => createClassSelector(hopeSelectTriggerClass);
