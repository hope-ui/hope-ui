## [0.1.1](https://github.com/fabien-ml/hope-ui/compare/v0.1.0...v0.1.1) (2022-03-24)

### Bug fixes

- Incorrect `checked` state on `Radio` when a number is used as `value`.

### Features

- Add `data-group` attribute to `Radio`, `Checkbox` and `Switch` to allow usage of `_group*` style props on children.
- `Radio`, `Checkbox` and `Switch` exposes they `checked` state as render props.

## [0.1.0](https://github.com/fabien-ml/hope-ui/releases/tag/v0.1.0) (2022-03-23)

### BREAKING CHANGES

- `Radio` has been splitted into `Radio`, `RadioControl` and `RadioLabel` to improve composability.
- `Checkbox` has been splitted into `Checkbox`, `CheckboxControl` and `CheckboxLabel` to improve composability.
- `Switch` has been splitted into `Switch`, `SwitchControl` and `SwitchLabel` to improve composability.

### Features

- Added `SimpleSelect` and `SimpleOption` components as a simpler abstraction over the `Select` API.
