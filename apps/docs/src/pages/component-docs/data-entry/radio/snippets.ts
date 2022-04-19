const importComponent = `import { 
  Radio, 
  RadioControl,
  RadioLabel,
  RadioGroup 
} from "@hope-ui/solid"`;

const basicUsage = `<RadioGroup defaultValue="1">
  <HStack spacing="$4">
    <Radio value="1">
      <RadioControl />
      <RadioLabel>First</RadioLabel>
    </Radio>
    <Radio value="2">
      <RadioControl />
      <RadioLabel>Second</RadioLabel>
    </Radio>
    <Radio value="3">
      <RadioControl />
      <RadioLabel>Third</RadioLabel>
    </Radio>
  </HStack>
</RadioGroup>`;

const radioColors = `<HStack spacing="$4">
  <Radio defaultChecked colorScheme="primary">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="accent">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="neutral">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="success">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="info">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="warning">
    <RadioControl />
  </Radio>
  <Radio defaultChecked colorScheme="danger">
    <RadioControl />
  </Radio>
</HStack>`;

const radioSizes = `<HStack spacing="$4">
  <Radio defaultChecked size="sm">
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio defaultChecked size="md">
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio defaultChecked size="lg">
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
</HStack>`;

const radioVariants = `<HStack spacing="$4">
  <Radio variant="outline">
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio variant="filled">
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
</HStack>`;

const radioDisabled = `<HStack spacing="$4">
  <Radio disabled>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio variant="filled" disabled>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio defaultChecked disabled>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
</HStack>`;

const radioInvalid = `<HStack spacing="$4">
  <Radio invalid>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio variant="filled" invalid>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
  <Radio defaultChecked invalid>
    <RadioControl />
    <RadioLabel>Radio</RadioLabel>
  </Radio>
</HStack>`;

const nameProp = `// Do this ✅
<RadioGroup name="form-name">
  <Radio>
    <RadioControl />
    <RadioLabel>Radio 1</RadioLabel>
  </Radio>
  <Radio>
    <RadioControl />
    <RadioLabel>Radio 2</RadioLabel>
  </Radio>
</RadioGroup>

// Don't do this ❌
<RadioGroup>
  <Radio name="form-name">
    <RadioControl />
    <RadioLabel>Radio 1</RadioLabel>
  </Radio>
  <Radio name="form-name">
    <RadioControl />
    <RadioLabel>Radio 2</RadioLabel>
  </Radio>
</RadioGroup>`;

const composition = `function CompositionExample() {
  const plans = [
    {
      id: 1,
      name: "Startup",
      ram: "12GB",
      cpus: "6 CPUs",
      disk: "160 GB SSD disk",
    },
    {
      id: 2,
      name: "Business",
      ram: "16GB",
      cpus: "8 CPUs",
      disk: "512 GB SSD disk",
    },
    {
      id: 3,
      name: "Enterprise",
      ram: "32GB",
      cpus: "12 CPUs",
      disk: "1024 GB SSD disk",
    },
  ];

  return (
    <RadioGroup defaultValue={plans[0].id}>
      <VStack spacing="$4">
        <For each={plans}>
          {plan => (
            <Radio
              value={plan.id}
              rounded="$md"
              border="1px solid $neutral7"
              shadow="$sm"
              bg="$loContrast"
              px="$4"
              py="$3"
              w="$full"
              _focus={{
                borderColor: "$info7",
                shadow: "0 0 0 3px $colors$info5",
              }}
              _checked={{
                borderColor: "transparent",
                bg: "#0c4a6e",
                color: "white",
              }}
            >
              {({ checked }) => (
                <HStack justifyContent="space-between" w="$full">
                  <RadioLabel>
                    <VStack alignItems="flex-start">
                      <Text size="sm" fontWeight="$semibold">
                        {plan.name}
                      </Text>
                      <Text
                        size="sm"
                        color="$neutral11"
                        _groupChecked={{
                          color: "$whiteAlpha12",
                        }}
                      >
                        {plan.ram}/{plan.cpus} - {plan.disk}
                      </Text>
                    </VStack>
                  </RadioLabel>
                  <Show when={checked}>
                    <Center rounded="$full" bg="$whiteAlpha7" p="$1">
                      <IconCheck boxSize="$6" />
                    </Center>
                  </Show>
                </HStack>
              )}
            </Radio>
          )}
        </For>
      </VStack>
    </RadioGroup>
  );
}`;

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
  radioDisabled,
  radioInvalid,
  nameProp,
  composition,
  theming,
};
