import { createContext, useContext } from "solid-js";

import { DrawerContextValue } from "./types";

export const DrawerContext = createContext<DrawerContextValue>();

export function useDrawerContext() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error("[hope-ui]: `useDrawerContext` must be used within a `Drawer` component");
  }

  return context;
}
