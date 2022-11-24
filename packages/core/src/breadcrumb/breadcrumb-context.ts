import { createContext, useContext } from "solid-js";

import { BreadcrumbContextValue } from "./types";

export const BreadcrumbContext = createContext<BreadcrumbContextValue>();

export function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error("[hope-ui]: `useButtonContext` must be used within a `Breadcrumb` component");
  }

  return context;
}
