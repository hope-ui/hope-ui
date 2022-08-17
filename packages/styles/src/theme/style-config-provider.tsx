import { Accessor, createContext, ParentProps, useContext } from "solid-js";

import { StyleObjects } from "../types";

type StyleConfigContextValue<Parts extends string> = Accessor<StyleObjects<Parts>>;

const StyleConfigContext = createContext<StyleConfigContextValue<any>>();

export function StyleConfigProvider(props: ParentProps<{ styles: StyleConfigContextValue<any> }>) {
  return (
    <StyleConfigContext.Provider value={props.styles}>{props.children}</StyleConfigContext.Provider>
  );
}

export function useStyleConfigContext<Parts extends string>(): StyleConfigContextValue<Parts> {
  const context = useContext(StyleConfigContext);

  if (context == null) {
    throw new Error("[hope-ui]: useStyleConfigContext must be used within a StyleConfigProvider");
  }

  return context;
}
