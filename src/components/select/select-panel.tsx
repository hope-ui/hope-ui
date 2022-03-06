import { children, PropsWithChildren, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectPanelStyles } from "./select.styles";

export type SelectPanelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectPanelClass = "hope-select__panel";

/**
 * The scrolling viewport that contains all of the options.
 */
export function SelectPanel<C extends ElementType = "div">(props: SelectPanelProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectPanelProps<"div">, ["ref", "class"]);

  const classes = () => classNames(local.class, hopeSelectPanelClass, selectPanelStyles());

  const assignPanelRef = (el: HTMLDivElement) => {
    selectContext.assignPanelRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onOutsideClick = (event: Event) => {
    selectContext.onPanelOutsideClick(event.target as HTMLElement);
  };

  return (
    <Show when={selectContext.state.opened}>
      <Portal>
        <OutsideClickHandler onOutsideClick={onOutsideClick}>
          <Box ref={assignPanelRef} class={classes()} __baseStyle={theme?.baseStyle?.panel} {...others} />
        </OutsideClickHandler>
      </Portal>
    </Show>
  );
}

SelectPanel.toString = () => createClassSelector(hopeSelectPanelClass);

/**
 * Renderless component that manage outside click on its children.
 */
function OutsideClickHandler(props: PropsWithChildren<{ onOutsideClick: (event: Event) => void }>) {
  const resolvedChildren = children(() => props.children);

  useOutsideClick({
    element: () => resolvedChildren() as HTMLElement,
    handler: event => props.onOutsideClick(event),
  });

  return resolvedChildren;
}
