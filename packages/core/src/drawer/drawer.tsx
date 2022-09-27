/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/drawer/src/use-drawer.ts
 */

import { createDisclosure, createPreventScroll, createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES, StyleConfigProvider } from "@hope-ui/styles";
import { contains, getRelatedTarget, runIfFn } from "@hope-ui/utils";
import {
  createEffect,
  createSignal,
  createUniqueId,
  JSX,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { isServer, Portal } from "solid-js/web";

import { useDrawerStyleConfig } from "./drawer.styles";
import { DrawerContext } from "./drawer-context";
import { DrawerContextValue, DrawerProps } from "./types";
import { DRAWER_TRANSITION } from "./drawer-transition";

/**
 * Drawer provides context, theming, and accessibility properties
 * to all other drawer components.
 *
 * It doesn't render any DOM node.
 */
export function Drawer(props: DrawerProps) {
  props = mergeThemeProps(
    "Drawer",
    {
      id: `hope-drawer-${createUniqueId()}`,
      size: "md",
      placement: "right",
      closeOnOverlayClick: true,
      closeOnEsc: true,
      preventScroll: true,
      trapFocus: true,
    },
    props
  );

  const [styleConfigProps] = splitProps(props, [...STYLE_CONFIG_PROP_NAMES, "size", "placement"]);

  const styleConfigResult = useDrawerStyleConfig("Drawer", styleConfigProps);

  const [headingId, setHeadingId] = createSignal<string>();
  const [descriptionId, setDescriptionId] = createSignal<string>();

  const overlayTransition = createTransition({
    get shouldMount() {
      return props.isOpen;
    },
    get transition() {
      return props.overlayTransitionOptions?.transition ?? "fade";
    },
    get duration() {
      return props.overlayTransitionOptions?.duration ?? 300;
    },
    get exitDuration() {
      return props.overlayTransitionOptions?.exitDuration ?? 200;
    },
    get delay() {
      return props.overlayTransitionOptions?.delay;
    },
    get exitDelay() {
      return props.overlayTransitionOptions?.exitDelay;
    },
    get easing() {
      return props.overlayTransitionOptions?.easing ?? "ease-out";
    },
    get exitEasing() {
      return props.overlayTransitionOptions?.exitEasing ?? "ease-in";
    },
    get onBeforeEnter() {
      return props.overlayTransitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.overlayTransitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.overlayTransitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.overlayTransitionOptions?.onAfterExit;
    },
  });

  const drawerTransition = createTransition({
    get shouldMount() {
      return props.isOpen;
    },
    get transition() {
      return props.drawerTransitionOptions?.transition ?? DRAWER_TRANSITION[props.placement!];
    },
    get duration() {
      return props.drawerTransitionOptions?.duration ?? 300;
    },
    get exitDuration() {
      return props.drawerTransitionOptions?.exitDuration ?? 200;
    },
    get delay() {
      return props.drawerTransitionOptions?.delay ?? 100;
    },
    get exitDelay() {
      return props.drawerTransitionOptions?.exitDelay ?? 0;
    },
    get easing() {
      return props.drawerTransitionOptions?.easing ?? "ease-out";
    },
    get exitEasing() {
      return props.drawerTransitionOptions?.exitEasing ?? "ease-in";
    },
    get onBeforeEnter() {
      return props.drawerTransitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.drawerTransitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.drawerTransitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.drawerTransitionOptions?.onAfterExit;
    },
  });

  let mouseDownTarget: EventTarget | undefined;

  const onContainerMouseDown: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    mouseDownTarget = event.target;
  };

  const onContainerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (event.key === "Escape") {
      event.stopPropagation();

      if (props.closeOnEsc) {
        props.onClose();
      }

      props.onEscKeyDown?.();
    }
  };

  const onContainerClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    event.stopPropagation();
    /**
     * Prevent the drawer from closing when user
     * start dragging from the content, and release drag outside the content.
     *
     * Because it is technically not a considered "click outside".
     */
    if (mouseDownTarget !== event.target) {
      return;
    }

    if (props.closeOnOverlayClick) {
      props.onClose();
    }

    props.onOverlayClick?.();
  };

  const onCloseButtonClick = () => {
    props.onClose();
  };

  createPreventScroll({
    isEnabled: () => props.isOpen && !!props.preventScroll,
  });

  const context: DrawerContextValue = {
    isOpen: () => props.isOpen,
    drawerTransition,
    overlayTransition,
    drawerId: () => props.id!,
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    trapFocus: () => props.trapFocus!,
    initialFocusSelector: () => props.initialFocusSelector,
    restoreFocusSelector: () => props.restoreFocusSelector,
    onContainerMouseDown,
    onContainerKeyDown,
    onContainerClick,
    onCloseButtonClick,
  };

  return (
    <Show when={overlayTransition.keepMounted() && drawerTransition.keepMounted()}>
      <Portal>
        <StyleConfigProvider value={styleConfigResult}>
          <DrawerContext.Provider value={context}>{props.children}</DrawerContext.Provider>
        </StyleConfigProvider>
      </Portal>
    </Show>
  );
}
