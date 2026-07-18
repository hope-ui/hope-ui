import { VisualCanvas } from "../canvas";

// Installation: a terminal window with a prompt, an install command, and an output
// line — communicating "run one command to add hope-ui". Default-exported and
// auto-registered by key "get-started/installation" via the glob in ../index.tsx.
// Flat, geometric, hope-ui's *semantic* primary palette only.
export default function InstallationVisual() {
  return (
    <VisualCanvas>
      {/* Terminal window panel */}
      <rect x="94" y="52" width="212" height="96" rx="14" class="fill-primary-soft" />

      {/* Titlebar: three traffic-light dots + a divider */}
      <circle cx="114" cy="70" r="4.5" class="fill-primary" />
      <circle cx="130" cy="70" r="4.5" class="fill-primary" opacity="0.6" />
      <circle cx="146" cy="70" r="4.5" class="fill-primary" opacity="0.4" />
      <line
        x1="94"
        y1="84"
        x2="306"
        y2="84"
        class="stroke-primary"
        opacity="0.2"
        stroke-width="1.5"
      />

      {/* Prompt chevron ">" + the install command */}
      <polyline
        points="116,104 124,111 116,118"
        fill="none"
        class="stroke-primary"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <rect x="136" y="106" width="142" height="10" rx="5" class="fill-primary" />

      {/* Output line (indented, no prompt) */}
      <rect
        x="116"
        y="128"
        width="120"
        height="8"
        rx="4"
        class="fill-primary-emphasis"
        opacity="0.55"
      />
    </VisualCanvas>
  );
}
