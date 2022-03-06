import { cleanup, screen } from "solid-testing-library";

import { IconCheckCircle } from "@/components/icons/IconCheckCircle";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { inputElementStyles, InputElementVariants } from "../input.styles";
import { InputElement, InputLeftElement, InputRightElement } from "../input-element";
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

describe("InputElement", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element">
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element">
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element" as="span">
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element" class={stubClass}>
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputElement data-testid="input-element" className={stubClass}>
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element" classList={{ [stubClass]: true }}>
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have stitches generated class from variant props", () => {
    // arrange
    const variantProps: InputElementVariants = {
      placement: "left",
      size: "lg",
    };

    const inputElementClass = inputElementStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputElement data-testid="input-element" {...variantProps}>
          <IconCheckCircle />
        </InputElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(inputElementClass.className);
  });
});

describe("InputLeftElement", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element">
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element">
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element" as="span">
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLSpanElement);
  });

  it("should call inputGroupContext 'setHasLeftElement' on mount", () => {
    // arrange
    jest.spyOn(inputGroupModule, "useInputGroupContext").mockReturnValue(inputGroupContextMock);

    const stubContext = inputGroupModule.useInputGroupContext();

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement>
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));

    // assert
    expect(stubContext?.setHasLeftElement).toHaveBeenCalledWith(true);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element">
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass("hope-input-left-element");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(InputLeftElement.toString()).toBe(".hope-input-left-element");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element" class={stubClass}>
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputLeftElement data-testid="input-element" className={stubClass}>
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element" classList={{ [stubClass]: true }}>
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have stitches generated class from inputElementStyles with 'placement=left'", () => {
    // arrange
    const inputElementClass = inputElementStyles({
      placement: "left",
    });

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputLeftElement data-testid="input-element">
          <IconCheckCircle />
        </InputLeftElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(inputElementClass.className);
  });
});

describe("InputRightElement", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element">
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element">
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element" as="span">
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toBeInstanceOf(HTMLSpanElement);
  });

  it("should call inputGroupContext 'setHasRightElement' on mount", () => {
    // arrange
    jest.spyOn(inputGroupModule, "useInputGroupContext").mockReturnValue(inputGroupContextMock);

    const stubContext = inputGroupModule.useInputGroupContext();

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement>
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));

    // assert
    expect(stubContext?.setHasRightElement).toHaveBeenCalledWith(true);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element">
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass("hope-input-right-element");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(InputRightElement.toString()).toBe(".hope-input-right-element");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element" class={stubClass}>
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <InputRightElement data-testid="input-element" className={stubClass}>
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element" classList={{ [stubClass]: true }}>
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(stubClass);
  });

  it("should have stitches generated class from inputElementStyles with 'placement=right'", () => {
    // arrange
    const inputElementClass = inputElementStyles({
      placement: "right",
    });

    // act
    renderWithHopeProvider(() => (
      <InputGroup>
        <InputRightElement data-testid="input-element">
          <IconCheckCircle />
        </InputRightElement>
      </InputGroup>
    ));
    const inputElement = screen.getByTestId("input-element");

    // assert
    expect(inputElement).toHaveClass(inputElementClass.className);
  });
});
