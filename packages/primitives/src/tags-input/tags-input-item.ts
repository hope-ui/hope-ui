import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge, omit, untrack } from "solid-js";
import { composeEventHandlers, createKeyboardHandler } from "../utils";
import type { CreateTagsInputReturn } from "./tags-input-root";

/**
 * Where one chip sits, and the three ids inside it. Every id is derived from the **collection's**
 * generated id for that tag, so `.ItemText` and `.ItemDelete` can point at each other without a
 * per-chip context and without an `index` prop on the public API.
 */
export interface TagsInputItemHandle {
  /** This chip's index into `state.indexed.items()`, or `-1` while the tag is not in the list. */
  index: Accessor<number>;
  /** The chip's own id. */
  id: Accessor<string | undefined>;
  /** `.ItemText`'s id — the second half of the ✕'s `aria-labelledby` pair. */
  textId: Accessor<string | undefined>;
  /** The ✕'s own id — the first half of that pair, which is what makes it read *"Remove Apple"*. */
  deleteId: Accessor<string | undefined>;
}

/**
 * Resolve a chip's position and ids from the tag it renders. All four parts of a chip call this with
 * the same `item`, which is what keeps the id scheme in one place: a suffix convention spread across
 * three files would break the ✕'s label the first time one of them drifted.
 *
 * The index comes from `indexOfValue`, a `Map` rebuilt with the tag array — so it costs O(1) per
 * read and O(n) per data change, not per render.
 */
export function resolveTagsInputItem<V = string>(
  state: CreateTagsInputReturn<V>,
  item: Accessor<V>,
): TagsInputItemHandle {
  const index = () => state.indexOfValue(state.itemToValue(item()));
  const id = () => state.indexed.items()[index()]?.id;
  const derive = (suffix: string) => () => {
    const base = id();
    return base === undefined ? undefined : `${base}-${suffix}`;
  };
  return { index, id, textId: derive("text"), deleteId: derive("delete") };
}

export interface CreateTagsInputItemProps<V = string> extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * The chip's element as a **real signal accessor** (not a closure over a plain `let`): the element
   * is created as a reactive consequence of the chip rendering, so an untracked read would catch it
   * still `undefined`. The consumer still wires `ref={setRef}` on the element itself.
   */
  ref: Accessor<HTMLElement | null | undefined>;
  /** The tag this chip renders — one element of `state.value()`. The hook resolves its position from
   *  it, which is why there is no `index` prop. */
  item: V;
}

export interface CreateTagsInputItemReturn {
  /** Spread onto the chip element (`role="group"` + ARIA + `data-*` state + `tabindex` + handlers).
   *  `ref` is omitted so the consumer sets it on whatever element it renders. */
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-active"?: string;
    "data-disabled"?: string;
    "data-duplicate"?: string;
  };
  /** Whether this chip is the active one **and** the widget holds focus. */
  isActive: Accessor<boolean>;
  /** Whether this chip is disabled: neither removable nor navigable. */
  isDisabled: Accessor<boolean>;
  /** Whether this chip is the one a rejected duplicate collided with (`D4`'s flash). */
  isDuplicate: Accessor<boolean>;
  /** The chip's display text — `itemToLabel`, else `itemToValue`. Also its accessible name. */
  label: Accessor<string>;
}

/**
 * The chip part: one removable tag. It publishes its element into the tag collection, names itself
 * from its own text, and owns the chip half of the keyboard map.
 *
 * ## Always `tabindex="-1"` (`D2`)
 *
 * The text field is the widget's single tab stop, so `state.focus.getItemTabIndex()` is deliberately
 * **never consulted** — Tab has to cross the whole control in one press. The focus instance is still
 * used for everything else it owns: which chip is active, the deferred `.focus()` behind a move, and
 * the re-homing that survives a removal.
 *
 * ## Arrowing past either end returns to the field
 *
 * Navigation is created with `wrap: false`, so `peekNext()` / `peekPrev()` answer `-1` at the ends —
 * that is the signal to call `state.focusInput()` instead of moving. **Peeking rather than moving and
 * reading back** is load-bearing: a Solid 2.0 signal write is invisible to a plain read until the
 * next flush, so `navigation.next()` followed by `focus.activeIndex()` would report the old chip.
 *
 * ## Removal, and which of the two focus paths runs (`D10`)
 *
 * Backspace/Delete here just call `removeAt`, and `createListFocus`'s re-homing effect moves focus to
 * the surviving neighbor — inherited, not re-derived. The one case it cannot answer is *no* survivor
 * (the last chip, or nothing but disabled chips left), where focus would otherwise fall to `<body>`;
 * that is peeked for **before** the removal and sent to the field. The pointer path is the opposite
 * shape and lives in `tags-input-item-delete.ts`.
 */
export function createTagsInputItem<V = string>(
  state: CreateTagsInputReturn<V>,
  props: CreateTagsInputItemProps<V>,
): CreateTagsInputItemReturn {
  const handle = resolveTagsInputItem(state, () => props.item);
  const { focus, navigation } = state;

  // Publish this chip's element under its index — that is what `createListFocus` focuses when
  // navigation moves, and what the re-homing effect hands focus to after a removal. The index is
  // tracked in the `compute` rather than read in the body: it is a memo read, and reading it in the
  // body is an untracked read of reactive state (`[STRICT_READ_UNTRACKED]`, which the test harness
  // fails on). Tracking it is also what re-registers a chip under its new index when a tag ahead of
  // it is removed.
  createEffect(
    () => [handle.index(), props.ref()] as const,
    ([at, element]) => {
      // A transient `-1` is the **normal** removal frame, not a mistake: the tag leaves the array
      // before `<For>` disposes the row. So there is nothing to warn about here, unlike
      // `createListboxItem`, whose rows are authored against a separate `items` array.
      if (at < 0 || !element) {
        return;
      }
      state.indexed.registerElement(at, element);
      // Retire by **element**, never by the index this run registered under: a removal re-runs every
      // chip after it, so by the time this teardown fires another chip may already own `at`.
      return () => state.indexed.unregisterElement(element);
    },
  );

  const collectionItem = () => state.indexed.items()[handle.index()];
  const label = () => state.itemToLabel?.(props.item) ?? state.itemToValue(props.item);
  const isDisabled = () => state.isItemDisabled(props.item);
  const isDuplicate = () => state.isDuplicate(props.item);
  // "Highlighted" means the active chip **and** the widget holds focus, so the highlight cannot
  // linger after focus leaves the control. `.List` drives the focus half.
  const isActive = () => {
    const item = collectionItem();
    return item ? focus.isActive(item) && focus.isFocused() : false;
  };

  const moveTo = (target: number) => {
    if (target < 0) {
      state.focusInput();
      return;
    }
    focus.focusIndex(target);
  };

  const isRtl = () => state.direction() === "rtl";
  // Left/Right are mirrored here rather than delegated to `navigation.onKeyDown`, because that
  // handler wraps or stops at the ends and has no way to redirect into the text field.
  const moveTowardEnd = () => moveTo(navigation.peekNext());
  const moveTowardStart = () => moveTo(navigation.peekPrev());

  const removeThis = () => {
    if (!state.isInteractive() || isDisabled()) {
      return;
    }
    // Peeked **before** the removal, because after it this chip's index no longer exists. `peek`
    // skips disabled chips on exactly the terms the re-homing effect does, so the two agree on
    // whether anything focusable survives.
    const hasSurvivor = navigation.peekNext() >= 0 || navigation.peekPrev() >= 0;
    state.removeAt(handle.index());
    if (!hasSurvivor) {
      state.focusInput();
    }
  };

  const keys = createKeyboardHandler<HTMLElement>()
    // No `event.repeat` guard, deliberately: holding Backspace to clear a row of chips is a real
    // gesture, and filtering repeats would break it with nothing to show for it. React Aria spells
    // the same thing `allowRepeats: true`.
    .on(["Backspace", "Delete"], (event) => {
      event.preventDefault();
      removeThis();
    })
    .on("ArrowRight", (event) => {
      event.preventDefault();
      isRtl() ? moveTowardStart() : moveTowardEnd();
    })
    .on("ArrowLeft", (event) => {
      event.preventDefault();
      isRtl() ? moveTowardEnd() : moveTowardStart();
    })
    // Home/End are logical, not directional, so they do **not** swap under RTL.
    .on("Home", (event) => {
      event.preventDefault();
      navigation.first();
    })
    .on("End", (event) => {
      event.preventDefault();
      navigation.last();
    })
    .on("Enter", (event) => {
      // Neither commits nor submits: there is no draft text behind a focused chip, and the form must
      // not receive an Enter the user aimed at a chip.
      event.preventDefault();
      state.focusInput();
    })
    .on("Escape", () => {
      // No `preventDefault`, on purpose. Escape has one meaning across this whole widget — it reaches
      // an enclosing Dialog, the line `createComboboxInput` already draws — so a chip returns focus
      // to the field *and* lets the key travel, rather than making Escape-from-a-chip behave
      // differently from Escape-from-the-field.
      state.focusInput();
    })
    // A printable key hands focus back to the field and lets the character type itself there: focus
    // moves during `keydown`, so the browser dispatches the text insertion to the newly focused
    // element. Not calling `preventDefault` is what makes that work.
    .onText(() => {
      state.focusInput();
    });

  const rest = omit(props, "ref", "item", "onFocus", "onKeyDown");

  const elementProps = merge(rest, {
    get id() {
      return props.id ?? handle.id();
    },
    get role() {
      return "group" as const;
    },
    get "aria-label"() {
      return props["aria-label"] ?? label();
    },
    get "aria-disabled"() {
      return isDisabled() ? ("true" as const) : undefined;
    },
    get "data-active"() {
      return isActive() ? "" : undefined;
    },
    get "data-disabled"() {
      return isDisabled() ? "" : undefined;
    },
    get "data-duplicate"() {
      return isDuplicate() ? "" : undefined;
    },
    // `D2`, and the one place this family diverges from every other collection row: the tab index is
    // a constant, never `focus.getItemTabIndex()`. Not forwardable — a consumer's `0` would put every
    // chip in the tab order and cost one Tab press per tag.
    get tabindex() {
      return -1;
    },
    get onFocus() {
      return composeEventHandlers<HTMLElement, FocusEvent>(props.onFocus, () => {
        // `untrack` the whole body: `createListFocus` moves DOM focus from inside its own effect,
        // which dispatches `focus` synchronously, so every read here would otherwise become a
        // dependency of that effect. Solid's `onFocus` binds the non-bubbling native event, so the ✕
        // inside the chip cannot reach this handler.
        untrack(() => {
          if (isDisabled()) {
            return;
          }
          focus.focusIndex(handle.index());
        });
      });
    },
    get onKeyDown() {
      return composeEventHandlers<HTMLElement, KeyboardEvent>(props.onKeyDown, keys.onKeyDown);
    },
  });

  return { props: elementProps, isActive, isDisabled, isDuplicate, label };
}
