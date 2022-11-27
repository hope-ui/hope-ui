import { SystemStyleGridProps } from "@hope-ui/styles";
import { JSX } from "solid-js";

import { BreadcrumbStyleConfigProps } from "./breadcrumb.style";

export type Separator = string | JSX.Element;

export interface BreadcrumbProps extends BreadcrumbStyleConfigProps {
  /** Separator between each breadcrumb. */
  separator?: Separator;

  /** The left and right space applied to each separator */
  spacing?: SystemStyleGridProps["gap"];

  /** Determines the maximum number of breadcrumbs displayed. `default: 5` */
  maxItem?: number;

  /** `default: 1` */
  itemsAfterCollapse?: number;

  /** `default: 1` */
  itemsBeforeCollapse?: number;
}

export interface BreadcrumbLinkProps extends BreadcrumbStyleConfigProps {
  /** whether is the current page. */
  currentPage?: boolean;
}

export interface BreadcrumbListProps {
  /** Determines the maximum number of breadcrumbs displayed. `default: 5` */
  maxItem?: number;

  /** `default: 1` */
  itemsAfterCollapse?: number;

  /** `default: 1` */
  itemsBeforeCollapse?: number;
}

export interface BreadcrumbState {
  gap: SystemStyleGridProps["gap"];
  separator: Separator;
}

export interface BreadcrumbContextValue {
  state: BreadcrumbState;
}
