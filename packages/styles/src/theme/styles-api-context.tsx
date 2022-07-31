import { Accessor, createContext, ParentProps, useContext } from "solid-js";

interface StylesApiContextType {
  classNames: Accessor<Record<string, string>>;
  styles: Accessor<Record<string, any>>;
  unstyled: Accessor<boolean>;
  staticSelector: Accessor<string | undefined>;
}

const StylesApiContext = createContext<StylesApiContextType>({
  classNames: () => ({}),
  styles: () => ({}),
  unstyled: () => false,
  staticSelector: () => undefined,
});

export interface StylesApiProviderProps extends ParentProps {
  classNames: Record<string, string>;
  styles: Record<string, any>;
  unstyled: boolean;
  staticSelector?: string;
}

export function StylesApiProvider(props: StylesApiProviderProps) {
  const context: StylesApiContextType = {
    classNames: () => props.classNames,
    styles: () => props.styles,
    unstyled: () => props.unstyled,
    staticSelector: () => props.staticSelector,
  };

  return <StylesApiContext.Provider value={context}>{props.children}</StylesApiContext.Provider>;
}

export function useStylesApiContext() {
  return useContext(StylesApiContext);
}
