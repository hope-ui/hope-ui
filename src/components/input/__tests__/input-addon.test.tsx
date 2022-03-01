import { cleanup, screen } from "solid-testing-library";

import { IconSearch } from "@/components";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { inputAddonStyles, InputAddonVariants } from "../input.styles";
import { InputAddon, InputLeftAddon, InputRightAddon } from "../input-addon";
import * as inputGroupModule from "../input-group";

const InputGroup = inputGroupModule.InputGroup;

const inputGroupContextMock: inputGroupModule.InputGroupContextValue = {
  state: {
    variant: "outline",
    size: "md",
    hasLeftElement: false,
    hasRightElement: false,
    hasLeftAddon: false,
    hasRightAddon: false,
  },
  setHasLeftElement: jest.fn(),
  setHasRightElement: jest.fn(),
  setHasLeftAddon: jest.fn(),
  setHasRightAddon: jest.fn(),
};

describe("InputAddon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon">
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon">
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon" as="span">
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon" class={stubClass}>
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputAddon data-testid="input-addon" className={stubClass}>
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon" classList={{ [stubClass]: true }}>
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from variant props", () => {
    // arrange
    const variantProps: InputAddonVariants = {
      placement: "left",
      variant: "filled",
      size: "lg",
    };

    const inputAddonClass = inputAddonStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputAddon data-testid="input-addon" {...variantProps}>
          <IconSearch />
        </InputAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(inputAddonClass.className);
  });
});

describe("InputLeftAddon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon">
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon">
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon" as="span">
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLSpanElement);
  });

  it("should call inputGroupContext 'setHasLeftAddon' on mount", () => {
    // arrange
    jest.spyOn(inputGroupModule, "useInputGroupContext").mockReturnValue(inputGroupContextMock);

    const stubContext = inputGroupModule.useInputGroupContext();

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon>
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));

    // assert
    expect(stubContext?.setHasLeftAddon).toHaveBeenCalledWith(true);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon">
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass("hope-input-left-addon");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(InputLeftAddon.toString()).toBe(".hope-input-left-addon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon" class={stubClass}>
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputLeftAddon data-testid="input-addon" className={stubClass}>
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon" classList={{ [stubClass]: true }}>
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from inputAddonStyles with 'placement=left'", () => {
    // arrange
    const inputAddonClass = inputAddonStyles({
      placement: "left",
    });

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftAddon data-testid="input-addon">
          <IconSearch />
        </InputLeftAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(inputAddonClass.className);
  });
});

describe("InputRightAddon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon">
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon">
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon" as="span">
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toBeInstanceOf(HTMLSpanElement);
  });

  it("should call inputGroupContext 'setHasRightAddon' on mount", () => {
    // arrange
    jest.spyOn(inputGroupModule, "useInputGroupContext").mockReturnValue(inputGroupContextMock);

    const stubContext = inputGroupModule.useInputGroupContext();

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon>
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));

    // assert
    expect(stubContext?.setHasRightAddon).toHaveBeenCalledWith(true);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon">
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass("hope-input-right-addon");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(InputRightAddon.toString()).toBe(".hope-input-right-addon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon" class={stubClass}>
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputRightAddon data-testid="input-addon" className={stubClass}>
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon" classList={{ [stubClass]: true }}>
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from inputAddonStyles with 'placement=right'", () => {
    // arrange
    const inputAddonClass = inputAddonStyles({
      placement: "right",
    });

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightAddon data-testid="input-addon">
          <IconSearch />
        </InputRightAddon>
      </InputGroup>
    ));
    const inputAddon = screen.getByTestId("input-addon");

    // assert
    expect(inputAddon).toHaveClass(inputAddonClass.className);
  });
});
