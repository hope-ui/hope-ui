import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { ChildrenProp, ThemeableTagOptions } from "@/components";

export type TagContextValue = Required<ThemeableTagOptions>;

export const TagContext = createContext<TagContextValue>();

export type TagProviderProps = ChildrenProp & {
  tagContextValue: TagContextValue;
};

export function TagProvider(props: TagProviderProps) {
  const [state] = createStore<TagContextValue>({
    variant: props.tagContextValue.variant,
    color: props.tagContextValue.color,
    size: props.tagContextValue.size,
    radius: props.tagContextValue.radius,
  });

  return <TagContext.Provider value={state}>{props.children}</TagContext.Provider>;
}

export function useTagContext() {
  const context = useContext(TagContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: no TagContext found, did you wrap your component with TagProvider ?"
    );
  }

  return context;
}
