const initialBox = `<Box bg="$primary9" w="400px">
  This is a box
</Box>`;

const boxWithResponsiveWidth = `<Box bg="$primary9" w={{ "@initial": "300px", "@sm": "400px", "@md": "500px"}}>
  This is a box
</Box>`;

const usageWithCssProp = `<Box
  css={{
    bg: "$primary9", // no need to wrap inside \`@initial\`
    "@sm": {
      bg: "$success9",
    },
    "@md": {
      bg: "$info9",
    },
  }}
>
  Box
</Box>`;

const usageWithCssFunction = `import { css } from "@hope-ui/design-system";

const cardStyles = css({
  borderRadius: "$lg",
  backgroundColor: "white",

  variants: {
    elevation: {
      sm: {
        boxShadow: "$sm",
      },
      md: {
        boxShadow: "$md",
      },
    },
  },
});

// Inside your component, use the same object syntax as style props
cardStyles({
  elevation: {
    "@initial": "sm", // <- initial value, no breakpoint
    "@lg": "md", // <- value at breakpoint "lg"
  },
});`;

const demo = `<Box p="$4" display={{ "@md": "flex" }}>
  <Box flexShrink={0}>
    <Image
      borderRadius="$lg"
      width={{ "@md": "$40" }}
      src="https://bit.ly/2jYM25F"
      alt="Woman paying for a purchase"
    />
  </Box>
  <Box mt={{ "@initial": "$4", "@md": 0 }} ml={{ "@md": "$6" }}>
    <Text
      fontWeight="$bold"
      textTransform="uppercase"
      fontSize="$sm"
      letterSpacing="$wide"
      color="$primary9"
    >
      Marketing
    </Text>
    <Anchor
      mt="$1"
      display="block"
      fontSize="$lg"
      lineHeight="$normal"
      fontWeight="$semibold"
      href="#"
    >
      Finding customers for your new business
    </Anchor>
    <Text mt="$2" color="$neutral11">
      Getting a new business off the ground is a lot of hard work. Here are five ideas you
      can use to find your first customers.
    </Text>
  </Box>
</Box>`;

export const snippets = {
  initialBox,
  boxWithResponsiveWidth,
  usageWithCssProp,
  usageWithCssFunction,
  demo,
};
