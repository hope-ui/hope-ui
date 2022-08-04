import { Accessor, createContext, ParentProps, useContext } from "solid-js";

interface StylesApiContextType {
  styles: Accessor<Record<string, any>>;
  unstyled: Accessor<boolean>;
  staticSelector: Accessor<string | undefined>;
}

const StylesApiContext = createContext<StylesApiContextType>({
  styles: () => ({}),
  unstyled: () => false,
  staticSelector: () => undefined,
});

export interface StylesApiProviderProps extends ParentProps {
  styles: Record<string, any>;
  unstyled: boolean;
  staticSelector?: string;
}

export function StylesApiProvider(props: StylesApiProviderProps) {
  const context: StylesApiContextType = {
    styles: () => props.styles,
    unstyled: () => props.unstyled,
    staticSelector: () => props.staticSelector,
  };

  return <StylesApiContext.Provider value={context}>{props.children}</StylesApiContext.Provider>;
}

export function useStylesApiContext() {
  return useContext(StylesApiContext);
}
