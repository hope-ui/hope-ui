const importComponent = `import { 
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@hope-ui/solid"`;

const basicUsage = `function DrawerExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <Drawer
        opened={isOpen()}
        placement="right"
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <Input placeholder="Type here..." />
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr="$3" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}`;

const placement = `function PlacementExample() {
  const [placement, setPlacement] = createSignal<DrawerPlacement>("right");
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <RadioGroup
        defaultValue={placement()}
        onChange={value => setPlacement(value as DrawerPlacement)}
      >
        <HStack spacing="$4" mb="$4">
          <Radio value="top">Top</Radio>
          <Radio value="right">Right</Radio>
          <Radio value="bottom">Bottom</Radio>
          <Radio value="left">Left</Radio>
        </HStack>
      </RadioGroup>
      <Button onClick={onOpen}>Open</Button>
      <Drawer
        opened={isOpen()}
        placement={placement()}
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Basic Drawer</DrawerHeader>
          <DrawerBody>
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}`;

const initialFocus = `function InitialFocusExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button leftIcon={<IconPlus />} onClick={onOpen}>
        Create user
      </Button>
      <Drawer
        opened={isOpen()}
        initialFocus="#firstname" // Focus on the element with id \`firstname\`
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create user</DrawerHeader>

          <DrawerBody>
            <FormControl id="firstname" mb="$4">
              <FormLabel>First name</FormLabel>
              <Input placeholder="First name" />
            </FormControl>
            <FormControl id="lastname">
              <FormLabel>Last name</FormLabel>
              <Input placeholder="Last name" />
            </FormControl>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr="$3" onClick={onClose}>
              Cancel
            </Button>
            <Button>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}`;

const drawerSizes = `function SizeExample() {
  const [size, setSize] = createSignal<DrawerProps["size"]>("md");
  const { isOpen, onOpen, onClose } = createDisclosure()

  const handleClick = (newSize) => {
    setSize(newSize)
    onOpen()
  }

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full']

  return (
    <>
      <For each={sizes}>
        {size => (
          <Button 
            onClick={() => handleClick(size)} 
            m="$4"
          >
            {\`Open \${size} Drawer\`}
          </Button>
        )}
      </For>

      <Drawer isOpen={isOpen()} size={size()} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>{\`\${size()} drawer contents\`}</DrawerHeader>
          <DrawerBody>
            {size === 'full'
              ? \`You're trapped 😆 , refresh the page to leave or press 'Esc' key.\`
              : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}`;

const usingForm = `function FormExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open</Button>
      <Drawer isOpen={isOpen()} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <form
              id='my-form'
              onSubmit={(e) => {
                e.preventDefault()
                console.log('submitted')
              }}
            >
              <Input name='username' placeholder='Type here...' />
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button type='submit' form='my-form'>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Drawer: {
      baseStyle: {
        overlay: SystemStyleObject,
        content: SystemStyleObject,
        closeButton: SystemStyleObject,
        header: SystemStyleObject,
        body: SystemStyleObject,
        footer: SystemStyleObject
      },
      defaultProps: {
        root: ThemeableDrawerOptions,
        closeButton: ThemeableCloseButtonOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  placement,
  initialFocus,
  drawerSizes,
  usingForm,
  theming,
};
