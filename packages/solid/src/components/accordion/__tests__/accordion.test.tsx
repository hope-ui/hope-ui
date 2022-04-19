import { cleanup, fireEvent, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../test-utils";
import { Accordion } from "../accordion";
import { AccordionButton } from "../accordion-button";
import { AccordionItem } from "../accordion-item";
import { AccordionPanel } from "../accordion-panel";

describe("Accordion", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("opens the accordion panel (uncontrolled)", () => {
    // act
    renderWithHopeProvider(() => (
      <Accordion defaultIndex={0}>
        <AccordionItem>
          <h2>
            <AccordionButton data-testid="button">Section 1 title</AccordionButton>
          </h2>
          <AccordionPanel data-testid="panel">Panel 1</AccordionPanel>
        </AccordionItem>
      </Accordion>
    ));

    const button = screen.getByTestId("button");

    // assert
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  // it("toggles the accordion on click (uncontrolled)", async () => {
  //   // act
  //   renderWithHopeProvider(() => (
  //     <Accordion>
  //       <AccordionItem>
  //         <h2>
  //           <AccordionButton>Trigger</AccordionButton>
  //         </h2>
  //         <AccordionPanel>Panel</AccordionPanel>
  //       </AccordionItem>
  //     </Accordion>
  //   ));

  //   const trigger = screen.getByText("Trigger");

  //   expect(trigger).toHaveAttribute("aria-expanded", "false");

  //   // assert
  //   fireEvent.click(trigger);
  //   await Promise.resolve();

  //   expect(trigger).toHaveAttribute("aria-expanded", "true");

  //   fireEvent.click(trigger);
  //   await Promise.resolve();

  //   expect(trigger).toHaveAttribute("aria-expanded", "false");
  // });
});
