import type { JSX } from "@solidjs/web";
import type { EventHandlerEvent } from "../events/events";

/** A keyboard event as a Solid JSX handler receives it, with `currentTarget` narrowed to `T`. */
export type KeyboardEventFor<T> = EventHandlerEvent<T, KeyboardEvent>;

interface Binding<T> {
  /** The event `key` this binding matches, normalized (single letters lowercased). */
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  handler: (event: KeyboardEventFor<T>) => void;
}

/**
 * Fluent, modifier-aware keymap builder — the declarative counterpart to the imperative `switch
 * (event.key)` every collection component would otherwise hand-roll. Modeled on Angular Aria's
 * `private/behaviors/event-manager` (its idea, not its code).
 *
 * ```ts
 * const keys = createKeyboardHandler<HTMLUListElement>()
 *   .on("ArrowDown", (e) => { e.preventDefault(); navigation.next(); })
 *   .on("ArrowUp", (e) => { e.preventDefault(); navigation.prev(); })
 *   .on(["Enter", " "], () => selection.toggleActive())
 *   .on("mod+a", (e) => { e.preventDefault(); selection.selectAll(); })
 *   .onText((char) => typeahead.search(char));
 *
 * <ul onKeyDown={keys.onKeyDown}>…</ul>
 * ```
 *
 * It **complements** `composeEventHandlers`: compose the consumer's `onKeyDown` in front of
 * `keys.onKeyDown` so their `preventDefault()` still cancels the whole map.
 */
export interface KeyboardHandler<T> {
  /**
   * Bind a handler to a key combo — a `KeyboardEvent.key` value optionally prefixed with
   * `+`-joined modifiers (`"mod+a"`, `"shift+Home"`). Pass an array to bind several keys to one
   * handler (`["Enter", " "]`). Modifiers: `mod` (⌘ on Apple platforms, Ctrl elsewhere), `ctrl`,
   * `meta`/`cmd`, `alt`/`option`, `shift`. Modifier state must match **exactly**, so `"ArrowDown"`
   * does not fire for `Shift+ArrowDown`, and `"a"` is distinct from `"mod+a"`. Single letters match
   * case-insensitively; `Space`/`Esc` alias `" "`/`Escape`.
   */
  on(combo: string | string[], handler: (event: KeyboardEventFor<T>) => void): KeyboardHandler<T>;
  /**
   * Fallback for typing a single printable character (typeahead). Fires only when no `on(...)`
   * binding matched, the key is one character long, and neither Ctrl nor Meta is held (Shift/Alt
   * are allowed, so capitals and accented characters still type).
   */
  onText(handler: (char: string, event: KeyboardEventFor<T>) => void): KeyboardHandler<T>;
  /** The composed `onKeyDown` handler. Stable across the builder's lifetime. */
  onKeyDown: JSX.EventHandler<T, KeyboardEvent>;
}

const KEY_ALIASES: Record<string, string> = {
  space: " ",
  spacebar: " ",
  esc: "Escape",
};

const MODIFIER_TOKENS = new Set([
  "mod",
  "ctrl",
  "control",
  "meta",
  "cmd",
  "command",
  "alt",
  "option",
  "shift",
]);

/** `true` on Apple platforms, where `mod` means ⌘ (Meta) rather than Ctrl. Read at event time. */
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  // `userAgentData.platform` when present (Chromium), else the legacy `platform` string.
  const platform =
    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function normalizeKey(key: string): string {
  const aliased = KEY_ALIASES[key.toLowerCase()] ?? key;
  return aliased.length === 1 ? aliased.toLowerCase() : aliased;
}

function parseCombo<T>(combo: string, handler: (event: KeyboardEventFor<T>) => void): Binding<T> {
  // Split on the *last* `+`, never on every `+`, and never trim the key segment: the key can
  // itself be a `+` (bind `"+"`) or a space (bind `" "`, which a naive trim would erase into the
  // separator). Everything before the last `+` is the modifier list.
  const splitAt = combo === "+" ? -1 : combo.lastIndexOf("+");
  const rawKey = splitAt <= 0 ? combo : combo.slice(splitAt + 1);
  const modifiers =
    splitAt <= 0
      ? []
      : combo
          .slice(0, splitAt)
          .split("+")
          .map((part) => part.trim().toLowerCase())
          .filter(Boolean);

  const binding: Binding<T> = {
    key: normalizeKey(rawKey),
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
    handler,
  };

  for (const modifier of modifiers) {
    if (!MODIFIER_TOKENS.has(modifier)) {
      continue;
    }
    switch (modifier) {
      case "mod":
        // Resolved once, here at build time. Keymaps are built client-side (a component body or an
        // event handler), where the platform is known and never changes, so this needs no
        // per-event recomputation.
        if (isApplePlatform()) {
          binding.meta = true;
        } else {
          binding.ctrl = true;
        }
        break;
      case "ctrl":
      case "control":
        binding.ctrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        binding.meta = true;
        break;
      case "alt":
      case "option":
        binding.alt = true;
        break;
      case "shift":
        binding.shift = true;
        break;
    }
  }

  return binding;
}

function matches<T>(binding: Binding<T>, event: KeyboardEvent): boolean {
  if (normalizeKey(event.key) !== binding.key) {
    return false;
  }
  // Exact modifier match, so `"ArrowDown"` ignores `Shift+ArrowDown` and `"a"` never fires for
  // `mod+a`. `mod` was already resolved to the platform's ctrl/meta when the binding was parsed.
  return (
    event.ctrlKey === binding.ctrl &&
    event.metaKey === binding.meta &&
    event.altKey === binding.alt &&
    event.shiftKey === binding.shift
  );
}

export function createKeyboardHandler<T = Element>(): KeyboardHandler<T> {
  const bindings: Binding<T>[] = [];
  let textHandler: ((char: string, event: KeyboardEventFor<T>) => void) | undefined;

  const api: KeyboardHandler<T> = {
    on(combo, handler) {
      for (const single of Array.isArray(combo) ? combo : [combo]) {
        bindings.push(parseCombo<T>(single, handler));
      }
      return api;
    },
    onText(handler) {
      textHandler = handler;
      return api;
    },
    onKeyDown(event) {
      for (const binding of bindings) {
        if (matches(binding, event)) {
          binding.handler(event as KeyboardEventFor<T>);
          return;
        }
      }
      if (textHandler && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        textHandler(event.key, event as KeyboardEventFor<T>);
      }
    },
  };

  return api;
}
