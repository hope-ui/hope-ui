import { type Accessor, createEffect, createSignal, untrack } from "solid-js";

export type PresenceStatus = "entering" | "entered" | "exiting" | "exited";

export interface CreatePresenceOptions {
  /** Whether the content should be present. */
  present: Accessor<boolean>;
  /** The rendered element, used to detect an authored exit CSS transition/animation. */
  ref: Accessor<HTMLElement | null | undefined>;
  /**
   * Play the enter animation on the very first mount when `present` starts `true`, instead of
   * appearing already `"entered"`. Off by default, so an element that starts open paints in its
   * final state instead of transitioning in on first paint.
   */
  initialEnter?: boolean;
}

export interface PresenceState {
  /** Whether the consumer should render its DOM output at all right now. */
  mounted: Accessor<boolean>;
  /** Lifecycle phase, meant to be mirrored onto a `data-presence` attribute for CSS to target. */
  status: Accessor<PresenceStatus>;
}

/** Cushion on the fallback timer, so a real `transitionend`/`animationend` wins the race. */
const FALLBACK_BUFFER_MS = 50;

/**
 * Milliseconds until the last authored exit transition/animation would end (`delay + duration`,
 * maxed over every comma-separated value; `getComputedStyle` reports seconds). `0` means nothing is
 * authored, and the caller must unmount at once rather than await an end event that never fires.
 */
function getExitTimeoutMs(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const toMs = (value: string): number[] =>
    value.split(",").map((part) => (Number.parseFloat(part) || 0) * 1000);
  const totals = (durations: string, delays: string): number[] => {
    const duration = toMs(durations);
    const delay = toMs(delays);
    // CSS repeats the delay list when it is shorter than the duration list; reusing the last delay
    // is close enough for picking a timeout.
    return duration.map((value, index) => value + (delay[index] ?? delay[delay.length - 1] ?? 0));
  };
  const times = [
    ...totals(style.transitionDuration, style.transitionDelay),
    ...totals(style.animationDuration, style.animationDelay),
  ];
  return times.length > 0 ? Math.max(0, ...times) : 0;
}

/**
 * Keeps an element mounted through its exit CSS transition/animation so it can animate out before
 * being removed — the same idea as the transition-status handling in Base UI (a React headless
 * component library), written fresh here.
 *
 * Consumers render their DOM only while `mounted()` is true and mirror `status()` onto a
 * `data-presence` attribute for CSS. With no authored transition/animation duration, exit is
 * immediate; otherwise unmount waits for `transitionend`/`animationend`, backed by the `*cancel`
 * events and a duration-derived timer so an interrupted or undelivered end event can't strand the
 * element mounted after `present` already went `false`.
 */
export function createPresence(options: CreatePresenceOptions): PresenceState {
  // `untrack` (read a signal without subscribing to it) is required, not merely tidy: these reads
  // seed a signal's initial value, so they must happen exactly once and never re-run. A tracked read
  // makes Solid's dev build warn `[STRICT_READ_UNTRACKED]`, blamed on the *calling* component — a
  // primitive called from a component body runs inside that component's reactive scope. The repo's
  // `mount()` test helper fails any test that emits one.
  const initialPresent = untrack(options.present);
  const initialEnter = options.initialEnter ?? false;
  const [mounted, setMounted] = createSignal(initialPresent);
  const [status, setStatus] = createSignal<PresenceStatus>(
    initialPresent ? (initialEnter ? "entering" : "entered") : "exited",
  );

  // Solid 2.0's two-argument `createEffect(compute, effect)` also runs the effect once for the
  // initial value, so this latch tells that first run apart from later ones — otherwise an element
  // that starts present would transition in on mount even without `initialEnter`.
  let firstRun = true;

  createEffect(
    () => options.present(),
    (present) => {
      const isInitialRun = firstRun;
      firstRun = false;

      if (present) {
        setMounted(true);
        if (isInitialRun && !initialEnter) {
          setStatus("entered");
          return;
        }
        setStatus("entering");
        // Two nested frames, not one. A CSS transition only runs if the browser painted the
        // starting value first, and here the element is inserted as `entering` in the same task that
        // schedules the rAF — so a single rAF still fires before that frame's first style recalc,
        // the element's first computed style is already `entered`, and the enter animation is
        // silently skipped. The inner rAF flips one frame later, once `entering` has been painted.
        // Full write-up: __internal__/primitives/internal/create-presence.md.
        let innerFrame = 0;
        const outerFrame = requestAnimationFrame(() => {
          innerFrame = requestAnimationFrame(() => setStatus("entered"));
        });
        return () => {
          cancelAnimationFrame(outerFrame);
          cancelAnimationFrame(innerFrame);
        };
      }

      setStatus("exiting");
      // Untracked on purpose: by the exit edge the element has been in the document since the
      // entering run, so there is no race to win, and subscribing to the ref would re-run this
      // effect — replaying the exiting branch — on every element change.
      const element = untrack(options.ref);
      const timeout = element ? getExitTimeoutMs(element) : 0;

      if (!element || timeout <= 0) {
        setMounted(false);
        setStatus("exited");
        return;
      }

      let done = false;
      const finish = () => {
        if (done) {
          return;
        }
        done = true;
        setMounted(false);
        setStatus("exited");
      };
      const handleEnd = (event: TransitionEvent | AnimationEvent) => {
        if (event.target !== element) {
          return;
        }
        finish();
      };

      element.addEventListener("transitionend", handleEnd);
      element.addEventListener("animationend", handleEnd);
      // A cancelled transition (interrupted, `display: none`, a property reset) fires `*cancel` and
      // never `*end`; without these the element stays mounted forever.
      element.addEventListener("transitioncancel", handleEnd);
      element.addEventListener("animationcancel", handleEnd);
      // Last resort: a backgrounded tab may fire no event at all, not even `*cancel`.
      const timer = setTimeout(finish, timeout + FALLBACK_BUFFER_MS);

      return () => {
        clearTimeout(timer);
        element.removeEventListener("transitionend", handleEnd);
        element.removeEventListener("animationend", handleEnd);
        element.removeEventListener("transitioncancel", handleEnd);
        element.removeEventListener("animationcancel", handleEnd);
      };
    },
  );

  return { mounted, status };
}

function itemPresent<T>(item: T | undefined | null | false): item is T {
  return item !== false && item != null;
}

export interface CreatePresenceItemOptions<T> {
  /** The item to present. Any nullish or `false` value means "nothing is present". */
  item: Accessor<T | undefined | null | false>;
  /** The rendered element, used to detect an authored exit CSS transition/animation. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** See {@link CreatePresenceOptions.initialEnter}. */
  initialEnter?: boolean;
}

export interface PresenceItemState<T> extends PresenceState {
  /**
   * The item currently rendered. The *outgoing* item stays here through its exit animation, so a
   * swap from item A to item B keeps showing A until A has finished exiting, then swaps to B.
   */
  mountedItem: Accessor<T | undefined>;
}

/**
 * {@link createPresence} over a value instead of a boolean: animates whichever item is active, and
 * animates *swaps* by exiting the outgoing item before entering the incoming one. Built on the
 * boolean core, so exit timing, `status`, and the backstops behave identically.
 */
export function createPresenceItem<T>(options: CreatePresenceItemOptions<T>): PresenceItemState<T> {
  const initialItem = untrack(options.item);
  // Boxed in an object because Solid 2.0 reads `createSignal(fn)` as a memo declaration and calls
  // the function, so a function-valued `T` could never be stored directly.
  const [box, setBox] = createSignal<{ item: T | undefined }>({
    item: itemPresent(initialItem) ? initialItem : undefined,
  });
  const mountedItem: Accessor<T | undefined> = () => box().item;
  const setMountedItem = (item: T | undefined) => setBox({ item });

  const [present, setPresent] = createSignal(itemPresent(initialItem));

  const presence = createPresence({
    present,
    ref: options.ref,
    initialEnter: options.initialEnter,
  });

  createEffect(
    // `presence.mounted()` is tracked so that the moment the outgoing item finishes exiting, this
    // re-runs and swaps the incoming one in.
    () => [options.item(), box().item, presence.mounted()] as const,
    ([item, current, coreMounted]) => {
      const shouldMount = itemPresent(item);

      if (shouldMount && item !== current) {
        if (coreMounted) {
          // A different item is still showing: exit it first, and let the re-run below swap.
          setPresent(false);
        } else {
          setMountedItem(item);
          setPresent(true);
        }
      } else if (!shouldMount) {
        setPresent(false);
      } else {
        setPresent(true);
      }
    },
  );

  return {
    status: presence.status,
    mounted: () => presence.mounted() && itemPresent(mountedItem()),
    mountedItem,
  };
}
