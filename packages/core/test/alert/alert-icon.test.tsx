import { screen } from "solid-testing-library";

import { Alert, AlertIcon } from "../../src";
import { renderWithHopeProvider } from "../test-utils";

const alertIconId = "alert-icon";

describe("AlertIcon", () => {
  it("should have base alert icon class", () => {
    renderWithHopeProvider(() => (
      <Alert>
        <AlertIcon data-testid={alertIconId} />
        Alert
      </Alert>
    ));

    const alertIcon = screen.getByTestId(alertIconId);

    expect(alertIcon).toHaveClass("hope-alert__icon");
  });

  it("should allows custom classes", () => {
    renderWithHopeProvider(() => (
      <Alert>
        <AlertIcon class="test" data-testid={alertIconId} />
        Alert
      </Alert>
    ));

    const alertIcon = screen.getByTestId(alertIconId);

    expect(alertIcon.getAttribute("class")).toEqual(expect.stringContaining("test"));
  });
});
