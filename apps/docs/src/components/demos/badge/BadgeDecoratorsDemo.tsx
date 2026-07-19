import { Badge } from "@hope-ui/components/badge";

// Live demo for the "Icons & decorators" section.
//
// Decorators are rendered as RAW <svg> host elements with static attributes — no
// wrapper component and no spread on the svg root. That distinction matters for
// hydration: a decorator is inserted dynamically into its slot span, and a
// *component* (or a spread-rooted svg) inserted there trips a hydration tag
// mismatch, whereas a bare static element hydrates cleanly. This also can't live
// inline in the .mdx: MDX routes lowercase intrinsics through its component map,
// which carries no `svg`/`path`, so an inline <svg> in MDX throws. The recipe sizes
// each decorator's svg to the badge size automatically.
export function BadgeDecoratorsDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-3">
      <Badge
        variant="soft"
        colorScheme="success"
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
        Verified
      </Badge>
      <Badge
        variant="solid"
        colorScheme="warning"
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
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        }
      >
        Featured
      </Badge>
      <Badge
        variant="outline"
        colorScheme="danger"
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
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        }
      >
        Remove
      </Badge>
    </div>
  );
}
