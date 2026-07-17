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

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

export function AccessibilityIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <circle cx="16" cy="4" r="1" />
      <path d="m18 19 1-7-6 1" />
      <path d="m5 8 3-3 5.5 3-2.36 3.5" />
      <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
      <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

export function FeatherIcon(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" class={props.class}>
      <path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </svg>
  );
}
