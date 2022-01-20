# Box

Box is the most abstract component of Hope UI.

Box allows you to use style props with any element or component.
Box itself does not include any styles.

By default, it renders a div element.

## Import

```js
import { Box } from "hope-ui-solid";
```

## Usage

```jsx
<Box bg="tomato" w="100%" p="$4" color="white">
  This is the Box
</Box>
```

## as prop

You can use the `as` prop to change the rendered element.

```jsx
<Box as="button" borderRadius="$md" bg="tomato" color="white" px="$4" h="$8">
  Button
</Box>
```
