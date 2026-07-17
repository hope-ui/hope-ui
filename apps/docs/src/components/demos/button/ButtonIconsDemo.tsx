import { Button } from "@hope-ui/components/button";

// Live demo for the "Icons & decorators" section.
//
// Decorators are rendered as RAW <svg> host elements with static attributes — no
// wrapper component and no spread on the svg root. That distinction matters: a
// decorator is inserted dynamically into its slot span, and a *component* (or a
// spread-rooted svg) inserted there trips a hydration tag mismatch, whereas a bare
// static element hydrates cleanly (the same shape the built-in loader uses). This
// also can't live inline in the .mdx: MDX routes lowercase intrinsics through its
// component map, which carries no `svg`/`path`, so an inline <svg> in MDX throws.
export function ButtonIconsDemo() {
  return (
    <div class="flex flex-wrap items-center justify-center gap-3 not-prose">
      <Button
        variant="solid"
        startDecorator={
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
        }
      >
        Save
      </Button>
      <Button
        variant="default"
        endDecorator={
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
        }
      >
        Continue
      </Button>
    </div>
  );
}
