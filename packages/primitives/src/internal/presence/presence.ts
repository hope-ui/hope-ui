import { type Accessor, createEffect, createSignal, untrack } from "solid-js";

export type PresenceStatus = "entering" | "entered" | "exiting" | "exited";

export interface CreatePresenceOptions {
  /** Whether the content should be present. */
  present: Accessor<boolean>;
  /** The rendered element, used to detect an authored exit CSS transition/animation. */
  ref: Accessor<HTMLElement | null | undefined>;
}

export interface PresenceState {
  /** Whether the consumer should render its DOM output at all right now. */
  mounted: Accessor<boolean>;
  /** Fine-grained lifecycle status, meant to drive a `data-presence` attribute for CSS. */
  status: Accessor<PresenceStatus>;
}

function getExitAnimationDuration(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const durations = `${style.transitionDuration},${style.animationDuration}`
    .split(",")
    .map((value) => Number.parseFloat(value) || 0);
  return Math.max(0, ...durations);
}

/**
 * Tracks mount/unmount timing across an exit CSS transition or animation, the same idea
 * as Base UI's transition-status handling, built fresh for solid-zero.
 *
 * Consumers gate their DOM output on `mounted()` and use `status()` to drive a
 * `data-presence` attribute for CSS (`entering`/`entered`/`exiting`/`exited`). If the
 * rendered element has no authored `transition`/`animation` duration, exit is immediate
 * (`mounted` flips to `false` in the same effect run) rather than waiting forever for an
 * end event that will never fire.
 */
export function createPresence(options: CreatePresenceOptions): PresenceState {
  // `untrack`, and not because tracking here would be wrong-but-harmless: these two reads
  // seed the initial value of a signal, so they must happen exactly once and must never
  // re-run. Without it Solid's dev build rightly warns `[STRICT_READ_UNTRACKED]` — and
  // labels the warning with the *caller's* component name (`<Popup>`, `<Backdrop>`),
  // because a primitive called from a component body runs inside that component's owner.
  // `mount()` now fails any test that emits one, so the diagnostic stays worth reading.
  const initialPresent = untrack(options.present);
  const [mounted, setMounted] = createSignal(initialPresent);
  const [status, setStatus] = createSignal<PresenceStatus>(initialPresent ? "entered" : "exited");

  createEffect(
    () => options.present(),
    (present) => {
      if (present) {
        setMounted(true);
        setStatus("entering");
        const frame = requestAnimationFrame(() => setStatus("entered"));
        return () => cancelAnimationFrame(frame);
      }

      setStatus("exiting");
      // `untrack` again, and deliberately *not* the `() => [active(), ref()]`-in-compute
      // pattern `createFocusTrap`/`createDismissable` need. Those read the ref on the
      // *activating* edge, racing the effect that creates the element. This reads it on the
      // exit edge, when the element has been in the document since the entering run — so a
      // one-shot untracked read is correct, and tracking the ref would rerun this effect
      // (re-entering the exiting branch) every time the element is replaced.
      const element = untrack(options.ref);
      const duration = element ? getExitAnimationDuration(element) : 0;

      if (!element || duration <= 0) {
        setMounted(false);
        setStatus("exited");
        return;
      }

      const handleEnd = (event: TransitionEvent | AnimationEvent) => {
        if (event.target !== element) return;
        setMounted(false);
        setStatus("exited");
      };

      element.addEventListener("transitionend", handleEnd);
      element.addEventListener("animationend", handleEnd);

      return () => {
        element.removeEventListener("transitionend", handleEnd);
        element.removeEventListener("animationend", handleEnd);
      };
    },
  );

  return { mounted, status };
}
