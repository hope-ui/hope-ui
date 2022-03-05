import { splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectListboxStyles } from "./select.styles";

export type SelectListboxProps<C extends ElementType = "ul"> = HTMLHopeProps<C>;

const hopeSelectListboxClass = "hope-select__listbox";

/**
 * The scrolling viewport that contains all of the options.
 */
export function SelectListbox<C extends ElementType = "ul">(props: SelectListboxProps<C>) {
  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectListboxProps<"ul">, ["ref", "class"]);

  const classes = () => classNames(local.class, hopeSelectListboxClass, selectListboxStyles());

  const assignListboxRef = (el: HTMLUListElement) => {
    selectContext.assignListboxRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return (
    <hope.ul
      ref={assignListboxRef}
      role="listbox"
      tabindex="-1"
      id={selectContext.state.listboxId}
      class={classes()}
      onMouseLeave={selectContext.onListboxMouseLeave}
      {...others}
    />
  );
}

SelectListbox.toString = () => createClassSelector(hopeSelectListboxClass);
