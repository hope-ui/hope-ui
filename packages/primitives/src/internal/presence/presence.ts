import { type Accessor, createEffect, createSignal, untrack } from "solid-js";

export type PresenceStatus = "entering" | "entered" | "exiting" | "exited";

export interface CreatePresenceOptions {
  /** Whether the content should be present. */
  present: Accessor<boolean>;
  /** The rendered element, used to detect an authored exit CSS transition/animation. */
  ref: Accessor<HTMLElement | null | undefined>;
  /**
   * Play the enter animation on the very first mount when `present` starts `true`, instead of
   * appearing already `"entered"`. Off by default, so a `defaultOpen`/already-present element
   * paints in its final state without a spurious first-frame transition.
   */
  initialEnter?: boolean;
}

export interface PresenceState {
  /** Whether the consumer should render its DOM output at all right now. */
  mounted: Accessor<boolean>;
  /** Fine-grained lifecycle status, meant to drive a `data-presence` attribute for CSS. */
  status: Accessor<PresenceStatus>;
}

/**
 * Small cushion added to the computed exit duration before the fallback timer fires, so a real
 * `transitionend`/`animationend` wins the race in the normal case and the timer only acts as a
 * backstop for the events that never arrive.
 */
const FALLBACK_BUFFER_MS = 50;

/**
 * Time in **milliseconds** until the last authored exit transition/animation would end
 * (`delay + duration`, maxed across every comma-separated value). `getComputedStyle` reports
 * these in seconds, so we convert. Returns `0` when nothing is authored — the caller then unmounts
 * synchronously rather than waiting for an end event that will never fire.
 */
function getExitTimeoutMs(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const toMs = (value: string): number[] =>
    value.split(",").map((part) => (Number.parseFloat(part) || 0) * 1000);
  const totals = (durations: string, delays: string): number[] => {
    const duration = toMs(durations);
    const delay = toMs(delays);
    // Per the spec, if there are fewer delays than durations the delay list is repeated; the last
    // value is a safe-enough stand-in for that here.
    return duration.map((value, index) => value + (delay[index] ?? delay[delay.length - 1] ?? 0));
  };
  const times = [
    ...totals(style.transitionDuration, style.transitionDelay),
    ...totals(style.animationDuration, style.animationDelay),
  ];
  return times.length > 0 ? Math.max(0, ...times) : 0;
}

/**
 * Tracks mount/unmount timing across an exit CSS transition or animation, the same idea as Base
 * UI's transition-status handling, built fresh for hope-ui.
 *
 * Consumers gate their DOM output on `mounted()` and use `status()` to drive a `data-presence`
 * attribute for CSS (`entering`/`entered`/`exiting`/`exited`). If the rendered element has no
 * authored `transition`/`animation` duration, exit is immediate (`mounted` flips to `false` in the
 * same effect run) rather than waiting forever for an end event that will never fire.
 *
 * Exit unmount is driven by `transitionend`/`animationend`, with `transitioncancel`/`animationcancel`
 * and a duration-derived `setTimeout` backstop so an interrupted or never-delivered end event can't
 * strand the element mounted with `present` already `false`.
 */
export function createPresence(options: CreatePresenceOptions): PresenceState {
  // `untrack`, and not because tracking here would be wrong-but-harmless: these reads seed the
  // initial value of a signal, so they must happen exactly once and must never re-run. Without it
  // Solid's dev build rightly warns `[STRICT_READ_UNTRACKED]` — and labels the warning with the
  // *caller's* component name (`<Popup>`, `<Backdrop>`), because a primitive called from a
  // component body runs inside that component's owner. `mount()` fails any test that emits one.
  const initialPresent = untrack(options.present);
  const initialEnter = options.initialEnter ?? false;
  const [mounted, setMounted] = createSignal(initialPresent);
  const [status, setStatus] = createSignal<PresenceStatus>(
    initialPresent ? (initialEnter ? "entering" : "entered") : "exited",
  );

  // The split `createEffect(compute, effect)` runs its effect once for the initial value too (pinned
  // in solid-contract.test.ts). This latch tells that first run apart from later ones so an
  // already-present element doesn't replay its enter transition on mount unless `initialEnter` asks.
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
        const frame = requestAnimationFrame(() => setStatus("entered"));
        return () => cancelAnimationFrame(frame);
      }

      setStatus("exiting");
      // Read the ref on the exit edge only, untracked — deliberately *not* the
      // `() => [active(), ref()]`-in-compute pattern `createFocusTrap`/`createDismissable` need.
      // Those read on the *activating* edge, racing the effect that creates the element. This reads
      // on the exit edge, when the element has been in the document since the entering run; tracking
      // it would rerun this effect (re-entering the exiting branch) every time the element changes.
      const element = untrack(options.ref);
      const timeout = element ? getExitTimeoutMs(element) : 0;

      if (!element || timeout <= 0) {
        setMounted(false);
        setStatus("exited");
        return;
      }

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        setMounted(false);
        setStatus("exited");
      };
      const handleEnd = (event: TransitionEvent | AnimationEvent) => {
        if (event.target !== element) return;
        finish();
      };

      element.addEventListener("transitionend", handleEnd);
      element.addEventListener("animationend", handleEnd);
      // A cancelled transition (interrupted, `display: none`, a property reset) fires `*cancel`, not
      // `*end`. Without these the element would stay mounted forever with `present` still `false`.
      element.addEventListener("transitioncancel", handleEnd);
      element.addEventListener("animationcancel", handleEnd);
      // Backstop for the case even `*cancel` misses — a backgrounded tab may fire no event at all.
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
 * {@link createPresence} over a value instead of a boolean: animates the presence of whichever
 * item is active, and animates *swaps* between items by exiting the outgoing one before entering
 * the incoming one. Composes the boolean core, so the exit timing, `status`, and backstop behavior
 * are identical.
 */
export function createPresenceItem<T>(options: CreatePresenceItemOptions<T>): PresenceItemState<T> {
  const initialItem = untrack(options.item);
  // Boxed for the same reason `createControllableState` boxes: a function-valued `T` would be
  // swallowed by `createSignal`'s compute-function overload and invoked as a memo.
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
    // Track the item, the box (so a swap settles), and the core's `mounted` (so we can swap the new
    // item in the moment the old one finishes exiting).
    () => [options.item(), box().item, presence.mounted()] as const,
    ([item, current, coreMounted]) => {
      const shouldMount = itemPresent(item);

      if (shouldMount && item !== current) {
        if (coreMounted) {
          // A different item is still showing; exit it first. When the core unmounts, this effect
          // re-runs (it tracks `presence.mounted()`) and swaps the new item in.
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
