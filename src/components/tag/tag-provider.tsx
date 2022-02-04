import { Accessor, createContext, PropsWithChildren, useContext } from "solid-js";

import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";

export type TagContextValue = {
  borderRadius?: Accessor<ResponsiveValue<RadiiProps["borderRadius"]>>;
};

export const TagContext = createContext<TagContextValue>();

export type TagProviderProps = PropsWithChildren<{
  borderRadius?: ResponsiveValue<RadiiProps["borderRadius"]>;
}>;

export function TagProvider(props: TagProviderProps) {
  const context: TagContextValue = {
    borderRadius: () => props.borderRadius,
  };

  return <TagContext.Provider value={context}>{props.children}</TagContext.Provider>;
}

export function useTag() {
  const context = useContext(TagContext);

  if (!context) {
    throw new Error("[Hope UI]: useTag must be used within a TagProvider");
  }

  return context;
}
