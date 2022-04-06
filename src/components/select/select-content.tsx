import { children, createEffect, createSignal, on, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "../../theme/provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ClickOutside } from "../click-outside/click-outside";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectContentStyles, selectTransitionName } from "./select.styles";

export type SelectContentProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectContentClass = "hope-select__content";

/**
 * The component that pops out when the select is open.
 */
export function SelectContent<C extends ElementType = "div">(props: SelectContentProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectContentProps<"div">, ["ref", "class", "children"]);

  /**
   * Internal state to handle select content portal `mounted` state.
   * Dirty hack since solid-transition-group doesn't work with Portal.
   */
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  createEffect(
    on(
      () => selectContext.state.opened,
      () => {
        if (selectContext.state.opened) {
          // mount portal when state `opened` is true.
          setIsPortalMounted(true);
        } else {
          // unmount portal instantly when there is no menu transition.
          selectContext.state.motionPreset === "none" && setIsPortalMounted(false);
        }
      }
    )
  );

  // For smooth transition, unmount portal only after select's content exit transition is done.
  const unmountPortal = () => setIsPortalMounted(false);

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

  const onClickOutside = (event: Event) => {
    selectContext.onContentClickOutside(event.target as HTMLElement);
  };

  const transitionName = () => {
    switch (selectContext.state.motionPreset) {
      case "fade-in-top":
        return selectTransitionName.fadeInTop;
      case "none":
        return "hope-none";
    }
  };

  return (
    <Show when={isPortalMounted()}>
      <Portal>
        <Transition name={transitionName()} appear onAfterExit={unmountPortal}>
          <Show when={selectContext.state.opened}>
            <ClickOutside onClickOutside={onClickOutside}>
              <Box ref={assignContentRef} class={classes()} __baseStyle={theme?.baseStyle?.content} {...others}>
                {resolvedChildren()}
              </Box>
            </ClickOutside>
          </Show>
        </Transition>
      </Portal>
    </Show>
  );
}

SelectContent.toString = () => createClassSelector(hopeSelectContentClass);
