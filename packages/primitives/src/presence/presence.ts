import { type Accessor, createEffect, createSignal } from "solid-js";

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
  /** Fine-grained lifecycle status, meant to drive a `data-status` attribute for CSS. */
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
 * `data-status` attribute for CSS (`entering`/`entered`/`exiting`/`exited`). If the
 * rendered element has no authored `transition`/`animation` duration, exit is immediate
 * (`mounted` flips to `false` in the same effect run) rather than waiting forever for an
 * end event that will never fire.
 */
export function createPresence(options: CreatePresenceOptions): PresenceState {
  const [mounted, setMounted] = createSignal(options.present());
  const [status, setStatus] = createSignal<PresenceStatus>(
    options.present() ? "entered" : "exited",
  );

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
      const element = options.ref();
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
