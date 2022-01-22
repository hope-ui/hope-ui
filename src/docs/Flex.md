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
    <span>Box 1</span>
  </Center>
  <Center bg="$info500" boxSize="150px">
    <span>Box 2</span>
  </Center>
  <Center flex="1" bg="$danger500">
    <span>Box 3</span>
  </Center>
</Flex>
```

### Using the Spacer

As an alternative to `Stack`, you can combine `Flex` and `Spacer` to create stackable and responsive layouts.

```jsx
<Flex>
  <Center p="$4" bg="$danger500">
    Box 1
  </Center>
  <Spacer />
  <Center p="$4" bg="$success500">
    Box 2
  </Center>
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
