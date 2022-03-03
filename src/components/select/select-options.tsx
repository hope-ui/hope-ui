import { mergeProps, Show, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptionsListStyles } from "./select.styles";

export type SelectOptionsProps<C extends ElementType = "ul"> = HTMLHopeProps<C>;

const hopeSelectOptionsClass = "hope-select__options";

export function SelectOptions<C extends ElementType = "ul">(props: SelectOptionsProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectOptionsProps<"ul"> = {
    as: "ul",
  };

  const propsWithDefault: SelectOptionsProps<"ul"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["ref", "class"]);

  const classes = () => classNames(local.class, hopeSelectOptionsClass, selectOptionsListStyles());

  const assignOptionsRef = (el: HTMLUListElement) => {
    selectContext.assignOptionsRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  return (
    <Show when={selectContext.state.opened}>
      <Box
        ref={assignOptionsRef}
        role="listbox"
        tabindex="-1"
        id={selectContext.state.optionsId}
        class={classes()}
        {...others}
      />
    </Show>
  );
}

SelectOptions.toString = () => createClassSelector(hopeSelectOptionsClass);
