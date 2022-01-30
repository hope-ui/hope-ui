import { createContext, createSignal, PropsWithChildren, useContext } from "solid-js";

import { TagVariants } from "./Tag.styles";

export interface TagContextValue {
  borderRadius: TagVariants["borderRadius"];
}

export const TagContext = createContext<TagContextValue>();

export type TagProviderProps = PropsWithChildren<{
  contextValue: TagContextValue;
}>;

export function TagContextProvider(props: TagProviderProps) {
  // eslint-disable-next-line solid/reactivity
  const [contextValue] = createSignal<TagContextValue>(props.contextValue);

  return <TagContext.Provider value={contextValue()}>{props.children}</TagContext.Provider>;
}

export function useTagContext() {
  const context = useContext(TagContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: TagContext not found, did you wrap your component within TagContextProvider ?"
    );
  }

  return context;
}
