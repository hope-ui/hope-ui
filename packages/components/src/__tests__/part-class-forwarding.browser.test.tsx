import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../alert";
import { Badge } from "../badge";
import { Button } from "../button";
import { Calendar } from "../calendar";
import { CloseButton } from "../close-button";
import { Combobox } from "../combobox";
import { Dialog } from "../dialog";
import { Listbox } from "../listbox";
import { Popover } from "../popover";
import { Select } from "../select";

/**
 * One invariant, pinned across every component: a public part that renders a host element puts the
 * consumer's `class` on that element.
 *
 * It exists because this bug has now shipped three times, always silently — a part declaring no
 * native attributes at all, a part declaring only `children`, and five parts computing `class` from
 * their slot without folding `props.class` in, so the computed getter won the merge and the
 * consumer's string vanished. Each type-checked, passed its own suite, and shipped docs promising
 * the opposite.
 *
 * **The list below is hand-kept**, so a new part is covered only once someone adds it. That gap is
 * what `pnpm check:class-forwarding` fills: the script reads every part file and catches the two
 * source shapes that drop a class, with nobody having to remember. Neither subsumes the other — the
 * script cannot see the DOM (a part could compute the right string and render it onto the wrong
 * element, or a `render` target could swallow it), and this file cannot see an unlisted part.
 *
 * Deliberately narrow: `class` only, asserted on the element. Recipe classes surviving the merge and
 * tailwind-merge precedence stay in each component's own suite, which can express them per part.
 */

function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/** `data-slot` → the probe class each part was rendered with, for one assertion loop per component. */
type SlotProbes = Record<string, string>;

function expectProbedClasses(root: ParentNode, probes: SlotProbes): void {
  for (const [slot, probeClass] of Object.entries(probes)) {
    const element = root.querySelector(`[data-slot="${slot}"]`);
    expect(element, `no element rendered for data-slot="${slot}"`).not.toBeNull();
    expect(element?.className, `${slot} dropped its class`).toContain(probeClass);
  }
}

const REFERENCE_DATE = new CalendarDate(2026, 6, 15);

interface Fruit {
  id: number;
  name: string;
}
interface Basket {
  kind: string;
  fruits: Fruit[];
}
const APPLE: Fruit = { id: 1, name: "Apple" };
// Grouped, so a single tree can probe every list part at once — the group, its label, an item, the
// item's indicator and a separator.
const BASKETS: Basket[] = [{ kind: "Fruits", fruits: [APPLE] }];
const itemToValue = (fruit: Fruit) => String(fruit.id);
const itemToLabel = (fruit: Fruit) => fruit.name;

describe("every public part forwards its class to the element it renders", () => {
  it("Alert", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root class="probe-root" colorScheme="info">
          <Alert.Icon class="probe-icon" />
          <Alert.Content class="probe-content">
            <Alert.Title class="probe-title">Title</Alert.Title>
            <Alert.Description class="probe-description">Description</Alert.Description>
          </Alert.Content>
          <Alert.Actions class="probe-actions">
            <button type="button">Undo</button>
          </Alert.Actions>
          <Alert.CloseTrigger class="probe-close-trigger" />
        </Alert.Root>
      </Themed>
    ));

    expectProbedClasses(container, {
      alert: "probe-root",
      "alert-icon": "probe-icon",
      "alert-content": "probe-content",
      "alert-title": "probe-title",
      "alert-description": "probe-description",
      "alert-actions": "probe-actions",
      "alert-close-trigger": "probe-close-trigger",
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  it("Button, Badge, CloseButton", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button class="probe-button">Click</Button>
        <Badge class="probe-badge">New</Badge>
        <CloseButton class="probe-close-button" />
      </Themed>
    ));

    expectProbedClasses(container, {
      button: "probe-button",
      badge: "probe-badge",
      "close-button": "probe-close-button",
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  it("Calendar", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Calendar.Root class="probe-root" defaultFocusedValue={REFERENCE_DATE}>
          <Calendar.Header class="probe-header">
            <Calendar.PrevButton class="probe-prev-button" aria-label="Previous month" />
            <Calendar.Heading class="probe-heading" />
            <Calendar.NextButton class="probe-next-button" aria-label="Next month" />
          </Calendar.Header>
          <Calendar.Grid class="probe-grid" />
        </Calendar.Root>
      </Themed>
    ));

    expectProbedClasses(container, {
      calendar: "probe-root",
      "calendar-header": "probe-header",
      "calendar-prev-button": "probe-prev-button",
      "calendar-heading": "probe-heading",
      "calendar-next-button": "probe-next-button",
      "calendar-grid": "probe-grid",
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  // Dialog's parts move out to `document.body`, so they are probed against the document rather than
  // the mount container. `Dialog.Root`/`Dialog.Portal` render no element at all and are exempt.
  it("Dialog", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Dialog.Root defaultOpen>
          <Dialog.Trigger class="probe-trigger">Open</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop class="probe-backdrop" style={{ position: "fixed", inset: "0" }} />
            <Dialog.Positioner class="probe-positioner">
              {/* The auto close button is off, so the only `dialog-close-trigger` in the document is
              the probed one below — otherwise the query would find Content's unprobed one first. */}
              <Dialog.Content
                class="probe-content"
                showCloseButton={false}
                style={{ position: "fixed", top: "0", left: "0" }}
              >
                <Dialog.Header class="probe-header">
                  <Dialog.Title class="probe-title">Title</Dialog.Title>
                  <Dialog.Description class="probe-description">Description</Dialog.Description>
                </Dialog.Header>
                <Dialog.Body class="probe-body">Body</Dialog.Body>
                <Dialog.Footer class="probe-footer">Footer</Dialog.Footer>
                <Dialog.CloseTrigger class="probe-close-trigger" />
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
      </Themed>
    ));

    expectProbedClasses(document, {
      "dialog-backdrop": "probe-backdrop",
      "dialog-positioner": "probe-positioner",
      "dialog-content": "probe-content",
      "dialog-header": "probe-header",
      "dialog-title": "probe-title",
      "dialog-description": "probe-description",
      "dialog-body": "probe-body",
      "dialog-footer": "probe-footer",
      "dialog-close-trigger": "probe-close-trigger",
    });
    // The trigger is unstyled and so carries no `data-slot`: its `class` rides the hook's plain prop
    // forwarding rather than a slot function, which is a different path and needs its own pin.
    expect(document.querySelector("button.probe-trigger")).not.toBeNull();
    await expectNoA11yViolations(document.body);
    dispose();
  });

  // Popover's parts move out to `document.body` too. `Popover.Root`/`Popover.Portal` render no
  // element and are exempt; `Trigger` and `Anchor` do render one but are unstyled, so their `class`
  // takes the plain prop-forwarding path and is asserted separately below.
  it("Popover", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Popover.Root defaultOpen>
          <Popover.Anchor
            class="probe-anchor"
            style={{ position: "fixed", top: "300px", left: "40px", width: "120px" }}
          />
          <Popover.Trigger
            class="probe-trigger"
            style={{ position: "fixed", top: "200px", left: "120px" }}
          >
            Open
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner class="probe-positioner" style={{ width: "200px" }}>
              <Popover.Content class="probe-content">
                <Popover.Arrow class="probe-arrow" style={{ width: "8px", height: "8px" }} />
                <Popover.Header class="probe-header">
                  <Popover.Title class="probe-title">Title</Popover.Title>
                  <Popover.Description class="probe-description">Description</Popover.Description>
                </Popover.Header>
                <Popover.CloseTrigger class="probe-close-trigger" />
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Themed>
    ));

    // The layer stays `visibility: hidden` until its first measurement lands; running axe against
    // that intermediate state returns an `incomplete` nobody can act on.
    await vi.waitFor(() => {
      const positioner = document.querySelector<HTMLElement>('[data-slot="popover-positioner"]');
      expect(positioner?.style.visibility).not.toBe("hidden");
    });

    expectProbedClasses(document, {
      "popover-positioner": "probe-positioner",
      "popover-content": "probe-content",
      "popover-arrow": "probe-arrow",
      "popover-header": "probe-header",
      "popover-title": "probe-title",
      "popover-description": "probe-description",
      "popover-close-trigger": "probe-close-trigger",
    });
    expect(document.querySelector("button.probe-trigger")).not.toBeNull();
    expect(document.querySelector("div.probe-anchor")).not.toBeNull();
    await expectNoA11yViolations(document.body, {
      // Axe reports `aria-valid-attr-value` as *incomplete* for any element carrying both
      // `aria-haspopup` and `aria-controls`, without ever resolving the id reference — undecidable
      // by construction. That the reference resolves is pinned in `popover.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });

  it("Listbox", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Listbox.Root
          class="probe-root"
          aria-label="fruits"
          items={BASKETS}
          groupToItems={(basket) => basket.fruits}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={[APPLE]}
        >
          {(basket: Basket) => (
            <>
              <Listbox.Group class="probe-group">
                <Listbox.GroupLabel class="probe-group-label">{basket.kind}</Listbox.GroupLabel>
                <For each={basket.fruits}>
                  {(fruit) => (
                    <Listbox.Item class="probe-item" item={fruit}>
                      <Listbox.ItemIndicator class="probe-item-indicator" />
                      {fruit.name}
                    </Listbox.Item>
                  )}
                </For>
              </Listbox.Group>
              <Listbox.Separator class="probe-separator" />
            </>
          )}
        </Listbox.Root>
      </Themed>
    ));

    expectProbedClasses(container, {
      listbox: "probe-root",
      "listbox-group": "probe-group",
      "listbox-group-label": "probe-group-label",
      "listbox-item": "probe-item",
      "listbox-item-indicator": "probe-item-indicator",
      "listbox-separator": "probe-separator",
    });
    await expectNoA11yViolations(container);
    dispose();
  });

  // Select's popup moves out of the mount container, so the probe runs against the document.
  // `Select.Root`/`Select.Portal` render no element and are exempt; unlike Popover, every other part
  // is styled, so there is no separate slot-less part to pin. The tree is grouped and opened,
  // because nothing renders until it is.
  //
  // It is also the one tree here that needs **landmarks**. An open Select's id references cross the
  // portal in both directions, so axe has to inspect the whole document — and axe's `region` rule
  // then flags a bare `<body>` child, which is a fact about this harness page rather than about
  // Select. Hence the named region and the `<main>` to portal into, the landmarks a real page has.
  it("Select", async () => {
    const portalMount = document.createElement("main");
    document.body.appendChild(portalMount);
    const { dispose } = mount(() => (
      <Themed>
        <div role="region" aria-label="Select probe">
          <Select.Root
            items={BASKETS}
            groupToItems={(basket) => basket.fruits}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            defaultValue={APPLE}
            defaultOpen
          >
            <Select.Trigger
              class="probe-trigger"
              aria-label="fruits"
              style={{ position: "fixed", top: "120px", left: "40px", width: "180px" }}
            >
              <Select.Value class="probe-value" placeholder="Pick a fruit" />
              <Select.Icon class="probe-icon" />
            </Select.Trigger>
            <Select.Portal mount={portalMount}>
              <Select.Positioner class="probe-positioner">
                <Select.Content class="probe-content">
                  <Select.List class="probe-list">
                    {(basket) => (
                      <>
                        <Select.Group class="probe-group">
                          <Select.GroupLabel class="probe-group-label">
                            {(basket as Basket).kind}
                          </Select.GroupLabel>
                          <For each={(basket as Basket).fruits}>
                            {(fruit) => (
                              <Select.Item class="probe-item" item={fruit}>
                                <Select.ItemText class="probe-item-text">
                                  {fruit.name}
                                </Select.ItemText>
                                <Select.ItemIndicator class="probe-item-indicator" />
                              </Select.Item>
                            )}
                          </For>
                        </Select.Group>
                        <Select.Separator class="probe-separator" />
                      </>
                    )}
                  </Select.List>
                </Select.Content>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </Themed>
    ));

    // The layer stays `visibility: hidden` until its first measurement lands; running axe against
    // that intermediate state returns an `incomplete` nobody can act on.
    await vi.waitFor(() => {
      const positioner = document.querySelector<HTMLElement>('[data-slot="select-positioner"]');
      expect(positioner?.style.visibility).not.toBe("hidden");
    });

    expectProbedClasses(document, {
      "select-trigger": "probe-trigger",
      "select-value": "probe-value",
      "select-icon": "probe-icon",
      "select-positioner": "probe-positioner",
      "select-content": "probe-content",
      "select-list": "probe-list",
      "select-group": "probe-group",
      "select-group-label": "probe-group-label",
      "select-separator": "probe-separator",
      "select-item": "probe-item",
      "select-item-text": "probe-item-text",
      "select-item-indicator": "probe-item-indicator",
    });
    await expectNoA11yViolations(document.body, {
      // Axe reports `aria-valid-attr-value` as *incomplete* for any element carrying both
      // `aria-haspopup` and `aria-controls`, without ever resolving the id reference — undecidable
      // by construction. That the reference resolves is pinned in `select.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
    portalMount.remove();
  });

  it("Combobox", async () => {
    const portalMount = document.createElement("main");
    document.body.appendChild(portalMount);
    const { dispose } = mount(() => (
      <Themed>
        <div role="region" aria-label="Combobox probe">
          <Combobox.Root
            items={BASKETS}
            groupToItems={(basket) => basket.fruits}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            defaultValue={APPLE}
            defaultOpen
          >
            <Combobox.Control
              class="probe-control"
              style={{ position: "fixed", top: "120px", left: "40px", width: "220px" }}
            >
              <Combobox.Input class="probe-input" aria-label="fruits" />
              {/* `alwaysVisible`, because `Combobox.Clear` hides itself when there is nothing to
                  clear — and a part that renders nothing would pass this probe vacuously. */}
              <Combobox.Clear class="probe-clear" alwaysVisible />
              <Combobox.Trigger class="probe-trigger">
                <Combobox.Icon class="probe-icon" />
              </Combobox.Trigger>
            </Combobox.Control>
            <Combobox.Portal mount={portalMount}>
              <Combobox.Positioner class="probe-positioner">
                <Combobox.Content class="probe-content">
                  <Combobox.List class="probe-list">
                    {(basket, _index, fruits) => (
                      <>
                        <Combobox.Group class="probe-group">
                          <Combobox.GroupLabel class="probe-group-label">
                            {(basket as Basket).kind}
                          </Combobox.GroupLabel>
                          <For each={fruits() as Fruit[]}>
                            {(fruit) => (
                              <Combobox.Item class="probe-item" item={fruit}>
                                <Combobox.ItemText class="probe-item-text">
                                  {fruit.name}
                                </Combobox.ItemText>
                                <Combobox.ItemIndicator class="probe-item-indicator" />
                              </Combobox.Item>
                            )}
                          </For>
                        </Combobox.Group>
                        <Combobox.Separator class="probe-separator" />
                      </>
                    )}
                  </Combobox.List>
                  {/* `Combobox.Empty` renders only while the filtered list is empty, so it is probed
                      in its own tree below rather than here. */}
                  <Combobox.Status class="probe-status" />
                </Combobox.Content>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </Themed>
    ));

    await vi.waitFor(() => {
      const positioner = document.querySelector<HTMLElement>('[data-slot="combobox-positioner"]');
      expect(positioner?.style.visibility).not.toBe("hidden");
    });

    expectProbedClasses(document, {
      "combobox-control": "probe-control",
      "combobox-input": "probe-input",
      "combobox-clear": "probe-clear",
      "combobox-trigger": "probe-trigger",
      "combobox-icon": "probe-icon",
      "combobox-positioner": "probe-positioner",
      "combobox-content": "probe-content",
      "combobox-list": "probe-list",
      "combobox-status": "probe-status",
      "combobox-group": "probe-group",
      "combobox-group-label": "probe-group-label",
      "combobox-separator": "probe-separator",
      "combobox-item": "probe-item",
      "combobox-item-text": "probe-item-text",
      "combobox-item-indicator": "probe-item-indicator",
    });
    await expectNoA11yViolations(document.body, {
      // The chevron carries both `aria-haspopup` and `aria-controls` while open — see the note on
      // Select. That the reference resolves is pinned in `combobox.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
    portalMount.remove();
  });

  it("Combobox.Empty", async () => {
    // Its own tree, because the part renders only while the filtered option set is empty — which
    // needs an `items={[]}` root, openable at all only because `Combobox.Root` flips the underlying
    // `allowsEmptyCollection` default to `true`.
    const portalMount = document.createElement("main");
    document.body.appendChild(portalMount);
    const { dispose } = mount(() => (
      <Themed>
        <div role="region" aria-label="Combobox empty probe">
          <Combobox.Root items={[] as Fruit[]} defaultOpen>
            <Combobox.Control style={{ position: "fixed", top: "120px", left: "40px" }}>
              <Combobox.Input aria-label="fruits" />
            </Combobox.Control>
            <Combobox.Portal mount={portalMount}>
              <Combobox.Positioner>
                <Combobox.Content>
                  <Combobox.List>{() => null}</Combobox.List>
                  <Combobox.Empty class="probe-empty">Nothing found.</Combobox.Empty>
                </Combobox.Content>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </Themed>
    ));

    await vi.waitFor(() => {
      const positioner = document.querySelector<HTMLElement>('[data-slot="combobox-positioner"]');
      expect(positioner?.style.visibility).not.toBe("hidden");
    });

    expectProbedClasses(document, { "combobox-empty": "probe-empty" });
    await expectNoA11yViolations(document.body, {
      // An empty `role="listbox"` is exactly the state this tree exists to render, and axe cannot
      // decide it: `aria-required-children` is *incomplete* for a container with no owned children,
      // because "populated later" is legitimate and indistinguishable from "malformed". It is also
      // the state the combobox pattern asks for — a query matching nothing keeps the popup open so
      // the empty message can say so — and that message sits *beside* the listbox rather than inside
      // it precisely because a listbox may only contain options and groups.
      allowIncomplete: ["aria-required-children"],
    });
    dispose();
    portalMount.remove();
  });
});
