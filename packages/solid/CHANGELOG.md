## [0.6.2-test](https://github.com/mangs/hope-ui/compare/v0.6.2...v0.6.2-test) (2022-06-05)

### 🐛 Bug fixes

- Testing auto-publishing release notes

## [0.6.2](https://github.com/fabien-ml/hope-ui/compare/v0.6.1...v0.6.2) (2022-05-31)

### 🐛 Bug fixes

- Select doesn't work in overlay components Modal/Drawer (#166).

## [0.6.1](https://github.com/fabien-ml/hope-ui/compare/v0.6.0...v0.6.1) (2022-05-21)

### 🐛 Bug fixes

- Opening accordion triggers form submission (#154).
- Notification close button is too small on mobile devices (#155).

## [0.6.0](https://github.com/fabien-ml/hope-ui/compare/v0.5.1...v0.6.0) (2022-05-15)

### 💥 BREAKING CHANGES

- Update `solid-js` peer dependency version to `^1.4.0`.

### 🐛 Bug fixes

- `Select` and `Menu` doesn't work with SolidJS ^1.4.0 (#150).

## [0.5.1](https://github.com/fabien-ml/hope-ui/compare/v0.5.0...v0.5.1) (2022-05-08)

### 🐛 Bug fixes

- Clicking Scrollbar in `Select` closes dropdown instead of scrolling (#145).

## [0.5.0](https://github.com/fabien-ml/hope-ui/compare/v0.4.5...v0.5.0) (2022-05-04)

### 💥 BREAKING CHANGES

- `CheckboxControl` and `CheckboxLabel` components has been removed.
- `RadioControl` and `RadioLabel` components has been removed.
- `SwitchControl` and `SwitchLabel` components has been removed.

### 🐛 Bug fixes

- `Input` event listener leak (#141).

## [0.4.5](https://github.com/fabien-ml/hope-ui/compare/v0.4.4...v0.4.5) (2022-04-28)

### 🐛 Bug fixes

- `Select` in controlled mode doesn't show the current value (#140).

## [0.4.4](https://github.com/fabien-ml/hope-ui/compare/v0.4.3...v0.4.4) (2022-04-28)

### 🐛 Bug fixes

- `_hover` style prop is not applied on `Button` and `Tabs`.

## [0.4.3](https://github.com/fabien-ml/hope-ui/compare/v0.4.2...v0.4.3) (2022-04-19)

### 🐛 Bug fixes

- Export all component styles.

## [0.4.2](https://github.com/fabien-ml/hope-ui/compare/v0.4.1...v0.4.2) (2022-04-08)

### 🐛 Bug fixes

- improved `Notification` styles.

## [0.4.1](https://github.com/fabien-ml/hope-ui/compare/v0.4.0...v0.4.1) (2022-04-08)

### 🐛 Bug fixes

- `Accordion` and `Tabs` causes infinite loops.

## [0.4.0](https://github.com/fabien-ml/hope-ui/compare/v0.3.1...v0.4.0) (2022-04-06)

### ✨ Features

- Added `Notification` system.

## [0.3.1](https://github.com/fabien-ml/hope-ui/compare/v0.3.0...v0.3.1) (2022-04-04)

### 🐛 Bug fixes

- Incorrect `borderRadius` on `Input` with addons.

## [0.3.0](https://github.com/fabien-ml/hope-ui/compare/v0.2.1...v0.3.0) (2022-04-03)

### 💥 BREAKING CHANGES

- `Select` and `SelectOption` only accept `string | number` as value.
- `SelectIcon` render prop has been removed.
- `Stack` default value for `alignItems` prop is `stretch`.
- `TabPanels` component has been removed.

### ✨ Features

- Added `Skeleton` component.
- Added `Accordion` component.
- Added `Popover` component.
- Added `screenW` and `screenH` theme tokens as semantic equivalents of `100vw` and `100vh`.

## [0.2.1](https://github.com/fabien-ml/hope-ui/compare/v0.2.0...v0.2.1) (2022-03-30)

### 🐛 Bug fixes

- `Tabs` not showing correct `TabPanel` in Safari.

## [0.2.0](https://github.com/fabien-ml/hope-ui/compare/v0.1.2...v0.2.0) (2022-03-28)

### ✨ Features

- Added `Tabs` and `Menu` components.
- Added `accent` color palette.

## [0.1.2](https://github.com/fabien-ml/hope-ui/compare/v0.1.1...v0.1.2) (2022-03-24)

### 🐛 Bug fixes

- Same `id` is passed to all `Radio` and `Checkbox` when used in a `FormControl`.

## [0.1.1](https://github.com/fabien-ml/hope-ui/compare/v0.1.0...v0.1.1) (2022-03-24)

### 🐛 Bug fixes

- Incorrect `checked` state on `Radio` when a number is used as `value`.

### ✨ Features

- Add `data-group` attribute to `Radio`, `Checkbox` and `Switch` to allow usage of `_group*` style props on children.
- `Radio`, `Checkbox` and `Switch` exposes they `checked` state as render props.

## [0.1.0](https://github.com/fabien-ml/hope-ui/releases/tag/v0.1.0) (2022-03-23)

### 💥 BREAKING CHANGES

- `Radio` has been splitted into `Radio`, `RadioControl` and `RadioLabel` to improve composability.
- `Checkbox` has been splitted into `Checkbox`, `CheckboxControl` and `CheckboxLabel` to improve composability.
- `Switch` has been splitted into `Switch`, `SwitchControl` and `SwitchLabel` to improve composability.

### ✨ Features

- Added `SimpleSelect` and `SimpleOption` components as a simpler abstraction over the `Select` API.
