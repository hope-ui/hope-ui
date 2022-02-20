import { createContext, PropsWithChildren, useContext } from "solid-js";

const TooltipContext = createContext<any>();

export type TooltipProps = PropsWithChildren<{}>;

export function Tooltip(props: TooltipProps) {
  return <TooltipContext.Provider value={{}}>{props.children}</TooltipContext.Provider>;
}

export function useTooltipContext() {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error("[Hope UI]: useTooltipContext must be used within a `<Tooltip />` component");
  }

  return context;
}
