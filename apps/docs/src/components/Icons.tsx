// Single entry point for every icon in the docs app.
//
// `lucide-solid` has no SolidJS 2.0 build, so the icons are hand-copied Lucide SVGs
// (lucide.dev) — this file is the one place that carries Lucide path data. Add a new
// icon here (copy the paths from lucide.dev) rather than inlining an <svg> elsewhere.
type IconProps = { class?: string };

// Lucide's shared SVG framing: a 24×24 viewBox, `fill="none"`, `stroke="currentColor"`,
// 2px round-joined strokes. Spread into every icon so the attributes live in one place and
// each icon carries only its own paths. Kept as a spread rather than a wrapper component,
// so each icon stays a single leaf <svg> with no extra component boundary — which matters
// where an icon is the first child of a hydration-keyed element (see
// [[solid2-first-child-component-hydration]]). Size and color come from `class`
// (e.g. `size-4`, `text-primary`). `aria-hidden` stays a literal attribute on each <svg>
// (not in this spread) so Biome's a11y linter can see these icons are decorative.
const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

export function BrandLogoIcon(props: IconProps) {
  return (
    <svg
      width="1200"
      height="1200"
      viewBox="0 0 1200 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      class={props.class}
    >
      <path
        d="M475.599 636.395L248.801 1129L504.372 980.034L501.679 947.87L475.599 636.395Z"
        fill="#8B5CF6"
      />
      <path d="M927.504 683.794L475.599 636.395L501.679 947.87L927.504 683.794Z" fill="#6D28D9" />
      <path
        d="M475.599 636.395L597.461 219.966L74.4711 71L254.619 324.92L421.555 560.219L475.599 636.395Z"
        fill="#7C3AED"
      />
      <path
        d="M475.599 636.395L927.504 683.794L769.71 462.037L597.461 219.966L475.599 636.395Z"
        fill="#8B5CF6"
      />
      <path d="M927.504 683.794L900.423 377.397L769.71 462.037L927.504 683.794Z" fill="#7C3AED" />
      <path
        d="M900.423 377.397L927.504 683.794L1021.87 480.658L1083.22 348.619L900.423 377.397Z"
        fill="#8B5CF6"
      />
      <path d="M1200 453.573L1083.22 348.619L1021.87 480.658L1200 453.573Z" fill="#6D28D9" />
      <path d="M0 380.782L421.555 560.219L254.619 324.92L0 380.782Z" fill="#6D28D9" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
