const importComponent = `import { Textarea } from "@hope-ui/solid"`;

const basicUsage = `<Textarea placeholder="Basic usage" />`;

const textareaSizes = `<VStack spacing="$4">
  <Textarea placeholder="extra small size" size="xs" />
  <Textarea placeholder="small size" size="sm" />
  <Textarea placeholder="medium size" size="md" />
  <Textarea placeholder="large size" size="lg" />
</VStack>`;

const textareaVariants = `<VStack spacing="$4">
  <Textarea placeholder="Outline" variant="outline" />
  <Textarea placeholder="Filled" variant="filled" />
  <Textarea placeholder="Unstyled" variant="unstyled" />
</VStack>`;

const textareaDisabled = `<Textarea disabled placeholder="Here is a sample placeholder" />`;

const textareaInvalid = `<Textarea invalid placeholder="Here is a sample placeholder" />`;

const controlledTextarea = `function Example() {
  const [value, setValue] = createSignal("");
  const handleInput = event => setValue(event.target.value);

  return (
    <>
      <Text mb="$2">Value: {value()}</Text>
      <Textarea
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
    Textarea: {
      baseStyle: SystemStyleObject,
      defaultProps: ThemeableTextareaOptions
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  textareaSizes,
  textareaVariants,
  textareaDisabled,
  textareaInvalid,
  controlledTextarea,
  theming,
};
