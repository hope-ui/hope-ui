import { Accessor, createContext, JSX, useContext } from "solid-js";

interface StylesApiContextValue {
  classNames: Accessor<Record<string, string>>;
  styles: Accessor<Record<string, any>>;
  unstyled: Accessor<boolean>;
  staticSelector: Accessor<string | undefined>;
}

const StylesApiContext = createContext<StylesApiContextValue>({
  classNames: () => ({}),
  styles: () => ({}),
  unstyled: () => false,
  staticSelector: () => undefined,
});

export interface StylesApiProviderProps {
  classNames: Record<string, string>;
  styles: Record<string, any>;
  unstyled: boolean;
  staticSelector?: string;
  children?: JSX.Element;
}

export function StylesApiProvider(props: StylesApiProviderProps) {
  const context: StylesApiContextValue = {
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
