import type { JSX } from "@solidjs/web";
import { type Accessor, merge, omit } from "solid-js";
import { resolveTagsInputItem } from "./tags-input-item";
import type { CreateTagsInputReturn } from "./tags-input-root";

export interface CreateTagsInputItemTextProps<V = string> extends JSX.HTMLAttributes<HTMLElement> {
  /** The tag this chip renders — the same value its `.Item` was handed. */
  item: V;
}

export interface CreateTagsInputItemTextReturn {
  /** Spread onto the text element. Everything the consumer passes is forwarded except `id`, which
   *  this part owns — see below. */
  props: JSX.HTMLAttributes<HTMLElement>;
  /** The tag's display text — `itemToLabel`, else `itemToValue`. The element's default children. */
  label: Accessor<string>;
}

/**
 * The chip's text part. It renders no behavior at all; what it owns is **an id, and the fact that
 * nothing else may set it**.
 *
 * That id is the second half of the ✕'s `aria-labelledby` pair (`D1`), which is the whole mechanism
 * behind *"Remove Apple"*: the button points at itself for the verb and at this element for the
 * noun, so there is no interpolated string to localize and no plural to get wrong. A consumer's own
 * `id` is therefore **dropped rather than forwarded** — honoring it would leave the ✕ pointing at an
 * element that no longer exists, and the button would silently fall back to announcing just
 * *"Remove"*. Nothing throws, nothing fails a test, and only screen-reader users see the result. Same
 * call, and the same reason, as `createListboxItem`'s `id`.
 *
 * Every other native attribute — `class`, `style`, `title`, `data-*`, `aria-*`, event handlers — is
 * forwarded untouched. Truncating long text is CSS, so it belongs to the recipe rather than here.
 */
export function createTagsInputItemText<V = string>(
  state: CreateTagsInputReturn<V>,
  props: CreateTagsInputItemTextProps<V>,
): CreateTagsInputItemTextReturn {
  const handle = resolveTagsInputItem(state, () => props.item);
  const label = () => state.itemToLabel?.(props.item) ?? state.itemToValue(props.item);

  const rest = omit(props, "item", "id");

  const elementProps = merge(rest, {
    get id() {
      return handle.textId();
    },
  });

  return { props: elementProps, label };
}
