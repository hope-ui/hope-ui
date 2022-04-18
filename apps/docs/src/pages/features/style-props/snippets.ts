const asPropWithHTMLElement = `<Button as="a" target="_blank" href="https://solidjs.com">
  Go to SolidJS website
</Button>`;

const asPropWithComponent = `import { Link } from "solid-app-router";

<Button as={Link} href="/">
  Back to home
</Button>`;

const marginPadding = `import { Box } from "@hope-ui/design-system"

// $2 refers to the value of \`theme().space[2]\`
<Box m="$2">Tomato</Box>

// You can also use custom values
<Box maxW="960px" mx="auto" />

// sets margin \`8px\` on all viewports and \`12px\` from the first breakpoint and up
<Box m={{ "@initial": "$2", "@sm": "$3" }} />
`;

const colors = `import { Box } from "@hope-ui/design-system"

// $neutral9 refers to the value of \`theme().colors.neutral9\`
<Box color="$neutral9" />

// raw CSS color value
<Box color="#f00" />

// background colors
<Box bg="tomato" />

// verbose prop
<Box backgroundColor="tomato" />`;

const typography = `import { Text } from "@hope-ui/design-system"

// font-size of \`theme().fontSizes.base\`
<Text fontSize="$base" />

// font-size \`32px\`
<Text fontSize={32} />

// font-size \`"2em"\`
<Text fontSize="2em" />

// text-align \`left\` on all viewports and \`center\` from the first breakpoint and up
<Text textAlign={{ "@initial": "left", "@sm": "center" }} />`;

const layout = `import { Box } from "@hope-ui/design-system"

// verbose
<Box display="flex" />

// shorthand
<Box d="flex" />`;

const size = `import { Box } from "@hope-ui/design-system"

// verbose
<Box width="100%" height={32} />

// shorthand
<Box w="100%" h="32px" />

// use theme sizing
<Box boxSize="$sm" />

// width \`256px\`
<Box w={256} />

// width \`"40px"\`
<Box w="40px" />`;

const flexbox = `import { Box, Flex } from "@hope-ui/design-system"

// verbose
<Box display="flex" alignItems="center" justifyContent="space-between">
  Box with Flex props
</Box>

// shorthand using the \`Flex\` component
<Flex alignItems="center" justifyContent="center">
  Flex Container
</Flex>`;

const grid = `import { Box, Grid } from "@hope-ui/design-system"

// verbose
<Box display="grid" gap={2} gridAutoFlow="row dense">
  Grid
</Box>

// shorthand using the \`Grid\` component
<Grid gap={2} autoFlow="row dense">
  Grid
</Grid>`;

const borders = `import { Box } from "@hope-ui/design-system"

<Box border="1px" borderColor="$neutral6">
  Card
</Box>`;

const borderRadius = `import { Button } from "@hope-ui/design-system"

// This button will have no right borderRadius
<Button borderRightRadius="0">Button 1</Button>

// This button will have no left borderRadius
<Button borderLeftRadius="0">Button 2</Button>

// top left and top right radius will be \`theme().radii.md\` => 6px
<Button borderTopRadius="$md">Button 3</Button>`;

const position = `import { Box } from "@hope-ui/design-system"

// verbose
<Box position="absolute">Cover</Box>

// shorthand
<Box pos="absolute">Cover</Box>
<Box pos="absolute" top="0" left="0">
  Absolute with top and left
</Box>

<Box pos="fixed" w="100%" zIndex={2}>
  Fixed with zIndex
</Box>`;

const shadow = `import { Box } from "@hope-ui/design-system"

// use \`theme().shadows.md\`
<Box boxShadow="$md">
  md
</Box>
`;

const pseudo = `import { Button } from "@hope-ui/design-system"

// :hover style
<Button
  colorScheme="primary"
  _hover={{
    background: "white",
    color: "$danger9",
  }}
>
  Hover me
</Button>

// apply :hover over parent element
<Box role="group">
  <Box
    _hover={{ fontWeight: "semibold" }}
    _groupHover={{ color: "tomato" }}
  >
  </Box>
</Box>`;

export const snippets = {
  asPropWithHTMLElement,
  asPropWithComponent,
  marginPadding,
  colors,
  typography,
  layout,
  size,
  flexbox,
  grid,
  borders,
  borderRadius,
  position,
  shadow,
  pseudo,
};
