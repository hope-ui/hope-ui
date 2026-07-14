/**
 * Provenance: this press engine is **derived from React Spectrum's `@react-aria/interactions`
 * `usePress`** (Apache-2.0, https://github.com/adobe/react-spectrum) — its interaction model
 * and reasoning, re-expressed for SolidJS 2.0, not a line-for-line port. The behaviors adapted
 * from it: unifying pointer/touch/mouse/keyboard/virtual-click into a single press,
 * cancel-on-drag-out with re-arm, scroll cancellation, focus-on-press normalization, and touch
 * text-selection suppression. What differs here is deliberate and documented on `createPress`:
 * `onPress` is fired from the `click` event (so it composes with a native `onClick` API and
 * never double-fires), and the reactive surface is a single plain-value signal (hydration-safe
 * by construction). Do not "correct" these divergences back toward the React source.
 */
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal, onCleanup } from "solid-js";

/**
 * How a press was produced. `keyboard` is Enter/Space on the element; `virtual` is a
 * synthetic click with no pointer coordinates (screen-reader activation, or a programmatic
 * `element.click()` such as the one `createButton` synthesizes for non-native elements).
 */
export type PressPointerType = "mouse" | "pen" | "touch" | "keyboard" | "virtual";

/** The event object passed to every press lifecycle callback. */
export interface PressEvent {
  /** Which lifecycle edge fired this event. */
  type: "pressstart" | "pressend" | "pressup" | "press";
  /** How the press was produced. */
  pointerType: PressPointerType;
  /** The element the press handlers are attached to. */
  target: Element;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

export interface CreatePressOptions {
  /** Whether the pressable is disabled; every interaction short-circuits while `true`. */
  disabled?: Accessor<boolean>;
  /**
   * The pressed element. Read only at *event time* (never during render/SSR) to refine
   * keyboard behavior to the element's actual kind — native `<button>` vs `<a href>` vs a
   * generic `role="button"`. Optional: without it, `nativeButton` is the sole hint and a
   * false hint means "generic" (synthesize a click on Enter/Space, prevent Space-scroll).
   */
  ref?: Accessor<HTMLElement | null | undefined>;
  /**
   * Hint that the element is a native `<button>`. A native button gets Enter/Space activation
   * and (for Space) scroll suppression from the browser, so no click is synthesized and Space
   * `keydown` is left un-`preventDefault`ed. Default `false` (treat as a generic pressable).
   * `ref` (when present) overrides this at event time.
   */
  nativeButton?: Accessor<boolean>;
  /** Skip focusing the element on press start (some elements manage their own focus). */
  preventFocusOnPress?: Accessor<boolean>;
  /** Fired once per completed activation (real or synthesized click over the target). */
  onPress?: (event: PressEvent) => void;
  /** Fired when a press begins (pointer down over target, or Enter/Space down). */
  onPressStart?: (event: PressEvent) => void;
  /** Fired when a press ends — release, cancel, or drag-out. */
  onPressEnd?: (event: PressEvent) => void;
  /** Fired on pointer/key release over the target, before `onPress`. */
  onPressUp?: (event: PressEvent) => void;
  /** Fired whenever the pressed state flips. */
  onPressChange?: (isPressed: boolean) => void;
}

export interface PressHandlers<T extends HTMLElement = HTMLElement> {
  onKeyDown: JSX.EventHandler<T, KeyboardEvent>;
  onKeyUp: JSX.EventHandler<T, KeyboardEvent>;
  onClick: JSX.EventHandler<T, MouseEvent>;
  onPointerDown: JSX.EventHandler<T, PointerEvent>;
}

export interface CreatePressReturn<T extends HTMLElement = HTMLElement> {
  /** Spread onto the pressable element. */
  pressProps: PressHandlers<T>;
  /** Whether a press is currently active — surface as `data-pressed` (unset when `false`). */
  isPressed: Accessor<boolean>;
}

type ElementKind = "button" | "anchor" | "generic";

function normalizePointerType(pointerType: string): PressPointerType {
  return pointerType === "touch" || pointerType === "pen" ? pointerType : "mouse";
}

function isPressKey(event: KeyboardEvent): boolean {
  return event.key === "Enter" || event.key === " " || event.key === "Spacebar";
}

function isPointOverElement(event: PointerEvent, element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function focusWithoutScrolling(element: HTMLElement): void {
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

interface ActivePress {
  pointerId: number;
  pointerType: PressPointerType;
  target: HTMLElement;
  /** Whether the pointer is currently over the target (drag-out flips this). */
  isOverTarget: boolean;
  /** Removes the document-level move/up/cancel/scroll listeners and restores `user-select`. */
  teardown: () => void;
}

/**
 * The unified press engine — one `onPress` from pointer, touch, mouse, keyboard, and
 * screen-reader virtual clicks — API-modeled on React Aria's `usePress` (its behavior, not
 * its code). A shared behavior primitive for `createButton` and every future pressable.
 *
 * ## Activation vs. lifecycle
 *
 * `onPress` is fired from the **`click` event**, which is the one signal every input modality
 * ultimately produces: a mouse click, a native button's Enter/Space (the browser dispatches a
 * click), a touch tap, a screen-reader activation, and the synthetic `element.click()` that
 * `createButton` fires for non-native Enter/Space all land on `onClick`. Making the click
 * canonical means a single source of truth and no double-fire — and it dovetails with a
 * component whose public API is the native `onClick`. The **lifecycle** callbacks
 * (`onPressStart`/`onPressEnd`/`onPressUp`/`onPressChange`) and `isPressed` are driven by the
 * pointer/keyboard handlers, so `data-pressed` reflects the physical press even mid-drag.
 *
 * Cancel-on-drag-out fires `onPressEnd` and clears `isPressed` when the pointer leaves the
 * target, and re-arms (`onPressStart`) on re-entry; a release outside the target produces no
 * `click`, so no `onPress` — exactly the native button contract. A scroll or pointer-cancel
 * during a press cancels it (fixes sticky mobile `:active`).
 *
 * ## SSR / hydration
 *
 * The only reactive state is a plain-value `createSignal(false)` for `isPressed` — not a
 * compute-form signal/memo — so it consumes no hydration id and is byte-stable: `false` on the
 * server and initial client alike, and the consumer emits `data-pressed` only when truthy.
 * Every `document` listener is added imperatively inside an event handler (never during
 * render) and removed on release/cancel; `onCleanup` tears down a press still active at
 * dispose. Nothing touches the DOM in the render body, so the body is a no-op under SSR. No
 * module-scope state — the transient bookkeeping is a per-instance closure.
 */
export function createPress<T extends HTMLElement = HTMLElement>(
  options: CreatePressOptions = {},
): CreatePressReturn<T> {
  const [isPressed, setIsPressed] = createSignal(false);

  // A plain mirror of `isPressed`, so the handlers never read the signal outside a tracking
  // scope (which would trip `STRICT_READ_UNTRACKED` in dev) to decide whether the state changed.
  let pressedNow = false;
  let activePointer: ActivePress | undefined;
  let keyboardPressed = false;
  // Carried from press-start to the following `click`, so `onPress` reports how the activation
  // was produced. `undefined` at click time means a virtual/screen-reader click.
  let lastPressPointerType: PressPointerType | undefined;

  const isDisabled = () => options.disabled?.() ?? false;

  function setPressed(value: boolean): void {
    if (pressedNow === value) {
      return;
    }
    pressedNow = value;
    setIsPressed(value);
    options.onPressChange?.(value);
  }

  function toPressEvent(
    type: PressEvent["type"],
    pointerType: PressPointerType,
    target: Element,
    source: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean },
  ): PressEvent {
    return {
      type,
      pointerType,
      target,
      shiftKey: source.shiftKey,
      ctrlKey: source.ctrlKey,
      metaKey: source.metaKey,
      altKey: source.altKey,
    };
  }

  /** Native `<button>` (no synthesis), `<a href>` anchor (Enter is native), or generic. */
  function resolveElementKind(fallbackTarget: HTMLElement): ElementKind {
    const element = options.ref?.() ?? fallbackTarget;
    const tag = element.tagName;
    if (tag === "BUTTON") {
      return "button";
    }
    if (tag === "INPUT") {
      const type = (element as HTMLInputElement).type;
      if (type === "button" || type === "submit" || type === "reset") {
        return "button";
      }
    }
    if (options.nativeButton?.()) {
      return "button";
    }
    if (tag === "A" && element.hasAttribute("href")) {
      return "anchor";
    }
    return "generic";
  }

  function endActivePress(): void {
    activePointer?.teardown();
    activePointer = undefined;
  }

  function onPointerDown(event: PointerEvent & { currentTarget: T }): void {
    if (isDisabled()) {
      return;
    }
    // Primary button / touch / pen contact only. Right- and middle-click never press.
    if (event.button !== 0) {
      return;
    }
    if (activePointer) {
      return;
    }

    const target = event.currentTarget;
    const pointerType = normalizePointerType(event.pointerType);
    lastPressPointerType = pointerType;

    // Focus normalization: Safari and Firefox don't focus a <button> on click, and a generic
    // role="button" never focuses on click. Focus on press start (without scrolling) so the
    // element behaves like a native focused button across browsers.
    if (!options.preventFocusOnPress?.() && document.activeElement !== target) {
      focusWithoutScrolling(target);
    }

    // Suppress the text-selection / callout that a touch-and-hold would otherwise trigger.
    const previousUserSelect = pointerType === "touch" ? target.style.userSelect : undefined;
    if (pointerType === "touch") {
      target.style.userSelect = "none";
    }

    const onDocPointerMove = (moveEvent: PointerEvent) => {
      if (!activePointer || moveEvent.pointerId !== activePointer.pointerId) {
        return;
      }
      const over = isPointOverElement(moveEvent, activePointer.target);
      if (over && !activePointer.isOverTarget) {
        activePointer.isOverTarget = true;
        setPressed(true);
        options.onPressStart?.(toPressEvent("pressstart", pointerType, target, moveEvent));
      } else if (!over && activePointer.isOverTarget) {
        activePointer.isOverTarget = false;
        setPressed(false);
        options.onPressEnd?.(toPressEvent("pressend", pointerType, target, moveEvent));
      }
    };

    const onDocPointerUp = (upEvent: PointerEvent) => {
      if (!activePointer || upEvent.pointerId !== activePointer.pointerId) {
        return;
      }
      if (upEvent.button !== 0) {
        return;
      }
      const wasOver = activePointer.isOverTarget;
      if (wasOver) {
        options.onPressUp?.(toPressEvent("pressup", pointerType, target, upEvent));
        setPressed(false);
        options.onPressEnd?.(toPressEvent("pressend", pointerType, target, upEvent));
        // `onPress` is not fired here: the browser dispatches a `click` on release-over-target,
        // and `onClick` below turns that into the single `onPress`.
      } else {
        // Released outside — `onPressEnd` already fired on drag-out; no `click`, so no `onPress`.
        lastPressPointerType = undefined;
      }
      endActivePress();
    };

    const onDocPointerCancel = (cancelEvent: PointerEvent) => {
      if (!activePointer || cancelEvent.pointerId !== activePointer.pointerId) {
        return;
      }
      cancelPress(pointerType, target, cancelEvent);
    };

    // A scroll during a press cancels it — this is what clears the sticky `:active` state on
    // touch when the gesture turns into a scroll. Capture phase so an ancestor scroll is seen.
    const onScroll = () => {
      if (!activePointer) {
        return;
      }
      cancelPress(pointerType, target, {
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      });
    };

    document.addEventListener("pointermove", onDocPointerMove);
    document.addEventListener("pointerup", onDocPointerUp);
    document.addEventListener("pointercancel", onDocPointerCancel);
    document.addEventListener("scroll", onScroll, true);

    activePointer = {
      pointerId: event.pointerId,
      pointerType,
      target,
      isOverTarget: true,
      teardown: () => {
        document.removeEventListener("pointermove", onDocPointerMove);
        document.removeEventListener("pointerup", onDocPointerUp);
        document.removeEventListener("pointercancel", onDocPointerCancel);
        document.removeEventListener("scroll", onScroll, true);
        if (previousUserSelect !== undefined) {
          target.style.userSelect = previousUserSelect;
        }
      },
    };

    setPressed(true);
    options.onPressStart?.(toPressEvent("pressstart", pointerType, target, event));
  }

  function cancelPress(
    pointerType: PressPointerType,
    target: HTMLElement,
    source: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean },
  ): void {
    const wasOver = activePointer?.isOverTarget ?? false;
    if (wasOver) {
      setPressed(false);
      options.onPressEnd?.(toPressEvent("pressend", pointerType, target, source));
    }
    lastPressPointerType = undefined;
    endActivePress();
  }

  function onKeyDown(event: KeyboardEvent & { currentTarget: T }): void {
    if (isDisabled()) {
      return;
    }
    if (!isPressKey(event)) {
      return;
    }
    // Ignore auto-repeat: hold-to-repeat is a native-button concern the browser owns; the press
    // lifecycle starts exactly once.
    if (event.repeat) {
      return;
    }

    const kind = resolveElementKind(event.currentTarget);
    lastPressPointerType = "keyboard";

    // A generic/anchor element scrolls the page on Space; a native button doesn't (it consumes
    // Space for activation). So prevent Space scroll only when we're not a native button —
    // preventing it on a native button risks suppressing the browser's own activation click.
    if (kind !== "button" && (event.key === " " || event.key === "Spacebar")) {
      event.preventDefault();
    }

    if (!keyboardPressed) {
      keyboardPressed = true;
      setPressed(true);
      options.onPressStart?.(toPressEvent("pressstart", "keyboard", event.currentTarget, event));
    }
  }

  function onKeyUp(event: KeyboardEvent & { currentTarget: T }): void {
    if (isDisabled()) {
      return;
    }
    if (!isPressKey(event)) {
      return;
    }
    if (!keyboardPressed) {
      return;
    }

    const target = event.currentTarget;
    const kind = resolveElementKind(target);
    keyboardPressed = false;

    options.onPressUp?.(toPressEvent("pressup", "keyboard", target, event));
    setPressed(false);
    options.onPressEnd?.(toPressEvent("pressend", "keyboard", target, event));

    // Native buttons and anchors-on-Enter already dispatch a real `click` from the browser;
    // a generic element (and an anchor on Space) does not, so synthesize one so both the
    // consumer's `onClick` and this engine's click-driven `onPress` fire exactly once.
    const isEnter = event.key === "Enter";
    const shouldSynthesize = kind === "generic" || (kind === "anchor" && !isEnter);
    if (shouldSynthesize) {
      target.click();
    }
  }

  function onClick(event: MouseEvent & { currentTarget: T }): void {
    if (isDisabled()) {
      return;
    }
    // A prior handler in the composed chain (the consumer's own `onClick`) can cancel
    // activation with `preventDefault()` — the same cancel channel `composeEventHandlers` uses.
    if (event.defaultPrevented) {
      return;
    }

    const pointerType: PressPointerType =
      lastPressPointerType ?? (event.detail === 0 ? "virtual" : "mouse");
    lastPressPointerType = undefined;

    options.onPress?.(toPressEvent("press", pointerType, event.currentTarget, event));
  }

  onCleanup(() => endActivePress());

  return {
    pressProps: {
      onKeyDown: onKeyDown as JSX.EventHandler<T, KeyboardEvent>,
      onKeyUp: onKeyUp as JSX.EventHandler<T, KeyboardEvent>,
      onClick: onClick as JSX.EventHandler<T, MouseEvent>,
      onPointerDown: onPointerDown as JSX.EventHandler<T, PointerEvent>,
    },
    isPressed,
  };
}
