import { createContext, createSignal, PropsWithChildren, useContext } from "solid-js";

import { StyledSystemVariants } from "@/styled-system/system.styles";

export interface TagContextValue {
  borderRadius: StyledSystemVariants["borderRadius"];
}

export const TagContext = createContext<TagContextValue>();

export type TagProviderProps = PropsWithChildren<{
  contextValue: TagContextValue;
}>;

export function TagProvider(props: TagProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const [contextValue] = createSignal<TagContextValue>(props.contextValue);

  return <TagContext.Provider value={contextValue()}>{props.children}</TagContext.Provider>;
}

export function useTag() {
  const context = useContext(TagContext);

  if (!context) {
    throw new Error("[Hope UI]: useTag must be used within a TagProvider");
  }

  return context;
}
