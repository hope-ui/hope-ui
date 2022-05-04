const importComponent = `import { Radio, RadioGroup } from "@hope-ui/solid"`;

const basicUsage = `<RadioGroup defaultValue="1">
  <HStack spacing="$4">
    <Radio value="1">First</Radio>
    <Radio value="2">Second</Radio>
    <Radio value="3">Third</Radio>
  </HStack>
</RadioGroup>`;

const radioColors = `<HStack spacing="$4">
  <Radio defaultChecked colorScheme="primary" />
  <Radio defaultChecked colorScheme="accent" />
  <Radio defaultChecked colorScheme="neutral" />
  <Radio defaultChecked colorScheme="success" />
  <Radio defaultChecked colorScheme="info" />
  <Radio defaultChecked colorScheme="warning" />
  <Radio defaultChecked colorScheme="danger" />
</HStack>`;

const radioSizes = `<HStack spacing="$4">
  <Radio defaultChecked size="sm">Radio</Radio>
  <Radio defaultChecked size="md">Radio</Radio>
  <Radio defaultChecked size="lg">Radio</Radio>
</HStack>`;

const radioVariants = `<HStack spacing="$4">
  <Radio variant="outline">Radio</Radio>
  <Radio variant="filled">Radio</Radio>
</HStack>`;

const radioLabelPlacement = `<HStack spacing="$4">
  <Radio LabelPlacement="start">Radio</Radio>
  <Radio LabelPlacement="end">Radio</Radio>
</HStack>`;

const radioDisabled = `<HStack spacing="$4">
  <Radio disabled>Radio</Radio>
  <Radio variant="filled" disabled>Radio</Radio>
  <Radio defaultChecked disabled>Radio</Radio>
</HStack>`;

const radioInvalid = `<HStack spacing="$4">
  <Radio invalid>Radio</Radio>
  <Radio variant="filled" invalid>Radio</Radio>
  <Radio defaultChecked invalid>Radio</Radio>
</HStack>`;

const nameProp = `// Do this ✅
<RadioGroup name="form-name">
  <Radio>Radio 1</Radio>
  <Radio>Radio 2</Radio>
</RadioGroup>

// Don't do this ❌
<RadioGroup>
  <Radio name="form-name">Radio 2</Radio>
  <Radio name="form-name">Radio 2</Radio>
</RadioGroup>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Radio: {
      baseStyle: {
        root: SystemStyleObject,
        group: SystemStyleObject,
        control: SystemStyleObject,
        label: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableRadioOptions,
        group: ThemeableRadioOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  radioColors,
  radioSizes,
  radioVariants,
  radioLabelPlacement,
  radioDisabled,
  radioInvalid,
  nameProp,
  theming,
};
