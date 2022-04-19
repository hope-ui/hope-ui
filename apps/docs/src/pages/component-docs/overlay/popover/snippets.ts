const importComponent = `import {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
} from "@hope-ui/solid"`;

const basicUsage = `<Popover>
  <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
    Trigger
  </PopoverTrigger>
  <PopoverContent>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverHeader>Confirmation!</PopoverHeader>
    <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
  </PopoverContent>
</Popover>`;

const triggerOnHover = `<Popover triggerMode="hover">
  <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
    Trigger
  </PopoverTrigger>
  <PopoverContent>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverHeader>Confirmation!</PopoverHeader>
    <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
  </PopoverContent>
</Popover>`;

const initialFocus = `<Popover initialFocus="#next">
  <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
    Trigger
  </PopoverTrigger>
  <PopoverContent maxW="$sm">
    <PopoverHeader border="0">Running the app</PopoverHeader>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverBody>
      To start the development server run npm start command
    </PopoverBody>
    <PopoverFooter
      border="0"
      d="flex"
      alignItems="center"
      justifyContent="space-between"
      pb="$4"
    >
      <Box fontSize="$sm">Step 2 of 4</Box>
      <ButtonGroup size="sm">
        <Button colorScheme="neutral" variant="subtle">
          Previous
        </Button>
        <Button id="next" colorScheme="info">
          Next
        </Button>
      </ButtonGroup>
    </PopoverFooter>
  </PopoverContent>
</Popover>`;

const focusTrap = `<Popover trapFocus>
  <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
    Trigger
  </PopoverTrigger>
  <PopoverContent maxW="$sm">
    <PopoverHeader border="0">Running the app</PopoverHeader>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverBody>
      To start the development server run npm start command
    </PopoverBody>
    <PopoverFooter
      border="0"
      d="flex"
      alignItems="center"
      justifyContent="space-between"
      pb="$4"
    >
      <Box fontSize="$sm">Step 2 of 4</Box>
      <ButtonGroup size="sm">
        <Button colorScheme="neutral" variant="subtle">
          Previous
        </Button>
        <Button colorScheme="info">
          Next
        </Button>
      </ButtonGroup>
    </PopoverFooter>
  </PopoverContent>
</Popover>`;

const placement = `<Popover placement="top-start">
  <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
    Trigger
  </PopoverTrigger>
  <PopoverContent>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverHeader>Confirmation!</PopoverHeader>
    <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
  </PopoverContent>
</Popover>`;

const anchor = `<Popover>
  <HStack spacing="$2">
    <PopoverAnchor
      as={Input}
      w="auto"
      display="inline-flex"
      placeholder="I am the anchor"
    />
    <PopoverTrigger as={Button}>Trigger</PopoverTrigger>
  </HStack>
  <PopoverContent>
    <PopoverArrow />
    <PopoverCloseButton />
    <PopoverHeader>Confirmation!</PopoverHeader>
    <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
  </PopoverContent>
</Popover>`;

const internalState = `<Popover closeOnBlur={false} placement="left" initialFocus="#close-btn">
  {({ opened, onClose }) => (
    <>
      <PopoverTrigger as={Button} variant="subtle" colorScheme="neutral">
        Click to {opened() ? "close" : "open"}
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>This is the header</PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>
          <Box>Hello. Nice to meet you! This is the body of the popover</Box>
          <Button id="close-btn" mt="$4" colorScheme="info" onClick={onClose}>
            Close
          </Button>
        </PopoverBody>
        <PopoverFooter>This is the footer</PopoverFooter>
      </PopoverContent>
    </>
  )}
</Popover>`;

const controlled = `function ControlledExample() {
  const { isOpen, onClose, onToggle } = createDisclosure();

  return (
    <>
      <Button variant="subtle" colorScheme="neutral" mr="$2" onClick={onToggle}>
        Trigger
      </Button>
      <Popover 
        placement="right" 
        opened={isOpen()} 
        onClose={onClose}
        closeOnBlur={false} 
      >
        <PopoverTrigger as={Button}>Popover Target</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Confirmation!</PopoverHeader>
          <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}`;

const composition = `<Popover offset={24}>
  <PopoverTrigger
    as={IconButton}
    icon={<IconMenu />}
    aria-label="trigger"
    variant="outline"
    colorScheme="accent"
  />
  <PopoverContent 
    borderColor="$accent3" 
    bg="$accent3" 
    color="$accent11" 
    maxW="$sm"
  >
    <PopoverHeader fontWeight="$semibold" border="none" pb="0">
      Confirmation!
    </PopoverHeader>
    <PopoverArrow borderColor="$accent3" boxSize="24px" />
    <PopoverCloseButton bg="$accent4" />
    <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
  </PopoverContent>
</Popover>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Popover: {
      baseStyle: {
        content: SystemStyleObject,
        arrow: SystemStyleObject,
        closeButton: SystemStyleObject,
        header: SystemStyleObject,
        body: SystemStyleObject,
        footer: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeablePopoverOptions,
        closeButton: ThemeableCloseButtonOptions,
      };
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  triggerOnHover,
  initialFocus,
  focusTrap,
  placement,
  anchor,
  internalState,
  controlled,
  composition,
  theming,
};
