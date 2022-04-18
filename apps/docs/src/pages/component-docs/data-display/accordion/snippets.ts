const importComponent = `import { 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from "@hope-ui/design-system"`;

const basicUsage = `<Accordion>
  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Composable
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Compose your application interface with reusable building blocks.
    </AccordionPanel>
  </AccordionItem>

  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Accessible
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Hope UI follows WAI-ARIA standards, 
      helping you to reach the largest audience possible with less effort.
    </AccordionPanel>
  </AccordionItem>
</Accordion>`;

const defaultIndex = `<Accordion defaultIndex={1}>
  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Composable
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Compose your application interface with reusable building blocks.
    </AccordionPanel>
  </AccordionItem>

  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Accessible
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Hope UI follows WAI-ARIA standards, 
      helping you to reach the largest audience possible with less effort.
    </AccordionPanel>
  </AccordionItem>
</Accordion>`;

const allowMultiple = `<Accordion allowMultiple>
  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Composable
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Compose your application interface with reusable building blocks.
    </AccordionPanel>
  </AccordionItem>

  <AccordionItem>
    <h2>
      <AccordionButton>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Accessible
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Hope UI follows WAI-ARIA standards, 
      helping you to reach the largest audience possible with less effort.
    </AccordionPanel>
  </AccordionItem>
</Accordion>`;

const stylingExpandedState = `<Accordion>
  <AccordionItem>
    <h2>
      <AccordionButton _expanded={{ bg: "tomato", color: "white" }}>
        <Text flex={1} fontWeight="$medium" textAlign="start">
          Composable
        </Text>
        <AccordionIcon />
      </AccordionButton>
    </h2>
    <AccordionPanel>
      Compose your application interface with reusable building blocks.
    </AccordionPanel>
  </AccordionItem>
</Accordion>`;

const internalState = `<Accordion>
  <AccordionItem>
    {({ expanded }) => (
      <>
        <h2>
          <AccordionButton>
            <Text flex={1} fontWeight="$medium" textAlign="start">
              Composable
            </Text>
            <AccordionIcon 
              fontSize="1em" 
              as={expanded() ? IconMinus : IconPlus} 
            />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          Compose your application interface with reusable building blocks.
        </AccordionPanel>
      </>
    )}
  </AccordionItem>
</Accordion>`;

const controlled = `function ControlledExample() {
  const [itemIndex, setItemIndex] = createSignal(-1);

  return (
    <>
      <HStack spacing="$4" mb="$4">
        <Button 
          variant="subtle" 
          colorScheme="neutral" 
          onClick={() => setItemIndex(0)}
        >
          Open item 1
        </Button>
        <Button 
          variant="subtle" 
          colorScheme="neutral" 
          onClick={() => setItemIndex(1)}
        >
          Open item 2
        </Button>
      </HStack>
      <Accordion 
        index={itemIndex()} 
        onChange={value => setItemIndex(value as number)}
      >
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Text flex={1} fontWeight="$medium" textAlign="start">
                Composable
              </Text>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            Compose your application interface with reusable building blocks.
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Text flex={1} fontWeight="$medium" textAlign="start">
                Accessible
              </Text>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            Hope UI follows WAI-ARIA standards, 
            helping you to reach the largest audience possible with less effort.
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Accordion: {
      baseStyle: {
        root: SystemStyleObject,
        item: SystemStyleObject,
        button: SystemStyleObject,
        icon: SystemStyleObject,
        panel: SystemStyleObject,
      },
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  defaultIndex,
  allowMultiple,
  stylingExpandedState,
  internalState,
  controlled,
  theming,
};
