import { children, PropsWithChildren, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectContentStyles } from "./select.styles";

export type SelectContentProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectContentClass = "hope-select__content";

/**
 * The component that pops out when the select is open.
 */
export function SelectContent<C extends ElementType = "div">(props: SelectContentProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectContentProps<"div">, ["ref", "class", "children"]);

  const classes = () => classNames(local.class, hopeSelectContentClass, selectContentStyles());

  // hack to force children `SelectOption` to mount and register themself to the select.
  const resolvedChildren = children(() => local.children);

  const assignContentRef = (el: HTMLDivElement) => {
    selectContext.assignContentRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onOutsideClick = (event: Event) => {
    selectContext.onContentOutsideClick(event.target as HTMLElement);
  };

  return (
    <Show when={selectContext.state.opened}>
      <Portal>
        <OutsideClickHandler onOutsideClick={onOutsideClick}>
          <Box ref={assignContentRef} class={classes()} __baseStyle={theme?.baseStyle?.content} {...others}>
            {resolvedChildren()}
          </Box>
        </OutsideClickHandler>
      </Portal>
    </Show>
  );
}

SelectContent.toString = () => createClassSelector(hopeSelectContentClass);

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
