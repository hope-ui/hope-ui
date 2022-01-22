# Container

Containers are used to constrain a content's width to the current breakpoint.

## Import

```js
import { Container } from "hope-ui-solid";
```

## Usage

To contain any piece of content, wrap it in the `Container` component.

```jsx
<Container>
  There are many benefits to a joint design and development system. Not only does it bring benefits
  to the design team, but it also brings benefits to engineering teams. It makes sure that our
  experiences have a consistent look and feel, not just in our design specs, but in production
</Container>
```

## Centering the children

In some cases, the width of the content can be smaller than the container's width, you can use the `centerContent` prop to center the content.

```jsx
<Container centerContent bg="$neutral200">
  <Box p="$4" bg="$neutral100" maxW="$xl">
    There are many benefits to a joint design and development system. Not only does it bring
    benefits to the design team.
  </Box>
</Container>
```

## Props

| Props         | Description                                                             |   Type    | Default value |
| ------------- | ----------------------------------------------------------------------- | :-------: | :-----------: |
| centered      | If `true`, container itself will be centered on the page                | `boolean` |    `true`     |
| centerContent | If `true`, container will center its children regardless of their width | `boolean` |    `false`    |
