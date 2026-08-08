import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import {
  type CreateTagsInputOptions,
  type CreateTagsInputReturn,
  createTagsInput,
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
  listProps?: JSX.HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  itemProps?: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & { "data-testid"?: string };
  textProps?: JSX.HTMLAttributes<HTMLElement> & { "data-testid"?: string };
  deleteProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string };
}

/**
 * The whole chip row plus the text field it hands focus back to. The field is a plain `<input>`
 * registered through `state.setInputElement` — `createTagsInputInput` is Phase 4 — because every
 * `D10` focus path ends there and a row with no field could not show it.
 */
export function TagsInputRow<V>(props: TagsInputRowProps<V>): JSX.Element {
  const state = createTagsInput<V>(props.options);
  props.onReady?.(state);
  const list = createTagsInputList<V>(state, { "aria-label": "Tags", ...props.listProps });

  return (
    <div dir={props.dir}>
      <div ref={list.setRef} {...list.props}>
        <For each={state.value()}>
          {(tag) => {
            const [ref, setRef] = createSignal<HTMLDivElement>();
            const item = createTagsInputItem<V>(state, { ...props.itemProps, ref, item: tag });
            const text = createTagsInputItemText<V>(state, { ...props.textProps, item: tag });
            const remove = createTagsInputItemDelete<V>(state, { ...props.deleteProps, item: tag });
            return (
              <div ref={setRef} {...item.props}>
                <span {...text.props}>{text.label()}</span>
                <button ref={remove.setRef} {...remove.props}>
                  {/* An icon placeholder rather than a "✕" character, for the same reason
                      `Combobox.Clear` renders `XIcon`: axe reports a text node of symbol-only
                      content as an undecidable `color-contrast` result ("Element content contains
                      only non-text characters"), which would bury every real finding in this file
                      behind an allowlist. The button's name comes from `aria-labelledby`, never
                      from what is inside it. */}
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" />
                </button>
              </div>
            );
          }}
        </For>
      </div>
      <input ref={(element) => state.setInputElement(element)} aria-label="Add a tag" />
    </div>
  );
}

// ─── Queries ──────────────────────────────────────────────────────────────────────────────────

export function row(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="toolbar"]') as HTMLElement;
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

/** A keydown the browser reports as auto-repeat, which `userEvent` has no way to produce. */
export function pressWithRepeat(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, repeat: true, bubbles: true }));
}
