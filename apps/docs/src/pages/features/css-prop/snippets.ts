const defineStandardCSSProperty = `<Box 
  as="img"
  src='http://placekitten.com/200/300'
  alt='a kitten'
  css={{ filter: 'blur(8px)' }}
/>
`;

const defineCustomCSSProperty = `<Box css={{ "--my-color": "#53c8c4" }}>
  <Heading color="var(--my-color)" size="4xl">
    This uses CSS Custom Properties!
  </Heading>
</Box>`;

const createNestingSelectors = `<Box borderWidth={2} borderColor="$primary9" p="$5" class="my-box">
  <Heading size="4xl">
    Hover the box...
    <Box
      as="span"
      color="$danger9"
      css={{
        ".my-box:hover &": {
          color: "$success9",
        },
      }}
    >
      And I will turn green!
    </Box>
  </Heading>
</Box>`;

const targetingOtherHopeComponent = `<Center>
  <Button
    css={{
      [\`\${Center} &\`]: {
        bg: "red",
      },
    }}
  >
    Button
  </Button>
</Center>`;

const targetingOtherSolidComponent = `function MyButton() {
  return <button className="my-button">My Button</button>
}

// Add a \`toString\` method which map to a css selector inside your component
// Here we use the underlying button class name
MyButton.toString = () => ".my-button"

<Center
  css={{
    [\`& \${MyButton}\`]: {
      bg: "red",
    },
  }}
>
  <MyButton />
</Center>`;

const customMediaQueries = `<Box
  css={{
    '@media print': {
      display: 'none',
    },
  }}
>
  This text won't be shown when printing this page.
</Box>`;

export const snippets = {
  defineStandardCSSProperty,
  defineCustomCSSProperty,
  createNestingSelectors,
  targetingOtherHopeComponent,
  targetingOtherSolidComponent,
  customMediaQueries,
};
