import {
  checkAccessibility,
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Breadcrumb } from "./breadcrumb";
import { BreadcrumbItem } from "./breadcrumb-item";
import { BreadcrumbLink } from "./breadcrumb-link";
import { BreadcrumbSeparator } from "./breadcrumb-separator";
import { BreadcrumbProps } from "./types";

const defaultProps: BreadcrumbProps = {};

describe("Breadcrumb", () => {
  checkAccessibility([
    <Breadcrumb separator="/">
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Home</BreadcrumbLink>
        <BreadcrumbSeparator />
      </BreadcrumbItem>
    </Breadcrumb>,
  ]);
  itIsPolymorphic(Breadcrumb as any, defaultProps);
  itRendersChildren(Breadcrumb as any, defaultProps);
  itSupportsClass(Breadcrumb as any, defaultProps);
  itHasSemanticClass(Breadcrumb as any, defaultProps, "hope-Breadcrumb-root");
  itSupportsRef(Breadcrumb as any, defaultProps, HTMLElement); // should be `nav`, but not support.
  itSupportsStyle(Breadcrumb as any, defaultProps);

  it("breadcrumb should have attribute `aria-label=breadcrumb`.", () => {
    render(() => <Breadcrumb data-testid="breadcrumb" />);

    const breadcrumb = screen.getByTestId("breadcrumb");

    expect(breadcrumb).toHaveAttribute("aria-label", "breadcrumb");
  });

  it("breadcrumbLink should have attribute `aria-current=page` when passingcurrentPage prop.", () => {
    render(() => (
      <BreadcrumbLink data-testid="breadcrumb" currentPage>
        Home
      </BreadcrumbLink>
    ));

    const breadcrumbLink = screen.getByTestId("breadcrumb");

    expect(breadcrumbLink).toHaveAttribute("aria-current", "page");
  });
});
