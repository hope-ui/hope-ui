import type { JSX } from "@solidjs/web";
import { createSignal, For, Show } from "solid-js";
import {
  type CreateTagsInputInputProps,
  type CreateTagsInputOptions,
  type CreateTagsInputReturn,
  createTagsInput,
  createTagsInputClear,
  createTagsInputControl,
  createTagsInputInput,
  createTagsInputItem,
  createTagsInputItemDelete,
  createTagsInputItemText,
  createTagsInputList,
} from "../index";

// Shared test support for the tags-input chip row. It lives under `__tests__/` so
// `check:coverage-parity` treats it as test support rather than a source file owing its own test + doc.

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
export function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

export const FRUITS = ["Apple", "Banana", "Cherry"];
/**
 * An empty start, typed. A bare `defaultValue: []` infers `V = never`, which makes `D3`'s conditional
 * `parse` **required** — the conditional working exactly as designed, and a compile error in a test
 * that only meant "no tags yet".
 */
export const NO_TAGS: string[] = [];

export interface TagsInputRowProps<V> {
  /** Passed straight to `createTagsInput` — not spread, so a test's getters stay reactive. */
  options: CreateTagsInputOptions<V>;
  onReady?: (state: CreateTagsInputReturn<V>) => void;
  /**
   * `dir` on the wrapper element. A test that flips the keymap to `"rtl"` sets this too, otherwise
   * `createTextDirectionWarning` legitimately warns that the keys and the layout disagree.
   */
  dir?: "ltr" | "rtl";
  // `data-testid` is spelled out because Solid's `HTMLAttributes` accepts arbitrary `data-*` only
  // through JSX, not in a plain object literal.
  controlProps?: JSX.HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  listProps?: JSX.HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  itemProps?: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { "data-testid"?: string };
  textProps?: JSX.HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  deleteProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string };
  inputProps?: Omit<CreateTagsInputInputProps, "ref"> & { "data-testid"?: string };
  clearProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string };
  /** Render `.Clear`. Off by default so the chip-row tests keep the DOM they were written against. */
  withClear?: boolean;
}

/** The `<svg>` every icon-only button in this harness renders — see the note in `TagsInputRow`. */
function IconPlaceholder(): JSX.Element {
  // A placeholder rather than a "✕" character, for the same reason `Combobox.Clear` renders `XIcon`:
  // axe reports a text node of symbol-only content as an undecidable `color-contrast` result
  // ("Element content contains only non-text characters"), which would bury every real finding in
  // these files behind an allowlist. Each button's name comes from ARIA, never from what is inside it.
  return <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" />;
}

/** The whole widget: the bordered shell, the chip row, the text field, and optionally clear-all. */
export function TagsInputRow<V>(props: TagsInputRowProps<V>): JSX.Element {
  const state = createTagsInput<V>(props.options);
  props.onReady?.(state);
  const control = createTagsInputControl<V>(state, props.controlProps);
  const list = createTagsInputList<V>(state, { "aria-label": "Tags", ...props.listProps });
  const input = createTagsInputInput<V>(state, {
    "aria-label": "Add a tag",
    ...props.inputProps,
  });
  const clear = createTagsInputClear<V>(state, props.clearProps);

  return (
    <div dir={props.dir}>
      <div {...control.props}>
        <div ref={list.setRef} {...list.props}>
          <For each={state.value()}>
            {(tag) => {
              const [ref, setRef] = createSignal<HTMLDivElement>();
              const item = createTagsInputItem<V>(state, { ...props.itemProps, ref, item: tag });
              const text = createTagsInputItemText<V>(state, { ...props.textProps, item: tag });
              const remove = createTagsInputItemDelete<V>(state, {
                ...props.deleteProps,
                item: tag,
              });
              return (
                <div ref={setRef} {...item.props}>
                  <span {...text.props}>{text.label()}</span>
                  <button ref={remove.setRef} {...remove.props}>
                    <IconPlaceholder />
                  </button>
                </div>
              );
            }}
          </For>
        </div>
        <input ref={input.setRef} {...input.props} />
        <Show when={props.withClear}>
          <button ref={clear.setRef} {...clear.props} data-testid="clear">
            <IconPlaceholder />
          </button>
        </Show>
      </div>
    </div>
  );
}

// ─── Queries ──────────────────────────────────────────────────────────────────────────────────

export function row(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="toolbar"]') as HTMLElement;
}
/** The bordered shell — the element `createTagsInputControl`'s props are spread onto. */
export function control(container: HTMLElement): HTMLElement {
  return row(container).parentElement as HTMLElement;
}
export function clearButton(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('[data-testid="clear"]') as HTMLButtonElement;
}
export function chips(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="group"]')];
}
export function chipLabels(container: HTMLElement): string[] {
  return chips(container).map((chip) => chip.getAttribute("aria-label") ?? "");
}
export function activeLabels(container: HTMLElement): string[] {
  return chips(container)
    .filter((chip) => chip.hasAttribute("data-active"))
    .map((chip) => chip.getAttribute("aria-label") ?? "");
}
export function deleteButtons(container: HTMLElement): HTMLButtonElement[] {
  return [...container.querySelectorAll<HTMLButtonElement>('[role="group"] button')];
}
export function field(container: HTMLElement): HTMLInputElement {
  return container.querySelector("input") as HTMLInputElement;
}
/** The label of the chip DOM focus currently sits on, or `null`. */
export function focusedChipLabel(container: HTMLElement): string | null {
  const active = container.ownerDocument.activeElement;
  const chip = chips(container).find((candidate) => candidate === active);
  return chip?.getAttribute("aria-label") ?? null;
}

/**
 * The row's markup with the collection's generated ids swapped for stable ones, so the `D1` shape
 * can be pinned by an inline snapshot. The real ids are `cl-<n>-<index>` in the client build, where
 * `<n>` is a module-level counter shared across every test file on the page — deterministic within a
 * run, meaningless across one.
 */
export function serializeRow(container: HTMLElement): string {
  return row(container)
    .outerHTML.replace(/\bcl-\d+-(\d+)/g, "chip-$1")
    .replaceAll("><", ">\n<");
}

/**
 * Types into the field the way a user does, but **in one tick**: a `value` write through the native
 * setter plus one `input` event. `userEvent.keyboard` is slow enough that a multi-character draft
 * arrives as several independent renders, which turns every assertion about the committed tag into a
 * sequence rather than a result. The real per-keystroke path is pinned by the delimiter-key tests.
 */
export function typeInto(input: HTMLInputElement, text: string): void {
  input.focus();
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set as (
    this: HTMLInputElement,
    value: string,
  ) => void;
  setter.call(input, text);
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

/** A keydown the browser reports as auto-repeat, which `userEvent` has no way to produce. */
export function pressWithRepeat(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, repeat: true, bubbles: true }));
}

/**
 * A keydown carrying the **legacy** `keyCode`, which no `KeyboardEventInit` type declares and
 * `userEvent` never sets. `keyCode === 229` is how Safari and older WebKit report a key consumed by
 * an IME, and `D5`'s guard checks it as a second channel beside `isComposing()`.
 */
export function pressWithKeyCode(element: HTMLElement, key: string, keyCode: number): boolean {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...({ keyCode } as KeyboardEventInit),
  });
  element.dispatchEvent(event);
  return event.defaultPrevented;
}

/**
 * Put `text` in the field as an in-progress IME candidate: `compositionstart`, then an `input` event
 * with the candidate already in the DOM. `createTextInput` reports `isComposing()` from these, and
 * writes nothing back while they are open — see `create-text-input.md`.
 */
export function startComposition(input: HTMLInputElement, text: string): void {
  input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
  input.value = text;
  input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, isComposing: true }));
}

/** Confirm the candidate — the keypress a CJK user ends a composition with is `Enter`. */
export function endComposition(input: HTMLInputElement): void {
  input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: input.value }));
}

/** A real `paste` event carrying text, which `userEvent` cannot synthesize without a real clipboard. */
export function pasteText(input: HTMLInputElement, text: string): void {
  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", text);
  input.dispatchEvent(
    new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }),
  );
}
