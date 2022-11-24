import { SystemStyleGridProps } from "@hope-ui/styles";
import { JSX } from "solid-js";

import { BreadcrumbStyleConfigProps } from "./breadcrumb.style";

export type Separator = string | JSX.Element;

export interface BreadcrumbProps extends BreadcrumbStyleConfigProps {
  /** separator between each breadcrumb. */
  separator?: Separator;

  /** The left and right space applied to each separator */
  spacing?: SystemStyleGridProps["gap"];
}

export interface BreadcrumbLinkProps extends BreadcrumbStyleConfigProps {
  /** whether is the current page. */
  currentPage?: boolean;
}

export interface BreadcrumbState {
  gap: SystemStyleGridProps["gap"];
  separator: Separator;
}

export interface BreadcrumbContextValue {
  state: BreadcrumbState;
}
