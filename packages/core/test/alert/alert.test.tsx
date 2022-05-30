import { screen } from "solid-testing-library";

import { Alert } from "../../src";
import { renderWithHopeProvider } from "../test-utils";

describe("Alert", () => {
  it("should have role=alert", () => {
    renderWithHopeProvider(() => <Alert>Alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toBeTruthy();
  });

  it("should render <div> tag by default", () => {
    renderWithHopeProvider(() => <Alert>Alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    renderWithHopeProvider(() => <Alert as="span">Button</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have base alert class", () => {
    renderWithHopeProvider(() => <Alert>Alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("hope-alert");
  });

  it("should have variants related classes", () => {
    renderWithHopeProvider(() => (
      <Alert variant="left-accent" status="warning">
        Button
      </Alert>
    ));

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("hope-alert--left-accent");
    expect(alert).toHaveClass("hope-alert--warning");
  });

  it("should allows custom classes", () => {
    renderWithHopeProvider(() => <Alert class="test">Alert</Alert>);

    const alert = screen.getByRole("alert");

    expect(alert.getAttribute("class")).toEqual(expect.stringContaining("test"));
  });
});
