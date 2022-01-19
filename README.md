# hope-ui-solid (WIP)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

🤞 The hoped component library for your SolidJS applications.

## Getting started

### Installation

First install Hope UI and Stitches as a dependency.

npm :

```bash
npm install hope-ui-solid @stitches/core
```

Yarn :

```bash
yarn add hope-ui-solid @stitches/core
```

pnpm :

```bash
pnpm add hope-ui-solid @stitches/core
```

### Provider setup

After installing Hope UI, you need to set up the `HopeProvider` at the root of your application.

This can be either in your `index.jsx`, `index.tsx` or your App component.

```tsx
// 1. import `HopeProvider` component
import { HopeProvider } from "hope-ui-solid";

function App() {
  // 2. Wrap HopeProvider at the root of your app
  return (
    <HopeProvider>
      <MyApp />
    </HopeProvider>
  );
}
```

## Using Hope UI theme tokens in style props

Many style props are mapped to values from the Hope UI theme tokens, it uses [Stitches](https://stitches.dev) under the hood.

You can view the props/token mapping on the [Stitches docs](https://stitches.dev/docs/tokens#property-mapping)

### Usage

To apply a token you need to prefix it with a `$` sign.

```jsx
<Box bg="$primary500" w="$full" p="$4" color="white">
  Box with token-aware style props
</Box>
```
> Note that `color` just use the basic css white color.

### Available tokens

#### Colors

```js
export default {
  colors: {
    // Primary (TailwindCSS Blue)
    primary50: "#eff6ff",
    primary100: "#dbeafe",
    primary200: "#bfdbfe",
    primary300: "#93c5fd",
    primary400: "#60a5fa",
    primary500: "#3b82f6",
    primary600: "#2563eb",
    primary700: "#1d4ed8",
    primary800: "#1e40af",
    primary900: "#1e3a8a",

    // Dark (Mantine Dark)
    dark50: "#c1c2c5",
    dark100: "#a6a7ab",
    dark200: "#909296",
    dark300: "#5c5f66",
    dark400: "#373a40",
    dark500: "#2c2e33",
    dark600: "#25262b",
    dark700: "#1a1b1e",
    dark800: "#141517",
    dark900: "#101113",

    // Neutral (TailwindCSS Gray)
    neutral50: "#f9fafb",
    neutral100: "#f3f4f6",
    neutral200: "#e5e7eb",
    neutral300: "#d1d5db",
    neutral400: "#9ca3af",
    neutral500: "#6b7280",
    neutral600: "#4b5563",
    neutral700: "#374151",
    neutral800: "#1f2937",
    neutral900: "#111827",

    // Success (TailwindCSS Emerald)
    success50: "#ecfdf5",
    success100: "#d1fae5",
    success200: "#a7f3d0",
    success300: "#6ee7b7",
    success400: "#34d399",
    success500: "#10b981",
    success600: "#059669",
    success700: "#047857",
    success800: "#065f46",
    success900: "#064e3b",

    // Success (TailwindCSS Sky)
    info50: "#f0f9ff",
    info100: "#e0f2fe",
    info200: "#bae6fd",
    info300: "#7dd3fc",
    info400: "#38bdf8",
    info500: "#0ea5e9",
    info600: "#0284c7",
    info700: "#0369a1",
    info800: "#075985",
    info900: "#0c4a6e",

    // Success (TailwindCSS Amber)
    warning50: "#fffbeb",
    warning100: "#fef3c7",
    warning200: "#fde68a",
    warning300: "#fcd34d",
    warning400: "#fbbf24",
    warning500: "#f59e0b",
    warning600: "#d97706",
    warning700: "#b45309",
    warning800: "#92400e",
    warning900: "#78350f",

    // Success (TailwindCSS Red)
    danger50: "#fef2f2",
    danger100: "#fee2e2",
    danger200: "#fecaca",
    danger300: "#fca5a5",
    danger400: "#f87171",
    danger500: "#ef4444",
    danger600: "#dc2626",
    danger700: "#b91c1c",
    danger800: "#991b1b",
    danger900: "#7f1d1d",
  },
};
```

#### Typography

```js
export default {
  fonts: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol","Noto Color Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: "normal",
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: 2,
    3: ".75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
  },
  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};
```

#### Spacing

```js
export default {
  space: {
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
};
```

#### Sizes

```js
export default {
  sizes: {
    ...space,
    full: "100%",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    containerSm: "640px",
    containerMd: "768px",
    containerLg: "1024px",
    containerXl: "1280px",
    container2xl: "1536px",
  },
};
```

#### Border radius

```js
export default {
  radii: {
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },
};
```

#### Z-index values

```js
export default {
  zIndices: {
    docked: 10,
    dropdown: 1000,
    overlay: 1100,
    modal: 1200,
    popover: 1300,
    toast: 1400,
    tooltip: 1500,
  },
};
```

### Customizing Theme

If you intend to customise the default `theme` object to match your design requirements, you can extend the theme from `hope-ui-solid`.

Hope UI provides an `extendTheme` function that deep merges the default theme with your customizations.

```jsx
// 1. Import the extendTheme function
import { extendTheme, HopeProvider } from "hope-ui-solid";

// 2. Extend the theme to include custom colors, fonts etc
const theme = extendTheme({
  tokens: {
    colors: {
      primary500: "salmon",
    },
  },
});

// 3. Pass the `theme` prop to the `HopeProvider`
function App() {
  return (
    <HopeProvider theme={theme}>
      <MyApp />
    </HopeProvider>
  );
}
```

## Acknowledgment

This project would not have been possible without these open source projects :

- [SolidJS](https://www.solidjs.com/)
- [Stitches](https://stitches.dev/)
- [Chakra UI](https://chakra-ui.com/)
- [Mantine](https://mantine.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/fabien-ml"><img src="https://avatars.githubusercontent.com/u/2832351?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fabien MARIE-LOUISE</b></sub></a><br /><a href="#design-fabien-ml" title="Design">🎨</a> <a href="https://github.com/fabien-ml/hope-ui/commits?author=fabien-ml" title="Code">💻</a> <a href="https://github.com/fabien-ml/hope-ui/commits?author=fabien-ml" title="Documentation">📖</a> <a href="#maintenance-fabien-ml" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

This project is licensed under the MIT License.
