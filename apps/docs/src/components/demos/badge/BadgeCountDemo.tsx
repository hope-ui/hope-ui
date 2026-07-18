import { Badge } from "@hope-ui/components/badge";

// Live demo for the "Counts & notifications" section.
//
// Two count patterns: standalone `circle`-shaped count chips (the shape squares the
// aspect and drops horizontal padding, so a single glyph reads as a round pip), and
// the classic "count on the corner of an icon" — a positioned circle badge over a
// bell. The bell is a RAW <svg> host element with static attributes (no wrapper
// component, no root spread), the hydration-safe shape; an inline <svg> also can't
// live in the .mdx since MDX's component map carries no `svg`/`path`.
export function BadgeCountDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-8">
      {/* Standalone circular count chips */}
      <div class="flex items-center gap-3">
        <Badge variant="solid" colorScheme="danger" shape="circle" size="sm">
          3
        </Badge>
        <Badge variant="solid" colorScheme="primary" shape="circle" size="md">
          8
        </Badge>
        <Badge variant="soft" colorScheme="neutral" shape="circle" size="md">
          42
        </Badge>
      </div>

      {/* Count anchored to the corner of an icon */}
      <div class="relative inline-flex text-foreground-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="size-7"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <Badge
          variant="solid"
          colorScheme="danger"
          shape="circle"
          size="xs"
          class="absolute -top-1.5 -right-2 ring-2 ring-surface-raised"
          aria-label="5 unread notifications"
        >
          5
        </Badge>
      </div>
    </div>
  );
}
