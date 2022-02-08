import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { Input } from "..";
import { InputGroup } from "../input-group";

describe("InputGroup", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group">
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toBeInTheDocument();
  });
});
