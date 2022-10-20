/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/b6c7f8cf609db32e64c8d4b28b5e06ebf437a800/packages/ariakit/src/popover/popover-arrow.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { getWindow, mergeRefs } from "@hope-ui/utils";
import { clsx } from "clsx";
import { Accessor, createRenderEffect, createSignal, splitProps } from "solid-js";

import { usePopoverContext } from "./popover-context";
import { BasePlacement } from "./types";

const ARROW_PATH =
  "M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z";

const ARROW_VIEWBOX_SIZE = 30;
const HALF_ARROW_VIEWBOX_SIZE = ARROW_VIEWBOX_SIZE / 2;

const ARROW_VIEWBOX = `0 0 ${ARROW_VIEWBOX_SIZE} ${ARROW_VIEWBOX_SIZE}`;

const ROTATE_MAP = {
  top: `rotate(180 ${HALF_ARROW_VIEWBOX_SIZE} ${HALF_ARROW_VIEWBOX_SIZE})`,
  right: `rotate(-90 ${HALF_ARROW_VIEWBOX_SIZE} ${HALF_ARROW_VIEWBOX_SIZE})`,
  bottom: `rotate(0 ${HALF_ARROW_VIEWBOX_SIZE} ${HALF_ARROW_VIEWBOX_SIZE})`,
  left: `rotate(90 ${HALF_ARROW_VIEWBOX_SIZE} ${HALF_ARROW_VIEWBOX_SIZE})`,
};

/**
 * PopoverArrow renders an arrow inside a `Popover` component.
 */
export const PopoverArrow = createHopeComponent<"div">(props => {
  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["ref", "class", "style", "children"]);

  const dir = () => popoverContext.currentPlacement().split("-")[0] as BasePlacement;

  const contentStyle = createComputedStyle(popoverContext.contentRef);
  const fill = () => contentStyle()?.getPropertyValue("background-color") || "none";
  const stroke = () => contentStyle()?.getPropertyValue(`border-${dir()}-color`) || "none";
  const borderWidth = () => contentStyle()?.getPropertyValue(`border-${dir()}-width`) || "0px";
  const strokeWidth = () => {
    return parseInt(borderWidth()) * 2 * (ARROW_VIEWBOX_SIZE / popoverContext.arrowSize());
  };

  return (
    <hope.div
      ref={mergeRefs(popoverContext.setArrowRef, local.ref)}
      aria-hidden="true"
      style={{
        // SSR
        "font-size": `${popoverContext.arrowSize()}px`,
        fill: fill(),
        stroke: stroke(),
        "stroke-width": strokeWidth(),
        ...(local.style as any),
      }}
      class={clsx(popoverContext.baseClasses().arrow, local.class)}
      __css={popoverContext.styleOverrides().arrow}
      {...others}
    >
      <svg display="block" viewBox={ARROW_VIEWBOX}>
        <g transform={ROTATE_MAP[dir()]}>
          <path fill="none" d={ARROW_PATH} />
          <path stroke="none" d={ARROW_PATH} />
        </g>
      </svg>
    </hope.div>
  );
});

function createComputedStyle(element: Accessor<Element | undefined>) {
  const [style, setStyle] = createSignal<CSSStyleDeclaration>();

  createRenderEffect(() => {
    const el = element();
    el && setStyle(getWindow(el).getComputedStyle(el));
  });

  return style;
}
