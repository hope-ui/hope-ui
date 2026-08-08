import { useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, createUniqueId } from "solid-js";
import {
  type CreateListFocusReturn,
  type CreateListNavigationReturn,
  createControllableState,
  createDataCollection,
  createListFocus,
  createListNavigation,
  createTextDirectionWarning,
  type IndexedItemSource,
  type TextDirection,
} from "../internal";
import { withDefaults } from "../utils";

/** Why an add was refused. Decision `D4` in `__internal__/components/decisions.md`. */
export type TagsInputRejectReason = "duplicate" | "max" | "invalid" | "empty";

export interface TagsInputRejection {
  /** Which rule refused the text. */
  reason: TagsInputRejectReason;
  /**
   * The raw text refused. For `"max"` it is the **whole remainder** — every candidate that did not
   * fit, re-joined by the delimiter — because a paste that overflows is one overflow, not one
   * rejection per tag the user lost.
   */
  text: string;
}

export interface TagsInputAddResult<V = string> {
  /** The tags accepted, in the order they joined the list. Empty when everything was refused. */
  added: readonly V[];
  /**
   * What the text field should now hold. `D4` decides this, not the caller: text refused for
   * `"max"` or `"invalid"` comes back (the user's intent is unmet and they can fix it), while a
   * `"duplicate"` or an `"empty"` is dropped (the value is already on screen, or there was none).
   */
  inputText: string;
  /** Every rejection fired, in order — the same objects `onReject` received. */
  rejections: readonly TagsInputRejection[];
}

/**
 * `D3`: `parse` is optional exactly when a plain `string` is a valid tag, and **required** for any
 * other `V`. The default parser returns `text.trim()`, which is only correct for `V = string`; an
 * object tag with no parser would otherwise get a string silently masquerading as `V`, with no type
 * error and no runtime complaint until something read a property off it.
 */
export type TagsInputParseOption<V> = string extends V
  ? { parse?: (text: string) => V | null }
  : { parse: (text: string) => V | null };

export interface CreateTagsInputBaseOptions<V = string> {
  /** Controlled tag list. Omit for uncontrolled use via `defaultValue`. For reactive control pass a
   *  getter (`get value() { return signal(); }`), exactly as a component prop would. */
  value?: V[];
  /** Initial tag list, uncontrolled. Default `[]`. */
  defaultValue?: V[];
  /** Called on every change with the new tag list. */
  onChange?: (value: V[]) => void;

  /**
   * Maps a tag to its primitive **value** — the duplicate identity, the string a form submits, and
   * the key a chip resolves its own index by ({@link CreateTagsInputReturn.indexOfValue}). **Not**
   * the chip's DOM `id`: the collection generates those itself. Must be unique per tag.
   * Default `(item) => String(item)`.
   */
  itemToValue?: (item: V) => string;
  /** Maps a tag to its display text. Defaults to `itemToValue`. */
  itemToLabel?: (item: V) => string;
  /** Whether a tag is disabled: not removable, and skipped by arrow navigation. Default `false`. */
  isItemDisabled?: (item: V) => boolean;
  /**
   * Full override of duplicate equality. Default `(a, b) => itemToValue(a) === itemToValue(b)`,
   * which is **literal** — `"Apple"` and `"apple"` are two tags, because folding two distinct email
   * addresses into one is a bug (`D4`). This is the seam to change that.
   */
  isItemEqualToValue?: (a: V, b: V) => boolean;

  /**
   * Turns one candidate text into a tag, or `null` to refuse it as `"invalid"`. It is the **single**
   * normalization seam (`D4`) — it runs on typing, on a delimiter commit and on paste alike, so
   * there is no second `sanitize` prop to drift out of step with it.
   *
   * Default `(text) => text.trim()`, correct for `V = string`; see {@link TagsInputParseOption} for
   * why any other `V` must supply one.
   */
  parse?: (text: string) => V | null;
  /**
   * The character a pasted or typed run is split on before parsing, and the one the `"max"`
   * remainder is re-joined with. Default `","`.
   *
   * It lives on the root rather than on the input part because `D4` makes it *policy*: the overflow
   * remainder is one joined string, so the code that decides what did not fit is the code that has
   * to join it. The input part reads it back to split.
   */
  delimiter?: string;
  /** The most tags the list may hold. Unlimited by default. A paste past it **partially accepts**
   *  up to the limit and hands the remainder back to the field (`D4`). */
  max?: number;
  /** Called for every refused add. The only channel that can say *why* an Enter did nothing. */
  onReject?: (rejection: TagsInputRejection) => void;

  /**
   * Reading direction. Defaults to `useLocale()` (the `I18nProvider` / browser locale). Feeds the
   * horizontal arrow flip: under `"rtl"`, ArrowLeft moves toward the *next* chip.
   *
   * Behavior only — never written to the DOM, so the layout keeps following the CSS cascade. If you
   * render the element yourself, set `dir` on it too. Why the locale-derived value is deliberately
   * not written for you, plus the dev warning that catches a mismatch:
   * `../internal/create-text-direction-warning.ts`.
   */
  dir?: TextDirection;

  /** Whether the whole widget is disabled: nothing is added, removed or navigable. Default `false`. */
  disabled?: boolean;
  /** Whether the widget refuses every mutation while staying focusable. Default `false`. */
  readOnly?: boolean;
  /** Marks the field required for native validation. Default `false`. */
  required?: boolean;
  /** Marks the field invalid. Default `false`. Feeds `aria-invalid` unless one is passed. */
  invalid?: boolean;
  /** Explicit `aria-invalid`, winning over `invalid` — one of the `D7` pass-throughs. */
  "aria-invalid"?: JSX.AriaAttributes["aria-invalid"];
  /** Explicit `aria-describedby` — one of the `D7` pass-throughs. */
  "aria-describedby"?: string;

  /** Explicit widget id. Defaults to a generated, SSR-stable `createUniqueId()`. */
  id?: string;
}

/**
 * The options `createTagsInput` takes: {@link CreateTagsInputBaseOptions} plus `D3`'s conditional
 * `parse` requirement. The two are intersected rather than written as one top-level conditional so
 * that `V` can still be **inferred** from `value`/`defaultValue` — TypeScript infers nothing from a
 * parameter whose whole type is a deferred conditional.
 */
export type CreateTagsInputOptions<V = string> = CreateTagsInputBaseOptions<V> &
  TagsInputParseOption<V>;

export interface CreateTagsInputReturn<V = string> {
  /** The resolved widget id (consumer's, else generated). Parts derive their own ids from it. */
  id: Accessor<string>;

  /** The tags, in order. */
  value: Accessor<V[]>;
  /**
   * Replace the whole tag list in **one** write, bypassing every `D4` rule. This is the escape
   * hatch for a tag the policy cannot express (one containing the delimiter, say) and the shape a
   * form reset needs. It has to be one write: a Solid 2.0 signal write is invisible to a plain read
   * until the next flush, so N × `add` would each read the pre-write list.
   */
  setValue: (value: V[]) => void;

  /**
   * The item source. Chips are 1:1 with the tag array and always mounted, so the tags **are** the
   * data — a chip publishes its element with `indexed.registerElement(index, element)` and reads
   * its own id off `indexed.items()[index].id`.
   */
  indexed: IndexedItemSource<V>;
  /**
   * The index of the tag whose `itemToValue` is `value`, or `-1`. This is how a chip resolves its
   * own position from the item it was handed, so there is no `index` prop on the public API.
   */
  indexOfValue: (value: string) => number;

  /** The shared focus instance — the active chip, and the deferred `.focus()` behind it. */
  focus: CreateListFocusReturn<V>;
  /** Horizontal, non-wrapping arrow navigation over the chips. */
  navigation: CreateListNavigationReturn;

  /**
   * Split `text` on the delimiter, parse each part and add what passes, applying every `D4` rule.
   * The one entry point: Enter, a delimiter keypress, a paste and a blur commit all funnel here, so
   * none of them can drift from the policy.
   */
  add: (text: string) => TagsInputAddResult<V>;
  /** Remove the tag at `index`. No-op for a disabled tag, or while disabled/read-only. */
  removeAt: (index: number) => void;
  /** Remove the tag equal to `item` (by `isItemEqualToValue`). */
  remove: (item: V) => void;
  /** Remove the last tag — Backspace on an empty input. No-op when that tag is disabled. */
  removeLast: () => void;
  /** Remove every removable tag. Disabled tags survive, since they are not individually removable. */
  clear: () => void;

  /** The resolved value mapper (never undefined). */
  itemToValue: (item: V) => string;
  /** The label mapper, or `undefined` (the collection then falls back to `itemToValue`). */
  itemToLabel?: (item: V) => string;
  /** The resolved disabled predicate. */
  isItemDisabled: (item: V) => boolean;
  /** The resolved equality rule — what "duplicate" means for this instance. */
  isItemEqualToValue: (a: V, b: V) => boolean;

  /** The tag limit, or `undefined`. */
  max: Accessor<number | undefined>;
  /** Whether the list is at `max`. */
  isFull: Accessor<boolean>;
  /** The split/join character. The input part reads it to split what the user types and pastes. */
  delimiter: Accessor<string>;

  /**
   * The `itemToValue` of the chip currently flashing `data-duplicate`, or `undefined`. Held as the
   * value **string** rather than the tag itself: `createSignal` treats a function-valued argument as
   * a compute function under Solid 2.0, and `V` is unconstrained.
   */
  duplicateValue: Accessor<string | undefined>;
  /** Whether `item` is the chip a rejected duplicate collided with. */
  isDuplicate: (item: V) => boolean;
  /** Clear the duplicate flash. The input part calls it on every `input` event (`D4`). */
  clearDuplicate: () => void;

  /** Whether the whole widget is disabled. */
  disabled: Accessor<boolean>;
  /** Whether the widget is read-only. */
  readOnly: Accessor<boolean>;
  /** Whether the field is required. */
  required: Accessor<boolean>;
  /** Whether the field is marked invalid. */
  invalid: Accessor<boolean>;
  /** The resolved `aria-invalid`: the consumer's, else `"true"` while `invalid`, else `undefined`. */
  ariaInvalid: Accessor<JSX.AriaAttributes["aria-invalid"]>;
  /** The consumer's `aria-describedby`, passed through untouched (`D7`). */
  ariaDescribedBy: Accessor<string | undefined>;
  /** Whether the widget accepts mutations at all: neither disabled nor read-only. */
  isInteractive: Accessor<boolean>;

  /** The direction the horizontal keymap mirrors against. Never written to the DOM. */
  direction: Accessor<TextDirection>;

  /** Register the chip-row container: the collection's scroll container and the focus owner's element. */
  setListElement: (element: HTMLElement | null | undefined) => void;
  /**
   * The registered chip-row container. Read by the two parts that have to decide whether focus is
   * still *inside the widget*: the row asks it about the field, and the field asks it about the row.
   * Neither can see the other's boundary on its own — see `tags-input-input.md` § Focus-within.
   */
  listElement: Accessor<HTMLElement | null | undefined>;
  /** The registered text field. */
  inputElement: Accessor<HTMLElement | undefined>;
  /** Register the text field. */
  setInputElement: (element: HTMLElement | undefined) => void;
  /**
   * Drop the chip highlight, then return DOM focus to the text field. Both halves matter and the
   * order is load-bearing — see `__internal__/primitives/tags-input/tags-input-root.md` (`D10`).
   */
  focusInput: () => void;
}

/**
 * A tags input's shared state: called **once** at the root of the tree, inside a reactive owner
 * scope (a component body, or a `createRoot`). It renders **no JSX and no host element** — it holds
 * the tag array, wires the `internal/` list primitives together (data collection + focus +
 * horizontal navigation), and owns the whole text→tag policy. The part hooks
 * (`createTagsInputItem`, `createTagsInputInput`, …) each take this state plus their own props.
 *
 * ## The tags are the data
 *
 * There is no separate item list: chips are 1:1 with `value()` and always mounted, so
 * `createDataCollection` reads the tag array directly and a chip resolves its own index through
 * {@link CreateTagsInputReturn.indexOfValue}. That is also why there is no `createTagsState`
 * primitive — the array is a `createControllableState`, and add / remove / dedupe are policy over
 * it rather than a state machine.
 *
 * ## One entry point for text
 *
 * Every path that turns text into tags — Enter, a delimiter keypress, a paste, a blur commit —
 * calls {@link CreateTagsInputReturn.add}. It splits, parses, dedupes and enforces `max` in one
 * place, reports each refusal through `onReject`, and hands back the text the field should keep.
 * A caller that reimplemented any of those would drift from the rest.
 *
 * Decisions `D3` (generic `V` + conditional `parse`), `D4` (`max` / duplicates / normalization) and
 * `D7` (the field pass-throughs) are recorded in `__internal__/components/decisions.md`; the
 * behavior rationale is in `__internal__/primitives/tags-input/tags-input-root.md`.
 */
export function createTagsInput<V = string>(
  options: CreateTagsInputOptions<V>,
): CreateTagsInputReturn<V> {
  // `D3`'s conditional only constrains the **call site**. Every shape it allows is the same object
  // here, and widening to the base drops the deferred conditional the compiler cannot see through.
  const base: CreateTagsInputBaseOptions<V> = options;

  // `withDefaults`, not Solid's `merge`: `merge` resolves keys by *presence*, so a wrapper
  // forwarding an unset prop (present, value `undefined`) would beat the default. `withDefaults`
  // resolves with `??`, which is what makes it the only correct way to apply defaults under 2.0.
  const merged = withDefaults(base, {
    itemToValue: ((item: V) => String(item)) as (item: V) => string,
    // The `unknown` hop is the whole point of `D3`: a trimmed string is only a valid `V` when `V`
    // *is* string-like, which is exactly the case the conditional leaves `parse` optional for.
    parse: ((text: string) => text.trim() as unknown as V) as (text: string) => V | null,
    delimiter: ",",
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
  });

  const generatedId = createUniqueId();
  const id = () => merged.id ?? generatedId;

  const itemToValue = (item: V) => merged.itemToValue(item);
  const itemToLabel = merged.itemToLabel;
  const isItemDisabled = (item: V) => merged.isItemDisabled?.(item) ?? false;
  const isItemEqualToValue = (a: V, b: V) =>
    merged.isItemEqualToValue?.(a, b) ?? itemToValue(a) === itemToValue(b);

  const disabled = () => merged.disabled;
  const readOnly = () => merged.readOnly;
  const required = () => merged.required;
  const invalid = () => merged.invalid;
  const isInteractive = () => !disabled() && !readOnly();
  // `D7`: the consumer's value wins, and the computed one is only a fallback. Writing it the other
  // way round (an internal getter last in a `merge`) erases a consumer's attribute whenever the
  // getter happens to return `undefined`.
  const ariaInvalid = () => base["aria-invalid"] ?? (invalid() ? ("true" as const) : undefined);
  const ariaDescribedBy = () => base["aria-describedby"];

  const delimiter = () => merged.delimiter;
  const max = () => merged.max;

  const [tags, setTags] = createControllableState<V[]>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue ?? [],
    onChange: (value) => merged.onChange?.(value),
  });

  const isFull = () => {
    const limit = max();
    return limit !== undefined && tags().length >= limit;
  };

  const [listElement, setListElement] = createSignal<HTMLElement | null>();
  const [inputElement, setInputElement] = createSignal<HTMLElement>();
  const [duplicateValue, setDuplicateValue] = createSignal<string | undefined>();

  const i18n = useLocale();
  const direction = () => merged.dir ?? i18n.direction();

  // No `active` gate, unlike Listbox's (which is `orientation === "horizontal"`): a chip row is
  // always horizontal, so a mismatch between the locale the keymap mirrors against and the
  // direction the browser lays the row out in is always observable.
  createTextDirectionWarning({ name: "TagsInput", direction, element: listElement });

  const collection = createDataCollection<V>({
    items: tags,
    itemToValue,
    itemToLabel,
    isItemDisabled: merged.isItemDisabled,
    scrollElement: listElement,
  });

  const focus = createListFocus<V>({
    source: collection,
    // Explicit, though it is also the default: `D2` depends on it. The active chip takes real DOM
    // focus, which is what lets ArrowLeft from the field land on a chip — but its tab index comes
    // from the part hook, which never consults `focus.getItemTabIndex()`, because the text field is
    // the widget's single tab stop.
    focusMode: () => "roving",
    disabled,
    element: listElement,
    // The same mapper the duplicate check uses, so the highlight survives the tag array being
    // rebuilt under it — a controlled consumer handing back fresh objects each render.
    itemToValue,
  });

  const navigation = createListNavigation<V>({
    focus,
    orientation: () => "horizontal",
    // Arrowing past either end returns to the text field instead of wrapping. The part hook
    // implements that by peeking (`navigation.peekNext() < 0`); wrapping here would leave it no
    // way to tell "there is another chip" from "you are at the end".
    wrap: () => false,
    textDirection: direction,
  });

  const splitText = (text: string) => text.split(delimiter());

  const add = (text: string): TagsInputAddResult<V> => {
    const added: V[] = [];
    const rejections: TagsInputRejection[] = [];
    const kept: string[] = [];

    const reject = (reason: TagsInputRejectReason, rejectedText: string) => {
      const rejection: TagsInputRejection = { reason, text: rejectedText };
      rejections.push(rejection);
      merged.onReject?.(rejection);
    };

    if (!isInteractive()) {
      return { added, inputText: text, rejections };
    }

    // Empty parts are dropped silently rather than each firing a rejection: typing `apple,` is a
    // commit, not a commit plus a mistake. `"empty"` is reserved for "you asked to commit nothing".
    const candidates = splitText(text).filter((part) => part.trim() !== "");
    if (candidates.length === 0) {
      reject("empty", text);
      return { added, inputText: "", rejections };
    }

    const current = tags();
    const next = [...current];
    const limit = max();
    let duplicateOf: string | undefined;

    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index] as string;

      if (limit !== undefined && next.length >= limit) {
        // `D4` partial-accept: stop at the limit and hand the whole untouched tail back as **one**
        // overflow. All-or-nothing would throw away a 20-address paste over a single tag.
        const remainder = candidates.slice(index);
        reject("max", remainder.join(delimiter()));
        kept.push(...remainder);
        break;
      }

      const parsed = merged.parse(candidate);
      if (parsed === null) {
        reject("invalid", candidate);
        kept.push(candidate);
        continue;
      }

      // Checked against `next`, not `current`: a paste of `a,a` must catch its own second copy.
      const existingIndex = next.findIndex((tag) => isItemEqualToValue(tag, parsed));
      if (existingIndex >= 0) {
        // Dropped rather than kept — the value is already on screen as a chip — and that chip
        // carries `data-duplicate` so a recipe can flash it.
        duplicateOf = itemToValue(next[existingIndex] as V);
        reject("duplicate", candidate);
        continue;
      }

      next.push(parsed);
      added.push(parsed);
    }

    if (added.length > 0) {
      setTags(next);
    }
    // `D4`'s flash lifecycle: a collision marks the chip it hit, a successful add clears whatever
    // was marked. An add that only failed leaves it alone — the user has not typed since.
    if (duplicateOf !== undefined) {
      setDuplicateValue(duplicateOf);
    } else if (added.length > 0) {
      setDuplicateValue(undefined);
    }

    return { added, inputText: kept.join(delimiter()), rejections };
  };

  const removeAt = (index: number) => {
    const current = tags();
    if (!isInteractive() || index < 0 || index >= current.length) {
      return;
    }
    if (isItemDisabled(current[index] as V)) {
      return;
    }
    setTags(current.filter((_, position) => position !== index));
  };

  const remove = (item: V) => removeAt(tags().findIndex((tag) => isItemEqualToValue(tag, item)));

  const removeLast = () => removeAt(tags().length - 1);

  const clear = () => {
    if (!isInteractive()) {
      return;
    }
    const current = tags();
    // Disabled tags survive: they are not individually removable either, so a Clear that took them
    // would be the one way to delete a tag the widget says cannot be deleted.
    const next = current.filter((tag) => isItemDisabled(tag));
    if (next.length === current.length) {
      return;
    }
    setTags(next);
  };

  const focusInput = () => {
    // `D10`, and the order is the whole point: with a non-negative active index, `createListFocus`'s
    // re-homing effect fires on the next tag-array change and pulls DOM focus onto a surviving chip
    // while the user expects to keep typing. Clearing the index first makes that effect return early.
    focus.focusIndex(-1);
    inputElement()?.focus();
  };

  return {
    id,
    value: tags,
    setValue: (value) => setTags(value),
    indexed: collection,
    indexOfValue: collection.indexOfValue,
    focus,
    navigation,
    add,
    removeAt,
    remove,
    removeLast,
    clear,
    itemToValue,
    itemToLabel,
    isItemDisabled,
    isItemEqualToValue,
    max,
    isFull,
    delimiter,
    duplicateValue,
    isDuplicate: (item) => duplicateValue() === itemToValue(item),
    clearDuplicate: () => setDuplicateValue(undefined),
    disabled,
    readOnly,
    required,
    invalid,
    ariaInvalid,
    ariaDescribedBy,
    isInteractive,
    direction,
    setListElement: (element) => setListElement(element),
    listElement,
    inputElement,
    setInputElement: (element) => setInputElement(element),
    focusInput,
  };
}
