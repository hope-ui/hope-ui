import { cleanup, screen } from "solid-testing-library";

import { FormErrorMessage, FormHelperText } from "@/components";
import { FormControl } from "@/components/form-control/form-control";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { baseInputResetStyles } from "../input/input.styles";
import { Textarea } from "./textarea";
import { textareaStyles } from "./textarea.styles";

describe("Textarea", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toBeInTheDocument();
  });

  it("should render <textarea> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("should have default id from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <Textarea data-testid="textarea" />
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("id", expect.stringMatching(/^field-(.+)/));
  });

  it("should have 'aria-required' and 'required' attribute when FormControl is required", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl required>
        <Textarea data-testid="textarea" />
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("required");
    expect(textarea).toHaveAttribute("aria-required", "true");
  });

  it("should have 'disabled' attribute when FormControl is disabled", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl disabled>
        <Textarea data-testid="textarea" />
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("disabled");
  });

  it("should have 'aria-invalid' attribute when FormControl is invalid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <Textarea data-testid="textarea" />
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("should have 'aria-readonly' and 'readOnly' attribute when FormControl is readOnly", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl readOnly>
        <Textarea data-testid="textarea" />
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("readOnly");
    expect(textarea).toHaveAttribute("aria-readonly", "true");
  });

  it("should have 'aria-describedby' attribute with FormHelperText id generated from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <Textarea data-testid="textarea" />
        <FormHelperText data-testid="helper-text">Helper text</FormHelperText>
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(textarea).toHaveAttribute("aria-describedby", helperText.id);
  });

  it("should have 'aria-describedby' attribute with FormErrorMessage id first when FormControl is invalid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <Textarea data-testid="textarea" />
        <FormHelperText data-testid="helper-text">Helper text</FormHelperText>
        <FormErrorMessage data-testid="error-message">Error message</FormErrorMessage>
      </FormControl>
    ));
    const textarea = screen.getByTestId("textarea");
    const helperText = screen.getByTestId("helper-text");
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(textarea).toHaveAttribute("aria-describedby", `${errorMessage.id} ${helperText.id}`);
  });

  it("should have 'aria-required' and 'required' attribute when Textarea is required", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" required />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("required");
    expect(textarea).toHaveAttribute("aria-required", "true");
  });

  it("should have 'disabled' attribute when Textarea is disabled", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" disabled />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("disabled");
  });

  it("should have 'aria-invalid' attribute when Textarea is invalid", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" invalid />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("should have 'aria-readonly' and 'readOnly' attribute when Textarea is readOnly", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" readOnly />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveAttribute("readOnly");
    expect(textarea).toHaveAttribute("aria-readonly", "true");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveClass("hope-textarea");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Textarea.toString()).toBe(".hope-textarea");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" class={stubClass} />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    // eslint-disable-next-line solid/no-react-specific-props
    renderWithHopeProvider(() => <Textarea data-testid="textarea" className={stubClass} />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Textarea data-testid="textarea" classList={{ [stubClass]: true }} />
    ));
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveClass(stubClass);
  });

  it("should have stitches generated class from baseInputResetStyles and textareaStyles", () => {
    // arrange
    const baseInputResetClass = baseInputResetStyles();
    const textareaClass = textareaStyles();

    // act
    renderWithHopeProvider(() => <Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    // assert
    expect(textarea).toHaveClass(baseInputResetClass.className);
    expect(textarea).toHaveClass(textareaClass.className);
  });
});
