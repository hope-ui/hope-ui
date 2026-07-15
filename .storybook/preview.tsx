// hope-ui's dev stylesheet — Storybook is itself a Tailwind v4 consumer. `@tailwindcss/vite`
// (wired in .storybook/main.ts) compiles this: `@import "tailwindcss"` + the default `hope` theme,
// scanning the components' source + stories + the theme's recipes. hope-ui ships no precompiled CSS.
import "./tailwind.css";
import { ThemeProvider } from "@hope-ui/theming";
import { hopeRecipes } from "@hope-ui/themes/hope/recipes";
import * as a11yAnnotations from "@storybook/addon-a11y/preview";
import * as docsAnnotations from "@storybook/addon-docs/preview";
// `/next` is the SolidJS 2.0 renderer entry; the bare export resolves to the 1.x-compatible
// one. This project targets 2.0 only.
import { createJSXDecorator, definePreview } from "storybook-solidjs-vite/next";

// Every hope-ui component reads its styling through `useRecipe(...)`, which requires a
// `<ThemeProvider>` above it. This global decorator provides the default `hope` theme's recipe map
// to every story. `createJSXDecorator` mounts the wrapper once per story (not on every control
// update), which is what Solid's run-once component model expects.
const withHopeTheme = createJSXDecorator((Story) => (
  <ThemeProvider theme={hopeRecipes}>
    <Story />
  </ThemeProvider>
));

export default definePreview({
  addons: [docsAnnotations, a11yAnnotations],
  decorators: [withHopeTheme],
  parameters: {
    layout: "centered",
    // Same axe engine `expectNoA11yViolations` runs in the browser tests, but reported
    // interactively per-story rather than as a pass/fail assertion.
    a11y: { test: "todo" },
  },
});
