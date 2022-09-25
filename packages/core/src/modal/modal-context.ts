import { createContext, useContext } from "solid-js";

import { ModalContextValue } from "./types";

export const ModalContext = createContext<ModalContextValue>();

export function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("[hope-ui]: `useModalContext` must be used within a `Modal` component");
  }

  return context;
}
