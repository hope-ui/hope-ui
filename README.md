# hope-ui-solid (WIP)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

🤞 The hoped component library for your SolidJS applications.

## Getting started

### Installation

First install Hope UI and Stitches as a dependency in your project.

```bash
npm install hope-ui-solid @stitches/core # or yarn add or pnpm add
```

### Provider setup

After installing Hope UI, you need to set up the `HopeProvider` at the root of your application.

This can be either in your `index.jsx` or `index.tsx`

```jsx
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

### Optional setup

#### Customizing Theme

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
      <App />
    </HopeProvider>
  );
}
```

## Components roadmap

### General

|        | Development | A11y check | Tests | Storybook | Docs |
| ------ | :---------: | :--------: | :---: | :-------: | :--: |
| Button |             |            |       |           |      |

### Layout

|            | Development | A11y check | Tests | Storybook | Docs |
| ---------- | :---------: | :--------: | :---: | :-------: | :--: |
| Box        |             |            |       |           |      |
| Center     |             |            |       |           |      |
| Container  |             |            |       |           |      |
| Flex       |             |            |       |           |      |
| Grid       |             |            |       |           |      |
| SimpleGrid |             |            |       |           |      |
| Stack      |             |            |       |           |      |

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
| Avatar    |             |            |       |           |      |
| Badge     |             |            |       |           |      |
| Card      |             |            |       |           |      |
| Table     |             |            |       |           |      |
| Tag       |             |            |       |           |      |
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
