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

At the moment, all component's documentation can be found [here](https://github.com/fabien-ml/hope-ui/tree/main/src/docs) and you can try them in the [Storybook](https://hope-ui-storybook.vercel.app/).

## The style props

Style props are a way to alter the style of a component by simply passing props to it. It helps to save time by providing helpful shorthand ways to style components.

### Available props

The following table shows a list of every style prop and the properties within each group.

#### Color

| Prop    | CSS property | Theme token |
| ------- | ------------ | ----------- |
| color   | color        | `colors`    |
| bg      | background   | `colors`    |
| opacity | opacity      | none        |

#### Margin

| Prop | CSS property                            | Theme token |
| ---- | --------------------------------------- | ----------- |
| m    | margin                                  | `space`     |
| mx   | margin-inline-start + margin-inline-end | `space`     |
| my   | margin-top + margin-bottom              | `space`     |
| mt   | margin-top                              | `space`     |
| mr   | margin-right                            | `space`     |
| mb   | margin-bottom                           | `space`     |
| ml   | margin-left                             | `space`     |

#### Padding

| Prop | CSS property                              | Theme token |
| ---- | ----------------------------------------- | ----------- |
| p    | padding                                   | `space`     |
| px   | padding-inline-start + padding-inline-end | `space`     |
| py   | padding-top + padding-bottom              | `space`     |
| pt   | padding-top                               | `space`     |
| pr   | padding-right                             | `space`     |
| pb   | padding-bottom                            | `space`     |
| pl   | padding-left                              | `space`     |

#### Typography

| Prop           | CSS property                                               | Theme token      |
| -------------- | ---------------------------------------------------------- | ---------------- |
| fontFamily     | font-family                                                | `fonts`          |
| fontSize       | font-size                                                  | `fontSizes`      |
| fontWeight     | font-weight                                                | `fontWeights`    |
| lineHeight     | line-height                                                | `lineHeights`    |
| letterSpacing  | letter-spacing                                             | `letterSpacings` |
| textAlign      | text-align                                                 | none             |
| fontStyle      | font-style                                                 | none             |
| textTransform  | text-transform                                             | none             |
| textDecoration | text-decoration                                            | none             |
| lineClamp      | custom utility to truncate text to a given number of lines | none             |

#### Layout

| Prop          | CSS property   | Theme token |
| ------------- | -------------- | ----------- |
| display       | display        | none        |
| verticalAlign | vertical-align | none        |
| overflow      | overflow       | none        |
| overflowX     | overflow-x     | none        |
| overflowY     | overflow-y     | none        |

#### Size

| Prop    | CSS property   | Theme token |
| ------- | -------------- | ----------- |
| w       | width          | `sizes`     |
| minW    | min-width      | `sizes`     |
| maxW    | max-width      | `sizes`     |
| h       | height         | `sizes`     |
| minH    | min-height     | `sizes`     |
| maxH    | max-height     | `sizes`     |
| boxSize | width + height | `sizes`     |

#### Flexbox

| Prop          | CSS property   | Theme token |
| ------------- | -------------- | ----------- |
| justifyItems  | justify-items  | none        |
| flexWrap      | flex-wrap      | none        |
| flexDirection | flex-direction | none        |
| flex          | flex           | none        |
| flexGrow      | flex-grow      | none        |
| flexShrink    | flex-shrink    | none        |
| flexBasis     | flex-basis     | none        |
| justifySelf   | justify-self   | none        |
| alignSelf     | align-self     | none        |

#### Grid

| Prop                | CSS property         | Theme token |
| ------------------- | -------------------- | ----------- |
| gridColumn          | grid-column          | none        |
| gridColumnStart     | grid-column-start    | none        |
| gridColumnEnd       | grid-column-end      | none        |
| gridRow             | grid-row             | none        |
| gridRowStart        | grid-row-start       | none        |
| gridRowEnd          | grid-row-end         | none        |
| gridAutoFlow        | grid-auto-flow       | none        |
| gridAutoColumns     | grid-auto-columns    | none        |
| gridAutoRows        | grid-auto-rows       | none        |
| gridTemplate        | grid-template        | none        |
| gridTemplateColumns | grid-template-column | none        |
| gridTemplateRows    | grid-template-rows   | none        |
| gridTemplateAreas   | grid-template-areas  | none        |
| gridArea            | grid-area            | none        |

#### Common to Flexbox and Grid

| Prop           | CSS property    | Theme token |
| -------------- | --------------- | ----------- |
| gap            | gap             | `space`     |
| rowGap         | row-gap         | `space`     |
| columnGap      | column-gap      | `space`     |
| alignItems     | align-items     | none        |
| alignContent   | align-content   | none        |
| justifyContent | justify-content | none        |
| placeItems     | place-items     | none        |
| placeContent   | place-content   | none        |
| placeSelf      | place-self      | none        |
| order          | order           | none        |

#### Border

| Prop         | CSS property  | Theme token |
| ------------ | ------------- | ----------- |
| border       | border        | none        |
| borderWidth  | border-width  | none        |
| borderStyle  | border-style  | none        |
| borderColor  | border-color  | `colors`    |
| borderRadius | border-radius | `radii`     |

#### Position

| Prop     | CSS property | Theme token |
| -------- | ------------ | ----------- |
| position | position     | none        |
| zIndex   | z-index      | `zIndices`  |
| top      | top          | `space`     |
| right    | right        | `space`     |
| left     | left         | `space`     |
| bottom   | bottom       | `space`     |

#### Shadow

| Prop      | CSS property | Theme token |
| --------- | ------------ | ----------- |
| boxShadow | box-shadow   | `shadows`   |

## Using Hope UI theme tokens in style props

Many style props are mapped to scale from the Hope UI theme tokens, meaning you can set they value based on the Hope UI theme.

You can view the props/token mapping on the [Stitches docs](https://stitches.dev/docs/tokens#property-mapping)

### Usage

To apply a token you need to prefix it with a `$` sign.

```jsx
<Box bg="$primary500" w="$full" p="$4" color="white">
  Box with token-aware style props
</Box>
```

> Note that in this example `color` just use the basic css white color not a value from the theme.

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
    "2xl": "40rem",
    "3xl": "48rem",
    "4xl": "64rem",
    "5xl": "80rem",
    "6xl": "96rem",
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

## Customizing Theme

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
      <Box bg="$primary500" w="$full" p="$4" color="white">
        Box with custom primary500 bg color
      </Box>
    </HopeProvider>
  );
}
```

## The `css` prop

All Hope UI components provides a `css` prop for overriding styles easily.

It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.

```jsx
<Box
  css={{
    bg: "$primary500",
    borderRadius: "0",
    color: "white",
    "&:hover": {
      bg: "$primary600",
    },
  }}
>
  Box
</Box>
```

### Targeting other Hope UI components

Inside the `css` props you can target other Hope UI components using string interpolation in the selector.

```jsx
<Center boxSize="200px" bg="$primary500">
  <Box
    as="button"
    css={{
      [`${Center} &`]: {
        background: "red",
      },
    }}
  >
    Button
  </Box>
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
  boxSize="200px"
  bg="$primary500"
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
<Box as="a" href="https://www.solidjs.com/" bg="$primary500" p="$4" color="white">
  I'm an anchor tag
</Box>
```

And it works with SolidJS components too :

```jsx
import { Router, Link } from "solid-app-router";

//...
<Router>
  <Box as={Link} href="/" bg="$primary500" p="$4" color="white">
    I'm a solid-app-router link
  </Box>
</Router>;
```

## The Hope factory

Hope factory serves as an **object of hope enabled JSX elements**, and also a **function that can be used to enable custom component** receive hope's style props.

```js
import { hope } from "hope-ui-solid";
```

### Hope JSX Elements

Create base html elements with theme-aware style props using `hope.<element>` notation.
For example, if you want a plain html button with ability to pass hope styles, you can write `<hope.button />`.

```jsx
<hope.button px="$3" py="$2" bg="$primary500" borderRadius="$md">
  Click me
</hope.button>
```

This reduces the need to create custom component wrappers and name them.
This syntax is available for common html elements.
See the reference for the full [list of elements](https://github.com/fabien-ml/hope-ui/tree/main/src/styled-system/utils.ts#L7) supported.

### Hope factory function

This is a function that converts non-hope components or jsx element to hope-enabled components, so you can pass style props to them.

It's basically a wrapper around Stitches `css()` method, you can find more about it in the [Stitches docs](https://stitches.dev/docs/framework-agnostic#styling)

Consider the `Link` component of the `solid-app-router` package, let's use the hope factory function to make possible to pass style props.

The function will infer the prop types from the wrapped component and also add hope style props.

```jsx
import { hope } from "hope-ui-solid";
import { Router, Link } from "solid-app-router";

const StyledLink = hope(Link);

function Example() {
  return (
    <Router>
      <StyledLink bg="$danger600" fontSize="12px" href="/">
        Styled solid-app-router link
      </StyledLink>
    </Router>
  );
}
```

> ⚠️ Considering that Hope UI uses stitches under the hood to apply css classes, ensure the non-hope component accepts className as props for this to work correctly.

#### Attaching styles

In some instances, you might need to attach specific styles to the component wrapped in the hope factory.

For that the Hope factory allow you to pass a second argument that will let you apply specific styles.

It's basically a wrapper around Stitches `css()` method, for the usage please refer to the [Stitches docs](https://stitches.dev/docs/framework-agnostic#styling)

```jsx
import { hope } from "hope-ui-solid";

const Card = hope("div", {
  boxShadow: "$lg",
  borderRadius: "$lg",
  bg: "white",
});
```

## Responsive styles

Hope UI provide five breakpoints.

| Prop | CSS property               |
| ---- | -------------------------- |
| sm   | @media (min-width: 640px)  |
| md   | @media (min-width: 768px)  |
| lg   | @media (min-width: 1024px) |
| xl   | @media (min-width: 1280px) |
| 2xl  | @media (min-width: 1536px) |

### Usage with the Hope factory method

Variant created with the `hope` method support responsive styles at props level.

Each breakpoint is a key on the css object prefixed by the `@`symbol.

You must use the `@initial` breakpoint to declare the initial variant before any breakpoints are applied.

For more in dept explanation please refer to the [Stitches docs](https://stitches.dev/docs/breakpoints).

```jsx
import { hope } from "hope-ui-solid";

const Card = hope("div", {
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
<Card
  elevation={{
    "@initial": "sm", // <- initial value, no breakpoint
    "@lg": "md", // <- value at breakpoint "lg"
  }}
>
  Content
</Card>;
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

### Usage with style props

At the moment Hope UI doesn't support responsive style on style props.

## Styling recommendation

### The Hope factory

The Hope factory is great to build components that need to support a wide variety of contexts.

These components are used in many parts of the application and support different combinations of props.

Stitches features like variants and responsive styles works out of the box.

```jsx
import { hope } from "hope-ui-solid";

const Card = hope("div", {
  borderRadius: "$lg",
  bg: "white",

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
<Card
  elevation={{
    "@initial": "sm",
    "@lg": "md",
  }}
>
  Content
</Card>;
```

### Stitches `css` method

If you have some really specific requirement use the `css()` method provided by Stitches.

It's the core Stitches API with no extra layer, you can find the documentation [here](https://stitches.dev/docs/framework-agnostic).

For convenience Hope UI re-export it configured with its default theme.

```jsx
import { css } from "hope-ui-solid";

const button = css({
  backgroundColor: "$primary500",
  borderRadius: "$full",
  fontSize: "$base",
  padding: "$4 $8",
  "&:hover": {
    backgroundColor: "$primary600",
  },
});

function Button() {
  return <button className={button()}>Button</button>;
}
```

### Style props

The style props API is great to apply one-off styles. Think of it as "utility" styles.

```jsx
<Button mb="$4">Button</Button>
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
