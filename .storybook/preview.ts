import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import * as docsAnnotations from "@storybook/addon-docs/preview";
// `/next` is the SolidJS 2.0 renderer entry; the bare export resolves to the 1.x-compatible
// one. This project targets 2.0 only.
import { definePreview } from "storybook-solidjs-vite/next";

export default definePreview({
  addons: [docsAnnotations, a11yAnnotations],
  parameters: {
    layout: "centered",
    // Same axe engine `expectNoA11yViolations` runs in the browser tests, but reported
    // interactively per-story rather than as a pass/fail assertion.
    a11y: { test: "todo" },
  },
});
