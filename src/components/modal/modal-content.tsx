import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useModalContext } from ".";
import { modalContentContainerStyles, modalContentStyles } from "./modal.styles";

export type ModalContentProps<C extends ElementType> = HopeComponentProps<
  C,
  {
    containerProps?: HopeComponentProps<"div">;
  }
>;

const hopeModalContentContainerClass = "hope-modal__content-container";
const hopeModalContentClass = "hope-modal__content";

export function ModalContent<C extends ElementType = "section">(props: ModalContentProps<C>) {
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class", "containerProps"]);

  let rootDiv: HTMLDivElement | undefined;
  let focusTrap: FocusTrap | undefined;

  const containerProps = () => ({
    ...(local.containerProps ?? {}),
    onClick: modalContext.onOverlayClick,
    onMouseDown: modalContext.onMouseDown,
    onKeyUp: modalContext.onKeyUp,
  });

  const dialogProps = () => ({
    id: modalContext.state.dialogId,
    role: "dialog",
    tabIndex: -1,
    "aria-modal": true,
    "aria-labelledby": modalContext.state.headerMounted ? modalContext.state.headerId : undefined,
    "aria-describedby": modalContext.state.bodyMounted ? modalContext.state.bodyId : undefined,
    onClick: (event: MouseEvent) => event.stopPropagation(),
  });

  const containerClasses = () =>
    classNames(
      hopeModalContentContainerClass,
      modalContentContainerStyles({
        centered: modalContext.state.centered,
        scrollBehavior: modalContext.state.scrollBehavior,
      })
    );

  const contentClasses = () =>
    classNames(
      local.class,
      hopeModalContentClass,
      modalContentStyles({
        size: modalContext.state.size,
        scrollBehavior: modalContext.state.scrollBehavior,
      })
    );

  onMount(() => {
    if (!rootDiv) {
      return;
    }

    focusTrap = createFocusTrap(rootDiv, {
      initialFocus: modalContext.state.initialFocus,
      fallbackFocus: `#${modalContext.state.dialogId}`,
      allowOutsideClick: false,
    });

    focusTrap.activate();
    disableBodyScroll(rootDiv);
  });

  onCleanup(() => {
    focusTrap?.deactivate();
    clearAllBodyScrollLocks();
  });

  return (
    <div ref={rootDiv}>
      <Box class={containerClasses()} {...containerProps}>
        <Box as="section" class={contentClasses()} {...dialogProps} {...others} />
      </Box>
    </div>
  );
}

ModalContent.toString = () => createCssSelector(hopeModalContentClass);
