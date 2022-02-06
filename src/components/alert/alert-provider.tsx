import { Accessor, createContext, PropsWithChildren, useContext } from "solid-js";

import { AlertVariants } from "./alert.styles";

export type AlertContextValue = {
  status: Accessor<AlertVariants["status"]>;
};

export const AlertContext = createContext<AlertContextValue>();

export type AlertProviderProps = PropsWithChildren<{
  status: AlertVariants["status"];
}>;

export function AlertProvider(props: AlertProviderProps) {
  const context: AlertContextValue = {
    status: () => props.status,
  };

  return <AlertContext.Provider value={context}>{props.children}</AlertContext.Provider>;
}

export function useAlertContext() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("[Hope UI]: useAlertContext must be used within an Alert component");
  }

  return context;
}
