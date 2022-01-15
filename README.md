# @hope-ui/solid (WIP)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

🤞 The hoped component library for your SolidJS applications.

## Getting started

### Installation

First install Hope UI as a dependency in your project.

```bash
npm install @hope-ui/solid # or yarn or pnpm
```

Since Hope UI is build with Sass and chip `.scss` files you need to install `sass` as a dev dependency.

```bash
npm install -D sass # or yarn or pnpm
```

### Provider setup

After installing Hope UI, you need to set up the `HopeProvider` at the root of your application.

This can be either in your `index.jsx` or `index.tsx`

```jsx
// 1. import `HopeProvider` component
import { HopeProvider } from "@hope-ui/solid";

function App() {
  // 2. Wrap HopeProvider at the root of your app
  return (
    <HopeProvider>
      <App />
    </HopeProvider>
  );
}
```

### Optional setup

#### Globally set default components props

If you intend to customise the default `theme` object to match your design requirements, you can extend the theme from `@hope-ui/solid`.

Hope UI provides an `extendTheme` function that deep merges the default theme with your customizations.

```jsx
// 1. Import the extendTheme function
import { extendTheme, HopeProvider } from "@hope-ui/solid";

// 2. Extend the tokens to globally set default components props
const theme = extendTheme({
  components: {
    Button: {
      variant: "outline",
      radius: "full",
    },
  },
});

// 3. Pass the `tokens` prop to the `HopeProvider`
function App() {
  return (
    <HopeProvider theme={theme}>
      <App />
    </HopeProvider>
  );
}
```

#### Customizing Sass variables

Hope UI uses Sass for all it's design tokens e.g. colors, shadows, breapoints, etc...

If you intend to customise the default `theme` to match your design requirements, you can override all Sass variables.

For example to override the primary color palette :

1. Create a `.scss` file that will contains all your variables overrides.

```scss
// variables.scss

@forward "@hope-ui/solid/styles/variables/colors" with (
  $color-primary-50: #fdf2f8,
  $color-primary-100: #fce7f3,
  $color-primary-200: #fbcfe8,
  $color-primary-300: #f9a8d4,
  $color-primary-400: #f472b6,
  $color-primary-500: #ec4899,
  $color-primary-600: #db2777,
  $color-primary-700: #be185d,
  $color-primary-800: #9d174d,
  $color-primary-900: #831843
);
```

2. Configure your build tool to import this `variables.scss` at the top of all `.scss` files, the below example are using [Vite](https://vitejs.dev/).

> :warning: **Warning :** Do not add any css rule in this file as it will be duplicated in all others Sass files where it's imported.

```ts
// vite.config.js|ts

export default defineConfig({
  //...
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "@use './src/variables.scss';",
      },
    },
  },
  //...
});
```

### Import style on demand

To reduce the bundle size, styles should be loaded on demand, using vite you can use the [vite-plugin-style-import](https://github.com/vbenjs/vite-plugin-style-import) plugin to do that.

1. First install the plugin as a dev dependency.

```bash
npm install -D vite-plugin-style-import # or yarn or pnpm
```

2. Update your `vite.config.js|ts`.

```ts
// 1. Import the vite plugin
import styleImport from "vite-plugin-style-import";

export default defineConfig({
  plugins: [
    solidPlugin(),
    styleImport({
      libs: [
        // 2. Add a custom resolver for Hope UI
        {
          libraryName: "@hope-ui/solid",
          ensureStyleFile: true,
          esModule: true,
          libraryNameChangeCase: "paramCase",
          resolveStyle: name => `@hope-ui/solid/dist/styles/${name}.scss`,
          base: "@hope-ui/solid/styles/base.scss",
        },
      ],
    }),
  ],
  //...
});
```

This plugin will automaticaly do this :

```js
import { Button } from '@hope-ui/solid';

        ↓ ↓ ↓ ↓ ↓ ↓

import { Button } from '@hope-ui/solid';
import '@hope-ui/solid/dist/styles/button.scss';
```

## Components roadmap

### General

|           | Development | A11y check | Tests | Storybook | Docs |
| --------- | :---------: | :--------: | :---: | :-------: | :--: |
| Button    |     ✅      |     ✅     |       |    ✅     |      |
| Container |     ✅      |     ✅     |       |    ✅     |      |
| Paper     |     ✅      |     ✅     |       |    ✅     |      |

### Data entry

|               | Development | A11y check | Tests | Storybook | Docs |
| ------------- | :---------: | :--------: | :---: | :-------: | :--: |
| AutoComplete  |             |            |       |           |      |
| Checkbox      |             |            |       |           |      |
| DatePicker    |             |            |       |           |      |
| Form          |             |            |       |           |      |
| Input         |             |            |       |           |      |
| InputWrapper  |             |            |       |           |      |
| TextInput     |             |            |       |           |      |
| NumberInput   |             |            |       |           |      |
| PasswordInput |             |            |       |           |      |
| RadioGroup    |             |            |       |           |      |
| Radio         |             |            |       |           |      |
| Select        |             |            |       |           |      |
| MultiSelect   |             |            |       |           |      |
| Slider        |             |            |       |           |      |
| Switch        |             |            |       |           |      |
| Textarea      |             |            |       |           |      |
| TimePicker    |             |            |       |           |      |
| UploadInput   |             |            |       |           |      |

### Data display

|           | Development | A11y check | Tests | Storybook | Docs |
| --------- | :---------: | :--------: | :---: | :-------: | :--: |
| Accordion |             |            |       |           |      |
| Avatar    |     🚧      |            |       |           |      |
| Badge     |             |            |       |           |      |
| Card      |             |            |       |           |      |
| Table     |             |            |       |           |      |
| Tag       |     ✅      |     ✅     |       |    ✅     |      |
| Timeline  |             |            |       |           |      |

### Navigation

|             | Development | A11y check | Tests | Storybook | Docs |
| ----------- | :---------: | :--------: | :---: | :-------: | :--: |
| Anchor      |             |            |       |           |      |
| Breadcrumbs |             |            |       |           |      |
| Pagination  |             |            |       |           |      |
| Stepper     |             |            |       |           |      |
| Tabs        |             |            |       |           |      |

### Feedback

|              | Development | A11y check | Tests | Storybook | Docs |
| ------------ | :---------: | :--------: | :---: | :-------: | :--: |
| Alert        |             |            |       |           |      |
| Loader       |             |            |       |           |      |
| Notification |             |            |       |           |      |
| Progress     |             |            |       |           |      |
| RingProgress |             |            |       |           |      |

### Overlay

|         | Development | A11y check | Tests | Storybook | Docs |
| ------- | :---------: | :--------: | :---: | :-------: | :--: |
| Drawer  |             |            |       |           |      |
| Menu    |             |            |       |           |      |
| Modal   |             |            |       |           |      |
| Popover |             |            |       |           |      |
| Tooltip |             |            |       |           |      |

## Acknowledgment

This project would not have been possible without the inspiration of these amazing open source projects :

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
