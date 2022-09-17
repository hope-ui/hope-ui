import { createContext, useContext } from "solid-js";

import { PopoverContextValue } from "./types";

export const PopoverContext = createContext<PopoverContextValue>();

export function usePopoverContext() {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("[hope-ui]: `usePopoverContext` must be used within a `Popover` component");
  }

  return context;
}
