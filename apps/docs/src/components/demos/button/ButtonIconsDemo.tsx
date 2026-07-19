import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";

// Live demo for the "Icons & decorators" section.
//
// Decorators are icon **components** passed straight to `startDecorator`/`endDecorator` — the
// natural way to use an icon set. (Earlier this had to be a raw <svg> host element to dodge a
// SolidJS beta hydration bug where a component inside a <Show>-gated slot mis-hydrated; Button now
// resolves each slot's content with Solid's `children()` helper, so a component hydrates cleanly.
// This still can't live inline in the .mdx: MDX routes lowercase intrinsics through its component
// map, which carries no `svg`/`path`, so an inline <svg> in MDX throws — hence the .tsx demo.)
function CheckIcon(): JSX.Element {
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowRightIcon(): JSX.Element {
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
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ButtonIconsDemo() {
  return (
    <div class="flex flex-wrap items-center justify-center gap-3 not-prose">
      <Button variant="solid" startDecorator={<CheckIcon />}>
        Save
      </Button>
      <Button variant="default" endDecorator={<ArrowRightIcon />}>
        Continue
      </Button>
    </div>
  );
}
