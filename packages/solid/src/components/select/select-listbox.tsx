import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectListboxStyles } from "./select.styles";

export type SelectListboxProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectListboxClass = "hope-select__listbox";

/**
 * The scrolling viewport that contains all of the options.
 */
export function SelectListbox<C extends ElementType = "div">(props: SelectListboxProps<C>) {
  const theme = useStyleConfig().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectListboxProps<"div">, ["ref", "class"]);

  const classes = () => classNames(local.class, hopeSelectListboxClass, selectListboxStyles());

  const assignListboxRef = (el: HTMLDivElement) => {
    selectContext.assignListboxRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return (
    <Box
      ref={assignListboxRef}
      role="listbox"
      tabindex="-1"
      id={selectContext.state.listboxId}
      class={classes()}
      __baseStyle={theme?.baseStyle?.listbox}
      onMouseLeave={selectContext.onListboxMouseLeave}
      {...others}
    />
  );
}

SelectListbox.toString = () => createClassSelector(hopeSelectListboxClass);
