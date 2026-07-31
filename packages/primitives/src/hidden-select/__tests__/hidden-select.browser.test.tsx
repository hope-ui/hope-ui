import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type CreateListboxReturn, createListbox } from "../../listbox";
import { HiddenSelect } from "../index";

interface Fruit {
  id: number;
  name: string;
}

const FRUITS: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

function makeFruits(count: number): Fruit[] {
  return Array.from({ length: count }, (_, index) => ({ id: index, name: `Fruit ${index}` }));
}

interface HarnessProps {
  items?: readonly Fruit[];
  name?: string | undefined;
  selectionMode?: "single" | "multiple";
  defaultValue?: Fruit[];
  required?: boolean;
  disabled?: boolean;
  /** Renders an empty required text field *before* the widget, so it is the form's first invalid one. */
  leadingRequiredField?: boolean;
  onSubmit?: (data: FormData) => void;
  onReady?: (state: CreateListboxReturn<Fruit>) => void;
}

/**
 * A real `<form>` around a `createListbox` state and its `HiddenSelect`. The trigger is a plain
 * `<button>` rather than a rendered listbox: this suite is about the hidden native field, and the
 * only thing it needs from a trigger is that focus can land on something visible.
 */
function Harness(props: HarnessProps): JSX.Element {
  const [trigger, setTrigger] = createSignal<HTMLElement | null>();
  const state = createListbox<Fruit>({
    get items() {
      return props.items ?? FRUITS;
    },
    itemToValue: (fruit) => String(fruit.id),
    itemToLabel: (fruit) => fruit.name,
    get selectionMode() {
      return props.selectionMode ?? "single";
    },
    defaultValue: props.defaultValue,
    get name() {
      return "name" in props ? props.name : "fruit";
    },
    get required() {
      return props.required ?? false;
    },
    get disabled() {
      return props.disabled ?? false;
    },
  });
  props.onReady?.(state);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit?.(new FormData(event.currentTarget));
      }}
    >
      <Show when={props.leadingRequiredField}>
        <input type="text" name="before" aria-label="Before" required />
      </Show>
      <button type="button" ref={setTrigger}>
        Fruit
      </button>
      <HiddenSelect state={state} triggerRef={trigger} />
      <button type="submit">Submit</button>
    </form>
  );
}

const hiddenSelect = (container: HTMLElement) =>
  container.querySelector("select") as HTMLSelectElement | null;
const hiddenInputs = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLInputElement>('input[name="fruit"]'),
];
// Scoped to the mounted container, never `page`: a failing test skips its `dispose()`, so a
// document-wide role query would then match every earlier tree's buttons too.
const trigger = (container: HTMLElement) =>
  container.querySelector('button[type="button"]') as HTMLButtonElement;
const submit = (container: HTMLElement) =>
  container.querySelector('button[type="submit"]') as HTMLButtonElement;
const leadingField = (container: HTMLElement) =>
  container.querySelector('input[name="before"]') as HTMLInputElement;

describe("HiddenSelect — markup", () => {
  it("renders a clipped, aria-hidden, non-tabbable <select> inside a <label>", async () => {
    const { container, dispose } = mount(() => <Harness />);

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.getAttribute("tabindex")).toBe("-1");
    expect(select.parentElement?.tagName).toBe("LABEL");

    // Clipped, never `display: none` — Safari skips a display:none <select> for autofill.
    const wrapper = select.closest("[aria-hidden='true']") as HTMLElement;
    expect(wrapper).not.toBeNull();
    const style = getComputedStyle(wrapper);
    expect(style.display).not.toBe("none");
    expect(style.position).toBe("fixed");
    expect(wrapper.getBoundingClientRect().width).toBe(1);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders a leading empty option plus one per item, labelled by itemToLabel", () => {
    const { container, dispose } = mount(() => <Harness />);

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toEqual(["", "1", "2", "3"]);
    expect([...select.options].slice(1).map((option) => option.textContent)).toEqual([
      "Apple",
      "Banana",
      "Cherry",
    ]);
    // The placeholder label option is what makes `required` fail while nothing is chosen.
    expect(select.selectedIndex).toBe(0);

    dispose();
  });

  it("carries name / form / disabled / multiple from the state", () => {
    const { container, dispose } = mount(() => (
      <Harness selectionMode="multiple" disabled defaultValue={[FRUITS[0] as Fruit]} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect(select.name).toBe("fruit");
    expect(select.multiple).toBe(true);
    expect(select.disabled).toBe(true);

    dispose();
  });

  it("renders nothing without a name — an unnamed field is never submitted", async () => {
    const { container, dispose } = mount(() => <Harness name={undefined} />);

    expect(hiddenSelect(container)).toBeNull();
    expect(hiddenInputs(container)).toHaveLength(0);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders options for the current values while the option set is still empty", () => {
    // Data streaming in: the selection is known before the items are. Rendering it anyway is what
    // keeps a FormData read correct on the very first frame.
    const { container, dispose } = mount(() => (
      <Harness items={[]} defaultValue={[FRUITS[1] as Fruit]} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect([...select.options].map((option) => option.value)).toEqual(["", "2"]);
    expect(select.value).toBe("2");

    dispose();
  });
});

describe("HiddenSelect — form submission", () => {
  it("submits the selected value under `name`", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness defaultValue={[FRUITS[1] as Fruit]} onSubmit={(data) => (submitted = data)} />
    ));

    expect((hiddenSelect(container) as HTMLSelectElement).value).toBe("2");

    await userEvent.click(submit(container));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit")).toEqual(["2"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("submits every selected value in multiple mode", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness
        selectionMode="multiple"
        defaultValue={[FRUITS[0] as Fruit, FRUITS[2] as Fruit]}
        onSubmit={(data) => (submitted = data)}
      />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect([...select.selectedOptions].map((option) => option.value)).toEqual(["1", "3"]);

    await userEvent.click(submit(container));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit")).toEqual(["1", "3"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("submits nothing while disabled", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness
        disabled
        defaultValue={[FRUITS[1] as Fruit]}
        onSubmit={(data) => (submitted = data)}
      />
    ));

    await userEvent.click(submit(container));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit")).toEqual([]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("tracks the selection as it changes", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => <Harness onReady={(s) => (state = s)} />);

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect(select.value).toBe("");

    flush(() => state.selection.setValue([FRUITS[2] as Fruit]));
    await vi.waitFor(() => expect(select.value).toBe("3"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("HiddenSelect — writing back", () => {
  it("writes an autofilled choice back into the selection", async () => {
    // What browser autofill and the mobile picker both look like from here: the native control
    // changed under us, and the widget has to follow.
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => <Harness onReady={(s) => (state = s)} />);

    const select = hiddenSelect(container) as HTMLSelectElement;
    flush(() => {
      select.value = "3";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await vi.waitFor(() => expect(state.formValues()).toEqual(["3"]));
    expect(state.value()).toEqual([FRUITS[2]]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("clears the selection when the placeholder option is chosen", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <Harness defaultValue={[FRUITS[0] as Fruit]} onReady={(s) => (state = s)} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    flush(() => {
      select.value = "";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await vi.waitFor(() => expect(state.value()).toEqual([]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("writes back the whole set in multiple mode", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <Harness selectionMode="multiple" onReady={(s) => (state = s)} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    flush(() => {
      for (const option of select.options) {
        option.selected = option.value === "1" || option.value === "3";
      }
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await vi.waitFor(() => expect(state.formValues()).toEqual(["1", "3"]));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("HiddenSelect — form reset", () => {
  it("restores the selection the field was created with", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => (
      <Harness defaultValue={[FRUITS[0] as Fruit]} onReady={(s) => (state = s)} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    flush(() => state.selection.setValue([FRUITS[2] as Fruit]));
    await vi.waitFor(() => expect(select.value).toBe("3"));

    (select.form as HTMLFormElement).reset();

    await vi.waitFor(() => {
      expect(state.value()).toEqual([FRUITS[0]]);
      expect(select.value).toBe("1");
    });

    await expectNoA11yViolations(container);
    dispose();
  });

  it("restores an empty default too", async () => {
    let state!: CreateListboxReturn<Fruit>;
    const { container, dispose } = mount(() => <Harness onReady={(s) => (state = s)} />);

    const select = hiddenSelect(container) as HTMLSelectElement;
    flush(() => state.selection.setValue([FRUITS[1] as Fruit]));
    await vi.waitFor(() => expect(select.value).toBe("2"));

    (select.form as HTMLFormElement).reset();

    await vi.waitFor(() => {
      expect(state.value()).toEqual([]);
      expect(select.value).toBe("");
    });

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("HiddenSelect — required", () => {
  it("blocks submission and moves focus to the trigger when nothing is selected", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness required onSubmit={(data) => (submitted = data)} />
    ));

    const select = hiddenSelect(container) as HTMLSelectElement;
    expect(select.required).toBe(true);
    expect(select.validity.valueMissing).toBe(true);

    await userEvent.click(submit(container));

    // The browser refuses the submit, and focus lands on the visible control — never inside the
    // clipped <select>, which a user could never find.
    expect(submitted).toBeUndefined();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("submits once something is selected", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness
        required
        defaultValue={[FRUITS[1] as Fruit]}
        onSubmit={(data) => (submitted = data)}
      />
    ));

    expect((hiddenSelect(container) as HTMLSelectElement).validity.valueMissing).toBe(false);

    await userEvent.click(submit(container));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit")).toEqual(["2"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves focus alone when an earlier field is the form's first invalid control", async () => {
    const { container, dispose } = mount(() => <Harness required leadingRequiredField />);

    await userEvent.click(submit(container));

    // The user has to fix the field above this one first, so the browser's own focus target wins.
    await vi.waitFor(() => expect(document.activeElement).toBe(leadingField(container)));
    expect(document.activeElement).not.toBe(trigger(container));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("HiddenSelect — the >300-item fallback", () => {
  const MANY = makeFruits(301);

  it("renders hidden text inputs instead of a <select>", async () => {
    const { container, dispose } = mount(() => (
      <Harness items={MANY} defaultValue={[MANY[7] as Fruit]} />
    ));

    expect(hiddenSelect(container)).toBeNull();

    const inputs = hiddenInputs(container);
    expect(inputs).toHaveLength(1);
    // `type="text"` behind `display: none`, never `type="hidden"` — a hidden input is barred from
    // constraint validation, so `required` on it would be silently ignored.
    expect(inputs[0]?.type).toBe("text");
    expect(getComputedStyle(inputs[0] as HTMLInputElement).display).toBe("none");
    expect(inputs[0]?.value).toBe("7");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("submits every selected value, and marks only the first field required", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness
        items={MANY}
        selectionMode="multiple"
        required
        defaultValue={[MANY[1] as Fruit, MANY[2] as Fruit]}
        onSubmit={(data) => (submitted = data)}
      />
    ));

    const inputs = hiddenInputs(container);
    expect(inputs.map((input) => input.value)).toEqual(["1", "2"]);
    expect(inputs.map((input) => input.required)).toEqual([true, false]);

    await userEvent.click(submit(container));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("fruit")).toEqual(["1", "2"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("keeps one required field when nothing is selected, so submission still blocks", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <Harness items={MANY} required onSubmit={(data) => (submitted = data)} />
    ));

    const inputs = hiddenInputs(container);
    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.validity.valueMissing).toBe(true);

    await userEvent.click(submit(container));

    expect(submitted).toBeUndefined();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger(container)));

    await expectNoA11yViolations(container);
    dispose();
  });
});
