import { createContext, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { GridLayoutProps } from "@/styled-system/props/grid";
import { ResponsiveValue, SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { breadcrumbListStyles, breadcrumbStyles } from "./breadcrumb.styles";

interface BreadcrumbState {
  /**
   * The space between each item, link and separator.
   */
  spacing: ResponsiveValue<GridLayoutProps["gap"]>;

  /**
   * The visual separator between each breadcrumb item.
   */
  separator: string | JSX.Element;
}

interface BreadcrumbContextValue {
  state: BreadcrumbState;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>();

type BreadcrumbOptions = Partial<BreadcrumbState>;

type ThemeableBreadcrumbOptions = BreadcrumbOptions;

export type BreadcrumbProps<C extends ElementType = "nav"> = HTMLHopeProps<C, BreadcrumbOptions>;

export interface BreadcrumbStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    item?: SystemStyleObject;
    link?: SystemStyleObject;
    separator?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableBreadcrumbOptions;
  };
}

const hopeBreadcrumbClass = "hope-breadcrumb";
const hopeBreadcrumbListClass = "hope-breadcrumb__list";

/**
 * Breadcrumb is used to render a breadcrumb navigation landmark.
 * It renders a `nav` element with `aria-label` set to `breadcrumb`
 */
export function Breadcrumb<C extends ElementType = "nav">(props: BreadcrumbProps<C>) {
  const theme = useComponentStyleConfigs().Breadcrumb;

  const [state] = createStore<BreadcrumbState>({
    get spacing() {
      return props.spacing ?? theme?.defaultProps?.root?.spacing ?? "0.5rem";
    },
    get separator() {
      return props.separator ?? theme?.defaultProps?.root?.separator ?? "/";
    },
  });

  const [local, others] = splitProps(props, ["class", "children", "separator", "spacing"]);

  const rootClasses = () => classNames(local.class, hopeBreadcrumbClass, breadcrumbStyles());

  const listClasses = () => classNames(hopeBreadcrumbListClass, breadcrumbListStyles());

  const context: BreadcrumbContextValue = {
    state: state as BreadcrumbState,
  };

  return (
    <BreadcrumbContext.Provider value={context}>
      <hope.nav aria-label="breadcrumb" class={rootClasses()} __baseStyle={theme?.baseStyle?.root} {...others}>
        <hope.ol class={listClasses()} gap={(state as BreadcrumbState).spacing}>
          {local.children}
        </hope.ol>
      </hope.nav>
    </BreadcrumbContext.Provider>
  );
}

Breadcrumb.toString = () => createClassSelector(hopeBreadcrumbClass);

export function useBreadcrumbContext() {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error("[Hope UI]: useBreadcrumbContext must be used within a `<Breadcrumb />` component");
  }

  return context;
}
