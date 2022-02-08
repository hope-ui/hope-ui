import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { InputAddon } from "..";
import { InputGroup } from "../input-group";

describe("InputAddon", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon" />
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInTheDocument();
  });
});
