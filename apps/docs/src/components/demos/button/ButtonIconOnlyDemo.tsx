import { Button } from "@hope-ui/components/button";

// Live demo for the "Icon-only" section.
//
// The icon is the button's ONLY child, so — like the decorators in ButtonIconsDemo — it must be a
// RAW <svg> host element, never a `<Component/>`. `strokeSvg` is a plain function called eagerly
// (`{strokeSvg(...)}`), so it *inlines* a fresh <svg> into the label slot rather than adding a
// component boundary: a component as the sole/first child of the hydration-keyed label span trips a
// hydration mismatch (getNextSibling null), whereas an inlined host element hydrates cleanly. Inline
// <svg> also can't live in the .mdx — MDX's component map has no `svg`/`path`. Every button carries
// an `aria-label`: an icon-only button has no visible text, and Button dev-warns without one.
const strokeSvg = (path: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

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
          {strokeSvg(plus)}
        </Button>
        <Button iconOnly size="sm" aria-label="Add">
          {strokeSvg(plus)}
        </Button>
        <Button iconOnly size="md" aria-label="Add">
          {strokeSvg(plus)}
        </Button>
        <Button iconOnly size="lg" aria-label="Add">
          {strokeSvg(plus)}
        </Button>
        <Button iconOnly size="xl" aria-label="Add">
          {strokeSvg(plus)}
        </Button>
      </div>
      {/* Works across the chrome variants. */}
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button iconOnly variant="solid" aria-label="Add">
          {strokeSvg(plus)}
        </Button>
        <Button iconOnly variant="soft" colorScheme="success" aria-label="Confirm">
          {strokeSvg(check)}
        </Button>
        <Button iconOnly variant="outline" aria-label="Next">
          {strokeSvg(arrowRight)}
        </Button>
        <Button iconOnly variant="ghost" aria-label="Dismiss">
          {strokeSvg(close)}
        </Button>
      </div>
    </div>
  );
}
