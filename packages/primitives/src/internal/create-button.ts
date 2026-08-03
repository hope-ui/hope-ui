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
import { composeEventHandlers } from "../utils/events";
import { type CreatePressOptions, createPress } from "./create-press";

/** The `type` attribute a native `<button>`/`<input>` understands. */
export type ButtonType = "button" | "submit" | "reset";

export interface CreateButtonOptions<T extends HTMLElement = HTMLElement> {
  /** Whether the button is disabled. Default `false`. */
  disabled?: Accessor<boolean>;
  /**
   * Whether the rendered element is a native `<button>`. Default `true`. Set `false` when a `render`
   * prop swaps in an `<a>` or a `<div role="button">`: those get none of the browser's `disabled`
   * attribute, keyboard activation, or default focusability, so this switches on the
   * `role`/`tabIndex`/`aria-disabled` and keyboard-synthesis substitutes.
   */
  nativeButton?: Accessor<boolean>;
  /** The `type` attribute for a native button. Default `"button"` (never accidentally submits). */
  type?: Accessor<ButtonType | undefined>;
  /**
   * Keep the button focusable while disabled — so a tooltip can explain *why* — by conveying the
   * state with `aria-disabled` instead of the native attribute, which would drop it from the tab
   * order. Interaction is still blocked. Default `false`.
   */
  focusableWhenDisabled?: Accessor<boolean>;
  /** Skip focusing the element on press start. Forwarded to `createPress`. */
  preventFocusOnPress?: Accessor<boolean>;
  /**
   * Consumer event handlers. Composed as disabled-guard, then this handler (whose
   * `preventDefault()` can veto activation), then the press engine. Accessors rather than plain
   * handlers so the returned prop getters re-read them reactively.
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
  /** Empty string when disabled, absent otherwise — the hook for a `data-disabled:` style variant. */
  readonly "data-disabled": "" | undefined;
  /** Empty string while pressed, absent otherwise — the hook for a `data-pressed:` style variant. */
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
 * Button behavior that adapts to whichever element is actually rendered. Every static a11y prop is
 * computed from the `nativeButton` flag at render time rather than read off the ref, so the server
 * and the client produce the same markup; the ref is consulted only at event time, to match keyboard
 * synthesis to the real element and to warn in dev when flag and element disagree.
 *
 * A native `<button>` gets `type` plus the native `disabled` attribute. Anything else gets
 * `role="button"`, `tabIndex`, `aria-disabled`, and the keyboard activation `createPress`
 * synthesizes — none of which the browser supplies off a `<button>`. Both get `data-disabled`, so a
 * theme styles one selector rather than pairing `disabled:` with `aria-disabled:`. A disabled `<a>`
 * needs its `href` dropped by the consumer too: clicks and keys are blocked here, but only a missing
 * `href` makes navigation impossible.
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

  // Cancels the composed chain, and any native default, before the consumer's handler or the press
  // engine runs. A native disabled `<button>` never fires these at all, so this is what makes an
  // `aria-disabled` element — including a focusable-when-disabled one — genuinely inert.
  const guard = (event: Event) => {
    if (!isDisabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  // Dev-only mismatch warning. Never runs on the server: effects don't, and the ref only fills in
  // after mount.
  createEffect(
    // Both signals belong in this first argument. In Solid 2.0's `createEffect(compute, effect)`
    // only the first function tracks, so reading `isNative()` in the second would both miss updates
    // and warn `STRICT_READ_UNTRACKED`.
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
      // The string, not the boolean: Solid renders `aria-disabled={true}` as `aria-disabled=""`,
      // which is not a valid ARIA value.
      return "true";
    },
    // Derived from props alone, so the server and the first client render agree and hydration
    // matches.
    get "data-disabled"() {
      return isDisabled() ? "" : undefined;
    },
    // Always `false` on the server and at first client render, so it can only appear after a press
    // begins — no hydration mismatch.
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
