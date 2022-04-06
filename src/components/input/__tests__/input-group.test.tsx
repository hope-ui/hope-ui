import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../../utils/test-utils";
import { Input } from "..";
import { inputGroupStyles } from "../input.styles";
import { InputGroup } from "../input-group";

describe("InputGroup", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

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

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group">
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group" as="span">
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group">
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toHaveClass("hope-input-group");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(InputGroup.toString()).toBe(".hope-input-group");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group" class={stubClass}>
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      //eslint-disable-next-line solid/no-react-specific-props
      <InputGroup data-testid="input-group" className={stubClass}>
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group" classList={{ [stubClass]: true }}>
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toHaveClass(stubClass);
  });

  it("should have stitches generated class from inputGroupStyles", () => {
    // arrange
    const inputGroupClass = inputGroupStyles();

    // act
    renderWithHopeProvider(() => (
      <InputGroup data-testid="input-group">
        <Input />
      </InputGroup>
    ));
    const inputGroup = screen.getByTestId("input-group");

    // assert
    expect(inputGroup).toHaveClass(inputGroupClass.className);
  });
});
