# Center

Center is a layout component that centers its child within itself.

## Import

```js
import { Center } from "hope-ui-solid";
```

## Usage

Put any child element inside it, give it any `width` or/and `height`, it'll ensure the child is centered.

```jsx
<Center css={{ bg: "tomato", h: "100px", color: "white" }}>This is the Center</Center>
```

## Props

| Props      | Description                                                |   Type    | Default value |
| ---------- | ---------------------------------------------------------- | :-------: | :-----------: |
| fullWidth  | If `true`, center will take all its parent with            | `boolean` |    `false`    |
| fullHeight | If `true`, center will take all its parent height          | `boolean` |    `false`    |
| fullSize   | If `true`, center will take all its parent with and height | `boolean` |    `false`    |
