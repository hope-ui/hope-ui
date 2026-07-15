/**
 * Provenance: the element-awareness model here — a plain `native: boolean` that drives all
 * static a11y props at render time, plus a ref consulted only at *event time* to refine
 * behavior and warn on a mismatch — is **derived from Base UI's `useButton`** (MIT,
 * https://github.com/mui/base-ui `packages/react/src/utils/useButton`), re-expressed for
 * SolidJS 2.0. The press behavior it composes (`createPress`) is in turn derived from React
 * Aria's `usePress` — see the provenance note in `create-press.ts`. Neither is a line-for-line port.
 */
import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, createSignal } from "solid-js";
import { composeEventHandlers } from "../../utils/events/events";
import { type CreatePressOptions, createPress } from "../create-press/create-press";

/** The `type` attribute a native `<button>`/`<input>` understands. */
export type ButtonType = "button" | "submit" | "reset";

export interface CreateButtonOptions<T extends HTMLElement = HTMLElement> {
  /** Whether the button is disabled. Default `false`. */
  disabled?: Accessor<boolean>;
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a
   * `render` prop swaps in a non-`<button>` (an `<a>`, a `<div role="button">`): the native
   * `disabled` attribute, browser keyboard activation, and default focusability don't exist on
   * those elements, so this switches on `role`/`tabIndex`/`aria-disabled` and keyboard synthesis.
   */
  nativeButton?: Accessor<boolean>;
  /** The `type` attribute for a native button. Default `"button"` (never accidentally submits). */
  type?: Accessor<ButtonType | undefined>;
  /**
   * Keep the button focusable while disabled (so a tooltip can describe *why* it's disabled),
   * conveying the disabled state via `aria-disabled` instead of the native `disabled` attribute
   * / tab-order removal. Interaction is still blocked. Default `false`.
   */
  focusableWhenDisabled?: Accessor<boolean>;
  /** Skip focusing the element on press start. Forwarded to `createPress`. */
  preventFocusOnPress?: Accessor<boolean>;
  /**
   * Consumer event handlers, composed in the correct order: a disabled-guard runs first (so a
   * disabled non-native element blocks the consumer's handler and any native default), then the
   * consumer's handler (whose `preventDefault()` can veto activation), then the press engine.
   * Passed as accessors so they're read reactively inside the returned prop getters.
   */
  onClick?: Accessor<JSX.EventHandlerUnion<T, MouseEvent> | undefined>;
  onKeyDown?: Accessor<JSX.EventHandlerUnion<T, KeyboardEvent> | undefined>;
  onKeyUp?: Accessor<JSX.EventHandlerUnion<T, KeyboardEvent> | undefined>;
  onPointerDown?: Accessor<JSX.EventHandlerUnion<T, PointerEvent> | undefined>;
  /** Press lifecycle callbacks, forwarded to `createPress`. */
  onPress?: CreatePressOptions["onPress"];
  onPressStart?: CreatePressOptions["onPressStart"];
  onPressEnd?: CreatePressOptions["onPressEnd"];
  onPressUp?: CreatePressOptions["onPressUp"];
  onPressChange?: CreatePressOptions["onPressChange"];
}

/** The computed a11y + interaction props `createButton` spreads onto the rendered element. */
export interface ButtonBehaviorProps<T extends HTMLElement = HTMLElement> {
  readonly type: ButtonType | undefined;
  readonly role: "button" | undefined;
  readonly tabIndex: number | undefined;
  readonly disabled: boolean | undefined;
  readonly "aria-disabled": "true" | undefined;
  /** Present-empty (`""`) styling hook when disabled, absent otherwise — for the `data-disabled:` variant. */
  readonly "data-disabled": "" | undefined;
  /** Present-empty (`""`) styling hook while a press is active, absent otherwise — for the `data-pressed:` variant. */
  readonly "data-pressed": "" | undefined;
  readonly onClick: JSX.EventHandler<T, MouseEvent>;
  readonly onKeyDown: JSX.EventHandler<T, KeyboardEvent>;
  readonly onKeyUp: JSX.EventHandler<T, KeyboardEvent>;
  readonly onPointerDown: JSX.EventHandler<T, PointerEvent>;
}

export interface CreateButtonReturn<T extends HTMLElement = HTMLElement> {
  /** Spread onto the rendered element (via `renderElement`). All props are reactive getters. */
  buttonProps: ButtonBehaviorProps<T>;
  /** Whether a press is currently active (the reactive state; `data-pressed` is emitted in `buttonProps`). */
  isPressed: Accessor<boolean>;
  /** Ref callback for the rendered element; pass to `renderElement`'s `ref` (it merges refs). */
  setRef: (element: T) => void;
}

/**
 * Element-aware button behavior. Computes every static a11y prop from the `nativeButton`
 * boolean at **render time** (SSR-safe: server and client agree without consulting a ref), and
 * composes `createPress` for the interaction. A `ref` is used only at event time — to refine
 * keyboard synthesis to the element's real kind and to warn (dev only) when `nativeButton`
 * disagrees with the element actually rendered.
 *
 * Static props by element kind:
 * - **native** (`nativeButton` true): `type` + native `disabled` (no `aria-disabled` — the
 *   native attribute already conveys it; the redundant double-up is deliberately dropped).
 * - **non-native**: `role="button"`, `tabIndex` (`0`, or omitted when disabled and not
 *   `focusableWhenDisabled`), and `aria-disabled` when disabled. No `type` (meaningless off a
 *   `<button>`/`<input>`). A `render`-ed disabled `<a>` should also have its `href` dropped by
 *   the consumer so navigation is impossible — keyboard/click are blocked here regardless.
 * - **focusableWhenDisabled**: stays focusable, disabled state via `aria-disabled` (never the
 *   native attribute, which would drop it from the tab order).
 * - **every disabled case**: a present-empty `data-disabled` attribute — the single styling hook a
 *   recipe targets (`data-disabled:`), so it never has to pair `disabled:` with `aria-disabled:`.
 *
 * Keyboard synthesis lives in `createPress` (element-aware via the `ref` + `nativeButton`
 * hint): native buttons get browser activation; a generic `role="button"` (and an anchor on
 * Space) has a `click` synthesized so the consumer's `onClick` fires; Space scroll is prevented
 * only for non-native elements.
 */
export function createButton<T extends HTMLElement = HTMLElement>(
  options: CreateButtonOptions<T> = {},
): CreateButtonReturn<T> {
  const [element, setElement] = createSignal<T>();

  const isDisabled = () => options.disabled?.() ?? false;
  const isNative = () => options.nativeButton?.() ?? true;
  const isFocusableWhenDisabled = () => options.focusableWhenDisabled?.() ?? false;

  const press = createPress<T>({
    disabled: isDisabled,
    ref: element,
    nativeButton: isNative,
    preventFocusOnPress: options.preventFocusOnPress,
    onPress: options.onPress,
    onPressStart: options.onPressStart,
    onPressEnd: options.onPressEnd,
    onPressUp: options.onPressUp,
    onPressChange: options.onPressChange,
  });

  // Disabled-guard: cancels the composed chain (and any native default) before the consumer's
  // handler or the press engine runs. A native disabled `<button>` never fires these anyway,
  // so this is what makes a non-native `aria-disabled` element (or a focusable-when-disabled
  // one) genuinely inert.
  const guard = (event: Event) => {
    if (!isDisabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  // Dev-only element/`nativeButton` mismatch warning (Base UI's check). Client-only: effects
  // never run during SSR, and the ref is populated only after mount.
  createEffect(
    // Track both in the deps function — reading `isNative()` inside the effect callback would
    // be an untracked read (`STRICT_READ_UNTRACKED`); deps is the tracking scope.
    () => [element(), isNative()] as const,
    ([el, native]) => {
      if (el == null) {
        return;
      }
      const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
      if (!isDev) {
        return;
      }
      const actuallyNative = el.tagName === "BUTTON";
      if (native && !actuallyNative) {
        console.warn(
          `[hope-ui] createButton: nativeButton is true but the rendered element is <${el.tagName.toLowerCase()}>. ` +
            "Pass nativeButton={false} when rendering a non-<button> element, so keyboard, disabled, and ARIA behavior are correct.",
        );
      } else if (!native && actuallyNative) {
        console.warn(
          "[hope-ui] createButton: nativeButton is false but the rendered element is a native <button>. Remove nativeButton={false}.",
        );
      }
    },
  );

  const buttonProps: ButtonBehaviorProps<T> = {
    get type() {
      return isNative() ? (options.type?.() ?? "button") : undefined;
    },
    get role() {
      return isNative() ? undefined : "button";
    },
    get tabIndex() {
      if (isNative()) {
        return undefined;
      }
      return isDisabled() && !isFocusableWhenDisabled() ? undefined : 0;
    },
    get disabled() {
      if (!isNative()) {
        return undefined;
      }
      return isDisabled() && !isFocusableWhenDisabled() ? true : undefined;
    },
    get "aria-disabled"() {
      if (!isDisabled()) {
        return undefined;
      }
      // Not on a plain native disabled button — the native attribute already conveys it.
      if (isNative() && !isFocusableWhenDisabled()) {
        return undefined;
      }
      // The string "true", not the boolean: Solid renders `aria-disabled={true}` as the empty
      // `aria-disabled=""`, which is not a valid ARIA token value.
      return "true";
    },
    // A present-empty `data-disabled` styling hook, emitted for BOTH native and non-native
    // elements (and focusable-when-disabled). It exists so a theme's recipe styles ONE
    // `data-disabled:` variant instead of pairing `disabled:` (native) with `aria-disabled:`
    // (non-native). Byte-stable: `isDisabled()` is prop-derived, identical on server and client.
    get "data-disabled"() {
      return isDisabled() ? "" : undefined;
    },
    // Present-empty `data-pressed` styling hook while a press is active — the styling counterpart to
    // the `isPressed` accessor, kept here (not hand-wired in the consumer) for the same reason as
    // `data-disabled`. Byte-stable: `false` on the server and initial client, so it only ever
    // appears client-side once a press begins.
    get "data-pressed"() {
      return press.isPressed() ? "" : undefined;
    },
    get onClick() {
      return composeEventHandlers<T, MouseEvent>(
        guard,
        options.onClick?.(),
        press.pressProps.onClick,
      );
    },
    get onKeyDown() {
      return composeEventHandlers<T, KeyboardEvent>(
        guard,
        options.onKeyDown?.(),
        press.pressProps.onKeyDown,
      );
    },
    get onKeyUp() {
      return composeEventHandlers<T, KeyboardEvent>(
        guard,
        options.onKeyUp?.(),
        press.pressProps.onKeyUp,
      );
    },
    get onPointerDown() {
      return composeEventHandlers<T, PointerEvent>(
        options.onPointerDown?.(),
        press.pressProps.onPointerDown,
      );
    },
  };

  return { buttonProps, isPressed: press.isPressed, setRef: setElement };
}
