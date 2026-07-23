import type { PresenceState } from "@hope-ui/primitives/internal";
import { createComponentContext } from "@hope-ui/primitives/internal";
import type { PropTypes } from "@hope-ui/primitives/zag-solid";
import type { DialogSlot } from "@hope-ui/theming";
import type { Api } from "@zag-js/dialog";
import type { Accessor } from "solid-js";

/** `@zag-js/dialog`'s connected API, bound to the vendored adapter's Solid prop types. */
export type ZagDialogApi = Api<PropTypes>;

/**
 * The value every ZagDialog part reads. **Composition, not inheritance**, exactly as
 * `dialog-context.ts` does it — it *holds* the machine's connected API rather than spreading it,
 * so the styling layer never masquerades as the behavior layer.
 *
 * Two fields have no counterpart in the handmade Dialog's context, and both exist because the Zag
 * machine has no equivalent: `contentPresence` (Zag's dialog ships no presence at all — see
 * `zag-dialog-root.tsx`) and `setContentElement` (that presence needs the card's element to time
 * its exit transition off, and Zag's machine finds its own elements by id rather than registering
 * them).
 */
export interface ZagDialogContextValue {
  /** The connected machine API, recomputed on every transition. Parts call `ctx.api().getXProps()`. */
  api: Accessor<ZagDialogApi>;
  /** The **shared** overlay presence for `Content` + `Positioner`, created eagerly on `Root`.
   * `Backdrop` keeps its own. Gate the render on `mounted()`, drive `data-presence` off `status()`. */
  contentPresence: PresenceState;
  /** Registers the content element so the shared presence can time its exit off the card's transition. */
  setContentElement: (element: HTMLElement | undefined) => void;
  /** One ready-to-call class fn per Dialog slot, resolved once on `Root` and shared here. */
  slots: Record<DialogSlot, () => string>;
}

export const [ZagDialogContext, useZagDialogContext] =
  createComponentContext<ZagDialogContextValue>("ZagDialog");
