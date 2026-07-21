import { CloseButton } from "@hope-ui/components/close-button";
import type { JSX } from "@solidjs/web";

// Live demo for the "Custom icon" section.
//
// `icon` overrides the built-in X. An inline <svg> can't live in the .mdx (MDX's component map has no
// `svg`/`path`), so the glyph is defined here. Because it swaps the meaning of the affordance from
// "close" to "remove", the demo also sets an explicit `aria-label` — the localized default name is
// "Close", which would no longer be accurate.
function TrashIcon(): JSX.Element {
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
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function CloseButtonCustomIconDemo() {
  return (
    <div class="flex items-center gap-4 not-prose">
      <CloseButton aria-label="Remove" icon={<TrashIcon />} />
      <CloseButton size="md" aria-label="Remove" icon={<TrashIcon />} />
      <CloseButton size="lg" aria-label="Remove" icon={<TrashIcon />} />
    </div>
  );
}
