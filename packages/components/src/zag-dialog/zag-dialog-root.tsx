import { createPresence } from "@hope-ui/primitives/internal";
import { normalizeProps, useMachine } from "@hope-ui/primitives/zag-solid";
import type {
  DialogPlacement,
  DialogScrollBehavior,
  DialogSize,
  SlotClasses,
} from "@hope-ui/theming";
import { type DialogThemeableProps, useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import {
  connect,
  machine as dialogMachine,
  type OpenChangeDetails,
  type Props as ZagDialogMachineProps,
} from "@zag-js/dialog";
import {
  type Accessor,
  type Component,
  createMemo,
  createSignal,
  createUniqueId,
  untrack,
} from "solid-js";
import { ZagDialogContext, type ZagDialogContextValue } from "./zag-dialog-context";

/** The dialog's ARIA role. `alertdialog` is the APG destructive-confirmation pattern. */
export type ZagDialogRole = "dialog" | "alertdialog";

/**
 * `ZagDialogRootProps` is `Dialog`'s public surface, prop for prop, with **one** deliberate delta:
 * `initialFocus` lives here rather than on `Content`, because Zag's `initialFocusEl` is a machine
 * prop and the machine is created here. Zag's own extras (`finalFocusEl`, `restoreFocus`,
 * `trapFocus`, `preventScroll`, `persistentElements`, `triggerValue`, `aria-label`, `ids`, `dir`)
 * are deliberately unexposed — see `__internal__/spikes/zag-dialog-findings.md`.
 */
export interface ZagDialogRootProps extends DialogThemeableProps {
  /** Controlled open state. Omit for uncontrolled use via `defaultOpen`. */
  open?: boolean;
  /** Initial open state, uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  /** Called whenever the dialog would open or close. Zag's `{ open }` payload is unwrapped here so
   * the consumer sees the same bare boolean `Dialog` gives. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the dialog is modal. Zag derives `trapFocus`/`preventScroll`/`closeOnInteractOutside`
   * from this, and blocks the page behind with `pointer-events: none` on `<body>` plus
   * `aria-hidden` — never `inert`, and with no backdrop element of its own. Default `true`.
   */
  modal?: boolean;
  /** Whether pressing Escape closes the dialog. Default `true`. */
  closeOnEscape?: boolean;
  /** Whether a pointerdown outside the content closes the dialog. Default `true`. */
  closeOnInteractOutside?: boolean;
  /** ARIA role. `alertdialog` for a destructive confirmation. Default `dialog`. */
  role?: ZagDialogRole;
  /**
   * Explicit element to focus when the dialog opens, instead of the first focusable descendant.
   * On `Root` (not `Content`, where `Dialog` puts it) because Zag reads it as a machine prop.
   */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
  /** Per-instance class overrides, keyed by slot. Folded in after the recipe base and the preset's
   * global `slotClasses`. */
  slotClasses?: SlotClasses<"dialog">;
  /** Forwarded to `useSlots`. Dialog has no `root` slot, so per-part styling goes through `slotClasses`. */
  class?: string;
  children?: JSX.Element;
}

/**
 * The ZagDialog root. Starts the `@zag-js/dialog` machine through the vendored Solid 2.0 adapter,
 * connects it once into a memo, resolves the recipe variants, and shares all of it on context.
 * Renders **no host element**, exactly like `Dialog.Root`, so the trigger's hydration key is
 * unaffected.
 *
 * **Presence is ours, not Zag's.** The dialog machine emits `hidden` + `data-state` and nothing
 * else — there is no exit timing in it, and `@zag-js/presence` (what Ark composes) keys off
 * `animationName`/`animationend`, while the hope `dialog` recipe animates with CSS *transitions*.
 * So the enter/exit lifecycle stays on `createPresence`, driven off `api().open` and created
 * **eagerly here** for the same reason `createDialog` owns it: `Content` mounts lazily, so a
 * presence created there would see `present` already `true` on its first run and latch straight to
 * `entered`, skipping the enter animation. `Backdrop` mounts eagerly and keeps its own.
 */
export const Root: Component<ZagDialogRootProps> = (props) => {
  const merged = useDefaults({
    recipe: "dialog",
    props,
    defaults: {
      size: "md" as const,
      placement: "center" as const,
      scrollBehavior: "inside" as const,
      role: "dialog" as const,
      defaultOpen: false,
      modal: true,
      closeOnEscape: true,
      closeOnInteractOutside: true,
    },
  });

  const slots = useSlots({
    recipe: "dialog",
    variantsProps: () => ({
      size: merged.size,
      placement: merged.placement,
      scrollBehavior: merged.scrollBehavior,
    }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  const [contentElement, setContentElement] = createSignal<HTMLElement>();

  // Every Zag part id is `dialog:${scope.id}:<part>`, and `createScope` just spreads what it is
  // handed — so the machine needs an id, and it has to survive the SSR → hydrate round-trip.
  const scopeId = createUniqueId();

  // `untrack`, and it is load-bearing rather than cosmetic. The adapter seeds the machine's
  // bindables by reading its props **memo** straight from the render body — `initialState({ prop })`
  // for the state cell, `prop("triggerValue")`/`prop("defaultTriggerValue")` for the context cell.
  // They are genuine one-time seed reads (Zag re-reads props reactively through `prop()` inside
  // guards, actions and effects), but Solid 2.0's dev build cannot tell a seed read from a mistake,
  // so an unwrapped call emits `[STRICT_READ_UNTRACKED]` thirteen times per `Root` and `mount()`
  // fails the test. Upstream's Solid 1.x adapter never had to spell this out; see the findings ledger.
  const service = untrack(() =>
    useMachine(dialogMachine, () => ({
      id: scopeId,
      open: merged.open,
      defaultOpen: merged.defaultOpen,
      modal: merged.modal,
      role: merged.role,
      closeOnEscape: merged.closeOnEscape,
      // Passed explicitly, always: Zag defaults this to `modal && !alertDialog`, so an
      // `role="alertdialog"` would silently stop closing on an outside click. hope's semantics are
      // "the consumer decides, default `true`", and `compact()` would drop an omitted key.
      closeOnInteractOutside: merged.closeOnInteractOutside,
      onOpenChange: (details: OpenChangeDetails) => merged.onOpenChange?.(details.open),
      // Also always a function, for the mirror-image reason: Zag defaults `initialFocusEl` to the
      // close trigger under `role="alertdialog"`, and hope's default is "first focusable descendant"
      // for both roles. `undefined` is the only value `@zag-js/focus-trap` reads as "no preference"
      // (`getNodeForOption` returns early on it and falls through to the first tabbable node); a
      // `null` return *throws* there. The cast is required because Zag types the return as
      // `MaybeElement` = `HTMLElement | null`, which excludes the one value its own implementation
      // needs — see the findings ledger.
      initialFocusEl: (() => merged.initialFocus?.() ?? undefined) as NonNullable<
        ZagDialogMachineProps["initialFocusEl"]
      >,
    })),
  );

  const api = createMemo(() => connect(service, normalizeProps));

  const contentPresence = createPresence({
    present: () => api().open,
    ref: contentElement,
  });

  const context: ZagDialogContextValue = {
    api,
    contentPresence,
    setContentElement,
    slots,
  };

  return <ZagDialogContext value={context}>{merged.children}</ZagDialogContext>;
};

export type { DialogPlacement, DialogScrollBehavior, DialogSize };
