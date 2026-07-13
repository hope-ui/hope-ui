import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, onCleanup } from "solid-js";
import { createKeyboardHandler } from "../../utils/keymap/keymap";
import type { CreateListFocusReturn } from "../list-focus/list-focus";

export interface CreateListTypeaheadOptions<V = unknown> {
  /** The shared focus instance this typeahead drives. */
  focus: CreateListFocusReturn<V>;
  /** Milliseconds of inactivity before the buffer resets. Default `500`. Reactive. */
  delay?: Accessor<number>;
}

export interface CreateListTypeaheadReturn {
  /**
   * Feed one printable character. Extends the buffer (or resets it if the delay elapsed) and moves
   * focus to the best-matching item. A leading space is ignored, so Space stays available for
   * selection until a search is already in progress.
   */
  search(char: string): void;
  /** Whether a typeahead buffer is currently active (used to suppress selection-follows-focus). */
  isTyping: Accessor<boolean>;
  /** An `onKeyDown` handler that routes printable characters to `search`. */
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
}

/**
 * Type-to-focus over the list's items, layered on a [`createListFocus`](../list-focus/list-focus.md)
 * instance. Buffers characters, resets after a delay, and matches item `textValue`s
 * case-insensitively — moving the active item through `focus.focusIndex`, so a match in an unmounted
 * virtualized row scrolls in and focuses just like navigation. Modeled on Angular Aria's
 * `list-typeahead` and Angular CDK's standalone `typeahead`; the matching rules (start point,
 * repeated-letter cycling, leading-space handling) follow react-aria's `useTypeSelect`.
 *
 * Matching:
 * - **Extend** — typing distinct characters ("b", then "a") searches the full buffer ("ba") from the
 *   current item, so a longer prefix refines toward one item.
 * - **Cycle** — repeating the same character ("b", "b") searches that single letter starting *after*
 *   the current item, stepping through every item beginning with it.
 * - Search wraps around the end of the list and skips items `focus.isFocusable` rejects.
 */
export function createListTypeahead<V = unknown>(
  options: CreateListTypeaheadOptions<V>,
): CreateListTypeaheadReturn {
  const { focus } = options;
  const delay = () => options.delay?.() ?? 500;

  const [isTyping, setIsTyping] = createSignal(false);
  let buffer = "";
  let lastTime = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(timeout));

  /** First focusable item whose `textValue` starts with `query`, scanning from `start`, wrapping. */
  const matchFrom = (query: string, start: number): number => {
    const items = focus.items();
    const length = items.length;
    if (length === 0) return -1;
    const lower = query.toLowerCase();
    const from = start < 0 ? 0 : start % length;
    for (let offset = 0; offset < length; offset++) {
      const index = (from + offset) % length;
      const item = items[index];
      if (item && focus.isFocusable(item) && item.textValue().toLowerCase().startsWith(lower)) {
        return index;
      }
    }
    return -1;
  };

  const search = (char: string) => {
    // A leading space never starts a search — Space belongs to selection until a query is going.
    if (char === " " && buffer === "") return;

    const now = Date.now();
    if (now - lastTime > delay()) buffer = "";
    lastTime = now;
    buffer += char;

    clearTimeout(timeout);
    setIsTyping(true);

    const current = focus.activeIndex();
    const repeated = buffer.length > 1 && [...buffer].every((character) => character === buffer[0]);

    let index: number;
    if (repeated) {
      // Same letter repeated → cycle: match one letter, starting after the current item.
      index = matchFrom(buffer.charAt(0), current + 1);
    } else if (buffer.length === 1) {
      // First press of a letter → move to the next item beginning with it.
      index = matchFrom(buffer, current + 1);
    } else {
      // Extending a distinct query → match the whole buffer from the current item.
      index = matchFrom(buffer, current < 0 ? 0 : current);
    }

    if (index >= 0) focus.focusIndex(index);

    timeout = setTimeout(() => {
      buffer = "";
      setIsTyping(false);
    }, delay());
  };

  const keys = createKeyboardHandler<HTMLElement>().onText((char) => search(char));

  return { search, isTyping, onKeyDown: keys.onKeyDown };
}
