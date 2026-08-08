import { useLocale } from "@hope-ui/i18n";
import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { createButton } from "../internal";
import { composeEventHandlers } from "../utils";
import { resolveTagsInputItem } from "./tags-input-item";
import type { CreateTagsInputReturn } from "./tags-input-root";

export interface CreateTagsInputItemDeleteProps<V = string>
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The tag this chip renders — the same value its `.Item` was handed. */
  item: V;
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in something else. A control prop, never spread as an attribute.
   */
  nativeButton?: boolean;
}

export interface CreateTagsInputItemDeleteReturn {
  /** Spread onto the ✕ button. The `aria-labelledby` pair, the tab-order exclusion and the id are
   *  owned here; everything else the consumer passes is forwarded. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the button's `ref`; wires `createButton`'s press engine. */
  setRef: (element: HTMLButtonElement) => void;
  /** Whether the ✕ is disabled: the tag is disabled, or the whole widget is disabled/read-only. */
  isDisabled: Accessor<boolean>;
  /** The localized `"Remove"` — the button's own accessible content, the verb half of its name. */
  label: Accessor<string>;
}

/**
 * The chip's ✕. A real `<button>` over `createButton`, and **not** a `CloseButton` (`D8`) — that
 * component's label is a flat *"Close"* with no way to compose the row's text, it is a real tab stop,
 * and its size axis is independent of the chip's.
 *
 * ## *"Remove Apple"* is two ids, not a formatted string (`D1`)
 *
 * ```html
 * <button id="t0-delete" aria-label="Remove" aria-labelledby="t0-delete t0-text">✕</button>
 * <!--                   ^ the verb          ^ itself, then the chip's text element -->
 * ```
 *
 * Name computation resolves `aria-labelledby` in order; the self-reference is not followed
 * recursively, so it falls through to this button's own `aria-label` (*"Remove"*) and the second id
 * contributes the tag's text (*"Apple"*). Nothing is interpolated, so nothing needs a translator to
 * know the word order of a sentence, and nothing pluralizes. React Aria's `useTag` composes the same
 * pair.
 *
 * ## `tabindex="-1"` (`D2`)
 *
 * The text field is the widget's single tab stop. The ✕ is reached by pointer, or by arrowing to its
 * chip and pressing Backspace/Delete.
 *
 * ## The pointer removal ordering (`D10`)
 *
 * A click clears the chip highlight and puts focus in the **field before the tag leaves**, then
 * removes. Order is the whole point: with a non-negative active index, `createListFocus`'s re-homing
 * effect fires on the collection change and — in roving mode — yanks DOM focus onto a surviving chip
 * while the user expects to keep typing. Clearing it first makes that effect return early. The
 * keyboard path wants the opposite and is in `tags-input-item.ts`.
 *
 * `pointerdown` is cancelled for the same reason `combobox-clear.ts` cancels it: without that, the
 * press moves DOM focus onto a button that is about to be destroyed, and the browser drops focus to
 * `<body>` for a frame. `click` still fires, so the removal itself is untouched.
 */
export function createTagsInputItemDelete<V = string>(
  state: CreateTagsInputReturn<V>,
  props: CreateTagsInputItemDeleteProps<V>,
): CreateTagsInputItemDeleteReturn {
  const { t } = useLocale();
  const handle = resolveTagsInputItem(state, () => props.item);

  const isDisabled = () => !state.isInteractive() || state.isItemDisabled(props.item);
  const label = () => t("tagsInput.removeLabel");

  const remove = () => {
    if (isDisabled()) {
      return;
    }
    // `D10`, and the two calls are in this order on purpose — see the hook's doc above.
    state.focusInput();
    state.removeAt(handle.index());
  };

  const button = createButton<HTMLButtonElement>({
    disabled: isDisabled,
    nativeButton: () => props.nativeButton ?? true,
    onClick: () => composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, remove),
    onKeyDown: () => props.onKeyDown,
    onKeyUp: () => props.onKeyUp,
    onPointerDown: () =>
      composeEventHandlers<HTMLButtonElement, PointerEvent>(props.onPointerDown, (event) =>
        event.preventDefault(),
      ),
  });

  const rest = omit(
    props,
    "item",
    "nativeButton",
    "id",
    "onClick",
    "onKeyDown",
    "onKeyUp",
    "onPointerDown",
  );

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(
    rest,
    button.buttonProps,
    {
      // Not forwardable: it is the first half of the `aria-labelledby` pair below, so a consumer's
      // own id would leave the button naming an element that is not it.
      get id() {
        return handle.deleteId();
      },
      get "aria-label"() {
        return props["aria-label"] ?? label();
      },
      get "aria-labelledby"() {
        const own = handle.deleteId();
        const text = handle.textId();
        if (props["aria-labelledby"] !== undefined) {
          return props["aria-labelledby"];
        }
        // Both ids resolve from the same collection entry, so either both exist or the chip is
        // mid-removal. Falling back to `undefined` leaves `aria-label` as the name rather than
        // emitting a pair that points at nothing.
        return own !== undefined && text !== undefined ? `${own} ${text}` : undefined;
      },
      // Component-owned (`D2`): the field is the widget's single tab stop.
      get tabIndex() {
        return -1;
      },
    },
  );

  return { props: elementProps, setRef: button.setRef, isDisabled, label };
}
