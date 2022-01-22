# Flex

Flex is `Box` with `display: flex` and comes with helpful style shorthand. It renders a `div` element.

## Import

```js
import { Flex, Spacer } from "hope-ui-solid";
```

- **Flex :** A `Box` with `display: flex`.
- **Spacer :** Creates an adjustable, empty space that can be used to tune the spacing between child elements within `Flex`.

## Usage

Using the Flex components, here are some helpful shorthand props :

- flexDirection is direction
- flexWrap is wrap
- flexBasis is basis
- flexGrow is grow
- flexShrink is shrink
- alignItems is align
- justifyContent is justify

While you can pass the verbose props, using the shorthand can save you some time.

```jsx
<Flex color="white">
  <Center w="100px" bg="$success500">
    <Text>Box 1</Text>
  </Center>
  <Box bg="$info500" boxSize="150px">
    <Text>Box 2</Text>
  </Box>
  <Box flex="1" bg="$danger500">
    <Text>Box 3</Text>
  </Box>
</Flex>
```

### Using the Spacer

As an alternative to `Stack`, you can combine `Flex` and `Spacer` to create stackable and responsive layouts.

```jsx
<Flex>
  <Box p="$4" bg="$danger500">
    Box 1
  </Box>
  <Spacer />
  <Box p="$4" bg="$success500">
    Box 2
  </Box>
</Flex>
```

## Props

| Props      | Description                               |   Type    | Default value |
| ---------- | ----------------------------------------- | :-------: | :-----------: |
| inlineFlex | Shorthand for `display: inline-flex`      | `boolean` |    `false`    |
| align      | Shorthand for `alignItems` style prop     | `boolean` |    `false`    |
| justify    | Shorthand for `justifyContent` style prop | `boolean` |    `false`    |
| wrap       | Shorthand for `flexWrap` style prop       | `boolean` |    `false`    |
| direction  | Shorthand for `flexDirection` style prop  | `boolean` |    `false`    |
| basis      | Shorthand for `flexBasis` style prop      | `boolean` |    `false`    |
| grow       | Shorthand for `flexGrow` style prop       | `boolean` |    `false`    |
| shrink     | Shorthand for `flexShrink` style prop     | `boolean` |    `false`    |
