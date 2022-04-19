const importComponent = `import { 
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@hope-ui/solid"`;

const basicUsage = `function ModalExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const blockScroll = `function BlockScrollExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal
        blockScrollOnMount={false}
        opened={isOpen()}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <Text fontWeight="$bold">
              You can scroll the content behind the modal
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const initialFocus = `function InitialFocusExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal
        opened={isOpen()}
        initialFocus="#firstname"  // Focus on the element with id \`firstname\`
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Create your account</ModalHeader>
          <ModalBody>
            <FormControl id="firstname" mb="$4">
              <FormLabel>First name</FormLabel>
              <Input placeholder="First name" />
            </FormControl>
            <FormControl id="lastname">
              <FormLabel>Last name</FormLabel>
              <Input placeholder="Last name" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const closeOnOverlayClick = `function CloseOnOverlayClickExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal
        closeOnOverlayClick={false}
        opened={isOpen()}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const centered = `function CenteredExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal centered opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const transition = `function TransitionExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal 
        motionPreset="fade-in-bottom" 
        opened={isOpen()} 
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const overflow = `function OverflowExample() {
  const [scrollBehavior, setScrollBehavior] = createSignal("inside");
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <RadioGroup value={scrollBehavior()} onChange={setScrollBehavior}>
        <HStack spacing="$4" mb="$4">
          <Radio value="inside">
            <RadioControl />
            <RadioLabel>Inside</RadioLabel>
          </Radio>
          <Radio value="outside">
            <RadioControl />
            <RadioLabel>Outside</RadioLabel>
          </Radio>
        </HStack>
      </RadioGroup>

      <Button onClick={onOpen}>Open Modal</Button>
      <Modal 
        scrollBehavior={scrollBehavior()}
        opened={isOpen()} 
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Lorem ipsum...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const sizes = `function SizeExample() {
  const [size, setSize] = createSignal<ModalProps["size"]>("md");
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
            {\`Open \${size} Modal\`}
          </Button>
        )}
      </For>

      <Modal size={size()} opened={isOpen()} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const trapFocus = `function TrapFocusExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal 
        trapFocus={false}
        opened={isOpen()} 
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <Text fontWeight="$bold">
              You can focus on the content behind the modal
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const backdropStyle = `function BackdropStyleExample() {
  const { isOpen, onOpen, onClose } = createDisclosure()

  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>
      <Modal opened={isOpen()} onClose={onClose}>
        <ModalOverlay
          bg="$blackAlpha3"
          css={{
            backdropFilter: "blur(10px) hue-rotate(90deg)",
          }}
        />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Modal Title</ModalHeader>
          <ModalBody>
            <p>Some contents...</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Modal: {
      baseStyle: {
        overlay: SystemStyleObject,
        content: SystemStyleObject,
        closeButton: SystemStyleObject,
        header: SystemStyleObject,
        body: SystemStyleObject,
        footer: SystemStyleObject
      },
      defaultProps: {
        root: ThemeableModalOptions,
        closeButton: ThemeableCloseButtonOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  blockScroll,
  initialFocus,
  closeOnOverlayClick,
  centered,
  transition,
  overflow,
  sizes,
  trapFocus,
  backdropStyle,
  theming,
};
