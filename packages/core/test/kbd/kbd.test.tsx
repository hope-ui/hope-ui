import { screen } from "solid-testing-library";

import { Kbd } from "../../src";
import { renderWithHopeProvider } from "../test-utils";

describe("Kbd", () => {
  it("should have base kbd class", () => {
    renderWithHopeProvider(() => <Kbd data-testid="kbd">shift</Kbd>);

    const kbd = screen.getByTestId("kbd");

    expect(kbd).toHaveClass("hope-kbd");
  });

  it("should allows custom classes", () => {
    renderWithHopeProvider(() => (
      <Kbd data-testid="kbd" class="test">
        shift
      </Kbd>
    ));

    const kbd = screen.getByTestId("kbd");

    expect(kbd.getAttribute("class")).toEqual(expect.stringContaining("test"));
  });
});
