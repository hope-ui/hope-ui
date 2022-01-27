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

## Component documentation

At the moment, all component's documentation can be found [here](https://github.com/fabien-ml/hope-ui/tree/main/src/docs).

## Creating styles

To create custom styles use the `css()` method provided by Stitches.

It's the core Stitches API with no extra layer, you can find the documentation [here](https://stitches.dev/docs/framework-agnostic).

For convenience Hope UI re-export it configured with its default theme.

```jsx
import { css } from "hope-ui-solid";

const buttonStyles = css({
  backgroundColor: "red",
  borderRadius: "16px",
  fontSize: "16px",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "orange",
  },
});

function Button() {
  return <button className={buttonStyles()}>Button</button>;
}
```

## Using Hope UI theme tokens

Many css propeties of Stitches `css` method and `css` prop are mapped to scale from the Hope UI theme tokens, meaning you can set they value based on the Hope UI theme.

You can view the props/token mapping on the [Stitches docs](https://stitches.dev/docs/tokens#property-mapping)

### Usage

To apply a token you need to prefix it with a `$` sign.

```jsx
import { css } from "hope-ui-solid";

const buttonStyles = css({
  backgroundColor: "$primary500",
  borderRadius: "$full",
  fontSize: "$base",
  padding: "$4 $8",
  "&:hover": {
    backgroundColor: "$primary600",
  },
});

function Button() {
  return <button className={buttonStyles()}>Button</button>;
}
```

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

    // Info (TailwindCSS Sky)
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

    // Warning (TailwindCSS Amber)
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

    // Danger (TailwindCSS Red)
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

#### Space

```js
export default {
  space: {
    px: "1px",
    0_5: "0.125rem",
    1: "0.25rem",
    1_5: "0.375rem",
    2: "0.5rem",
    2_5: "0.625rem",
    3: "0.75rem",
    3_5: "0.875rem",
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
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },
};
```

#### Sizes

```js
export default {
  sizes: {
    ...space,
    max: "max-content",
    min: "min-content",
    full: "100%",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
    "8xl": "90rem",
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
    none: "0",
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

#### Shadows

```js
export default {
  shadows: {
    none: "0 0 #0000",
    xs: "0 0 0 1px rgb(0 0 0 / 0.05)",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    lg: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    xl: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "2xl": "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "3xl": "0 25px 50px -12px rgb(0 0 0 / 0.23)",
    inner: "inset 0 3px 6px 0 rgb(0 0 0 / 0.3)",
  },
};
```

#### Z-index values

```js
export default {
  zIndices: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};
```

## Customizing Theme

If you intend to customise the default `theme` object to match your design requirements, you can extend the theme from `hope-ui-solid`.

Hope UI provides an `extendTheme` function that deep merges the default theme with your customizations.

```jsx
// 1. Import the extendTheme function
import { extendTheme, HopeProvider } from "hope-ui-solid";

// 2. Extend the theme to include custom colors, fonts, default component styles and props.
const theme = extendTheme({
  tokens: {
    colors: {
      primary500: "salmon",
    },
    fonts: {
      sans: "Inter, sans-serif",
    },
  },
  components: {
    Button: {
      defaultProps: {
        variant: "outline",
        radius: "full",
        uppercase: true,
      },
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

## The `css` prop

All Hope UI components provides a `css` prop for overriding styles easily.

It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.

```jsx
<Button
  css={{
    bg: "$primary500",
    borderRadius: "$none",
    color: "white",
    "&:hover": {
      bg: "$primary600",
    },
  }}
>
  Button
</Button>
```

### Targeting other Hope UI components

Inside the `css` props you can target other Hope UI components using string interpolation in the selector.

```jsx
<Center>
  <Button
    css={{
      [`${Center} &`]: {
        background: "red",
      },
    }}
  >
    Button
  </Button>
</Center>
```

### Targeting other SolidJS components

Inside the `css` props you can target other SolidJS components using string interpolation in the selector.

```jsx
function Button() {
  return <button className="my-button">Button</button>;
}

// Add a `toString` method which map to a css selector inside your component
// Here we use the underlying button class name
Button.toString = () => ".my-button";

<Center
  css={{
    [`& ${Button}`]: {
      background: "red",
    },
  }}
>
  <Button />
</Center>;
```

## The `as` props

All Hope UI components are polymorphic, meaning you can use the `as` prop to change the rendered element.

If you are using TypeScript you will get proper auto-completion based on the value of the `as` prop.

```jsx
<Button as="a" href="https://www.solidjs.com/">
  I'm an anchor tag
</Button>
```

And it works with SolidJS components too.

```jsx
import { Router, Link } from "solid-app-router";

//...
<Router>
  <Button as={Link} href="/">
    I'm a solid-app-router link
  </Button>
</Router>;
```

## Responsive styles

Hope UI provide the follow media queries.

| Prop          | CSS property                            |
| ------------- | --------------------------------------- |
| sm            | @media (min-width: 640px)               |
| md            | @media (min-width: 768px)               |
| lg            | @media (min-width: 1024px)              |
| xl            | @media (min-width: 1280px)              |
| 2xl           | @media (min-width: 1536px)              |
| reduce-motion | @media (prefers-reduced-motion: reduce) |
| light         | @media (prefers-color-scheme: light)    |
| dark          | @media (prefers-color-scheme: dark)     |

### Usage with Stitches `css` method

Variant created with Stitches `css` method support responsive styles.

Each breakpoint is a key on the object prefixed by the `@`symbol.

You must use the `@initial` breakpoint to declare the initial variant before any breakpoints are applied.

For more in dept explanation please refer to the [Stitches docs](https://stitches.dev/docs/breakpoints).

```jsx
import { css } from "hope-ui-solid";

const cardStyles = css({
  borderRadius: "$lg",
  backgroundColor: "white",

  variants: {
    elevation: {
      sm: {
        boxShadow: "$sm",
      },
      md: {
        boxShadow: "$md",
      },
    },
  },
});

//...
cardStyles({
  elevation: {
    "@initial": "sm", // <- initial value, no breakpoint
    "@lg": "md", // <- value at breakpoint "lg"
  },
});
```

### Usage with the `css` prop

When using responsive styles with the `css` prop each breakpoint is a key on the css object prefixed by the `@` symbol.

Here you don't need the `@initial` breakpoint.

For more in dept explanation please refer to the [Stitches docs](https://stitches.dev/docs/breakpoints#using-breakpoints-in-the-style-objects).

```jsx
<Button
  css={{
    backgroundColor: "$primary500",
    "@sm": {
      backgroundColor: "$success500",
    },
    "@xl": {
      backgroundColor: "$info500",
    },
  }}
>
  Box
</Button>
```

## SSR

Stitches have a section about SSR on their [docs](https://stitches.dev/docs/server-side-rendering)

For convenience Hope UI re-export the `getCssText()` method from Stitches configured with its default theme.

```js
import { getCssText } from "hope-ui-solid";
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
