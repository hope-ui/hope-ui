const importComponent = `import { 
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  InputRightElement,
} from "@hope-ui/design-system"`;

const basicUsage = `<Input placeholder="Basic usage" />`;

const inputSizes = `<VStack spacing="$4">
  <Input placeholder="extra small size" size="xs" />
  <Input placeholder="small size" size="sm" />
  <Input placeholder="medium size" size="md" />
  <Input placeholder="large size" size="lg" />
</VStack>`;

const inputDomSize = `<Input htmlSize={4} width="auto" />`;

const inputVariants = `<VStack spacing="$4">
  <Input placeholder="Outline" variant="outline" />
  <Input placeholder="Filled" variant="filled" />
  <Input placeholder="Unstyled" variant="unstyled" />
</VStack>`;

const inputAddons = `<VStack spacing="$4">
  <InputGroup>
    <InputLeftAddon>+234</InputLeftAddon>
    <Input type="tel" placeholder="phone number" />
  </InputGroup>

  {/* 
    * If you add the size prop to \`InputGroup\`,
    * it'll pass it to all its children. 
    */}
  <InputGroup size="sm">
    <InputLeftAddon>https://</InputLeftAddon>
    <Input placeholder="mysite" />
    <InputRightAddon>.com</InputRightAddon>
  </InputGroup>
</VStack>`;

const inputElements = `<VStack spacing="$4">
  <InputGroup>
    <InputLeftElement pointerEvents="none">
      <IconPhone color="$neutral8" />
    </InputLeftElement>
    <Input type="tel" placeholder="Phone number" />
  </InputGroup>

  <InputGroup>
    <InputLeftElement 
      pointerEvents="none" 
      color="$neutral8" 
      fontSize="1.2em"
    >
      $
    </InputLeftElement>
    <Input placeholder="Enter amount" />
    <InputRightElement pointerEvents="none">
      <IconCheck boxSize="20px" color="$success9" />
    </InputRightElement>
  </InputGroup>
</VStack>`;

const inputDisabled = `<Input disabled placeholder="Here is a sample placeholder" />`;

const inputInvalid = `<Input invalid placeholder="Here is a sample placeholder" />`;

const controlledInput = `function Example() {
  const [value, setValue] = createSignal("");
  const handleInput = event => setValue(event.target.value);

  return (
    <>
      <Text mb="$2">Value: {value()}</Text>
      <Input
        value={value()}
        onInput={handleInput}
        placeholder="Here is a sample placeholder"
        size="sm"
      />
    </>
  )
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Input: {
      baseStyle: {
        input: SystemStyleObject,
        group: SystemStyleObject,
        element: SystemStyleObject,
        addon: SystemStyleObject,
      },
      defaultProps: {
        input: ThemeableInputOptions,
        group: ThemeableInputGroupOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  inputSizes,
  inputDomSize,
  inputVariants,
  inputAddons,
  inputElements,
  inputDisabled,
  inputInvalid,
  controlledInput,
  theming,
};
