import type { JSX } from "@solidjs/web";
import { createSignal, For, merge, Show } from "solid-js";
import type { SelectionMode } from "../../internal";
import { createListboxItem } from "../../listbox";
import {
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  type CreateComboboxTriggerProps,
  createCombobox,
  createComboboxContent,
  createComboboxList,
  createComboboxPositioner,
  createComboboxTrigger,
  createComboboxValue,
} from "../index";

// Shared test support for the combobox kernel. Lives under `__tests__/` so `check:coverage-parity`
// treats it as test support, not a source file needing its own test/doc.
//
// This is the `SelectListbox` shape from `listbox-harness.tsx`, grown up: DOM focus lives on an
// external `role="combobox"` owner, the popup mounts lazily, and every prop on every element comes
// from a kernel hook. It exists so the kernel can be driven end-to-end *before* any component does.

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
export function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

/**
 * `Açaí` is load-bearing, not decoration: it is what proves the collator folds diacritics, so a
 * `acai` query matches it where `toLowerCase()` never would.
 */
export const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Açaí"];

/**
 * Clear of every edge, so neither `flip` nor `shift` has anything to react to — and deliberately
 * **away from the top-left**, where a `mount()`ed tree renders in normal flow.
 *
 * The physical Playwright cursor is per-page and persists across test files, so wherever a
 * `userEvent.click` here leaves it, the *next* file's tree mounts underneath it — and Chrome fires
 * `mouseenter` on whatever element the layout puts under a stationary pointer. That is a real
 * cross-file coupling: parked at (160, 120), these tests made `calendar-cell`'s range hover preview
 * (`onMouseEnter` → `highlightDate`) fire on mount, moving `focusedDate` off the day the test had
 * just clicked. Keeping the cursor out of the flow region is mitigation, not a cure — see this
 * folder's note in the phase summary. The viewport is Vitest's default 414 × 896, so this has to
 * stay inside it — a trigger `userEvent` cannot reach fails every test here.
 */
const TRIGGER_STYLE: JSX.CSSProperties = { position: "fixed", top: "620px", left: "40px" };

export interface ComboboxHarnessProps<V> {
  values: V[];
  labelOf?: (value: V) => string;
  /** Everything except `items`, which the harness owns. */
  options?: Omit<CreateComboboxOptions<V, SelectionMode>, "items">;
  triggerProps?: CreateComboboxTriggerProps;
  valueProps?: JSX.HTMLAttributes<HTMLElement>;
  positionerProps?: JSX.HTMLAttributes<HTMLDivElement>;
  contentProps?: JSX.HTMLAttributes<HTMLDivElement>;
  listProps?: JSX.HTMLAttributes<HTMLElement>;
  /** Omit the `Value` part, to observe the trigger with nothing registered into `aria-labelledby`. */
  withoutValue?: boolean;
  /** Render the trigger as a `<div>` — the shape a `render` prop produces, for `nativeButton: false`. */
  triggerAs?: "button" | "div";
  /** A focusable control *after* the widget, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
  onReady?: (state: CreateComboboxReturn<V, SelectionMode>) => void;
}

export function ComboboxHarness<V>(props: ComboboxHarnessProps<V>): JSX.Element {
  const labelOf = (value: V) => props.labelOf?.(value) ?? String(value);

  // `merge`, never a spread: a spread reads every getter once, so a test controlling `open` or
  // `value` through `props.options` would freeze at its first value.
  const overrides: Omit<CreateComboboxOptions<V, SelectionMode>, "items"> = props.options ?? {};
  const state = createCombobox<V, SelectionMode>(
    merge(overrides, {
      get items() {
        return props.values;
      },
    }),
  );
  props.onReady?.(state);

  const trigger = createComboboxTrigger(
    state,
    // `role="combobox"` with no accessible name is an axe `aria-input-field-name` violation, and
    // there is no `Label` part by design — so every tree carries one of these.
    merge({ "aria-label": "Fruit" }, props.triggerProps ?? {}),
  );
  const positioner = createComboboxPositioner(state, props.positionerProps ?? {});
  const content = createComboboxContent(state, props.contentProps ?? {});
  const list = createComboboxList(state, props.listProps ?? {});

  const selectedLabel = () => {
    const selected = state.list.value();
    return selected.length === 0 ? "Pick a fruit" : selected.map(labelOf).join(", ");
  };

  // A nested component, so `createComboboxValue` — and the id it registers upward — is scoped to the
  // part actually rendering, exactly as `Select.Value` will be. Called from the harness body instead,
  // a `withoutValue` tree would still publish a `valueId` for an element that does not exist.
  function ValuePart(): JSX.Element {
    const value = createComboboxValue(state, props.valueProps ?? {});
    return (
      <span data-testid="value" {...value.props}>
        {selectedLabel()}
      </span>
    );
  }

  const triggerContent = () => (
    <Show when={!props.withoutValue} fallback={selectedLabel()}>
      <ValuePart />
    </Show>
  );

  return (
    <>
      <Show
        when={props.triggerAs !== "div"}
        fallback={
          // Re-targeting a different tag is the case that casts, at the call site — the shape
          // `renderAsAnchor` uses in the Button tests. The kernel types its props over the element
          // the trigger normally *is*.
          <div
            data-testid="trigger"
            style={TRIGGER_STYLE}
            {...(trigger.props as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
            ref={trigger.setRef as unknown as (element: HTMLDivElement) => void}
          >
            {triggerContent()}
          </div>
        }
      >
        <button data-testid="trigger" style={TRIGGER_STYLE} {...trigger.props} ref={trigger.setRef}>
          {triggerContent()}
        </button>
      </Show>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <div data-testid="list" {...list.props} ref={list.setRef}>
              <For each={props.values}>
                {(item) => {
                  const [ref, setRef] = createSignal<HTMLDivElement>();
                  const option = createListboxItem<V>(state.list, { ref, item });
                  return (
                    <div ref={setRef} {...option.props} data-value={labelOf(item)}>
                      {labelOf(item)}
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </Show>
      {props.withOutsideButton ? (
        <button type="button" data-testid="outside">
          outside
        </button>
      ) : null}
    </>
  );
}

// ─── Queries ──────────────────────────────────────────────────────────────────────────────────────

export const triggerOf = (container: Element) =>
  container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
export const valuePartOf = (container: Element) =>
  container.querySelector('[data-testid="value"]') as HTMLElement | null;
export const positionerOf = (container: Element) =>
  container.querySelector('[data-testid="positioner"]') as HTMLElement | null;
export const contentOf = (container: Element) =>
  container.querySelector('[data-testid="content"]') as HTMLElement | null;
export const listOf = (container: Element) =>
  container.querySelector('[data-testid="list"]') as HTMLElement | null;

export function optionsOf(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}

/** The option `aria-activedescendant` currently names, by its label. */
export function activeLabel(container: Element): string | undefined {
  const id = triggerOf(container).getAttribute("aria-activedescendant");
  if (id == null) {
    return undefined;
  }
  return optionsOf(container).find((option) => option.id === id)?.dataset.value;
}

/** The labels of every option painting `data-active` — the highlight as a reader sees it. */
export function highlightedLabels(container: Element): string[] {
  return optionsOf(container)
    .filter((option) => option.hasAttribute("data-active"))
    .map((option) => option.dataset.value as string);
}

export function selectedLabels(container: Element): string[] {
  return optionsOf(container)
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.dataset.value as string);
}

/** One frame is enough for a dismissal (or a focus move) that was going to happen to have happened. */
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
