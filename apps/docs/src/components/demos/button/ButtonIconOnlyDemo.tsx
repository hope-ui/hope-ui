import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";

// Live demo for the "Icon-only" section.
//
// Each icon is an ordinary **component** used as the button's sole child — the way an icon set is
// normally consumed. (Earlier the icon had to be a raw <svg> inlined via a plain function call to
// dodge a SolidJS beta hydration bug where a component as the sole child of a <Show>-gated slot
// mis-hydrated; Button now resolves slot content with Solid's `children()` helper, so a component
// child hydrates cleanly.) Inline <svg> still can't live in the .mdx — MDX's component map has no
// `svg`/`path` — so the icons live here in .tsx. Every button carries an `aria-label`: an icon-only
// button has no visible text, and Button dev-warns without one.
function StrokeIcon(props: { d: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={props.d} />
    </svg>
  );
}

const plus = "M12 5v14M5 12h14";
const check = "M20 6 9 17l-5-5";
const arrowRight = "M5 12h14M12 5l7 7-7 7";
const close = "M18 6 6 18M6 6l12 12";

export function ButtonIconOnlyDemo() {
  return (
    <div class="flex flex-col items-center gap-4 not-prose">
      {/* Every size is a genuine square, scaling the icon with it. */}
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button iconOnly size="xs" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
        <Button iconOnly size="sm" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
        <Button iconOnly size="md" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
        <Button iconOnly size="lg" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
        <Button iconOnly size="xl" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
      </div>
      {/* Works across the chrome variants. */}
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button iconOnly variant="solid" aria-label="Add">
          <StrokeIcon d={plus} />
        </Button>
        <Button iconOnly variant="soft" colorScheme="success" aria-label="Confirm">
          <StrokeIcon d={check} />
        </Button>
        <Button iconOnly variant="outline" aria-label="Next">
          <StrokeIcon d={arrowRight} />
        </Button>
        <Button iconOnly variant="ghost" aria-label="Dismiss">
          <StrokeIcon d={close} />
        </Button>
      </div>
    </div>
  );
}
