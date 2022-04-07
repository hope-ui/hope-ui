const importComponent = `import { 
  Checkbox,
  CheckboxControl,
  CheckboxLabel,
  CheckboxGroup
} from "@hope-ui/solid"`;

const basicUsage = `<Checkbox defaultChecked>
  <CheckboxControl />
  <CheckboxLabel>Checkbox</CheckboxLabel>
</Checkbox>`;

const checkboxColors = `<HStack spacing="$4">
  <Checkbox defaultChecked colorScheme="primary">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="accent">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="neutral">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="success">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="info">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="warning">
    <CheckboxControl />
  </Checkbox>
  <Checkbox defaultChecked colorScheme="danger">
    <CheckboxControl />
  </Checkbox>
</HStack>`;

const checkboxSizes = `<HStack spacing="$4">
  <Checkbox defaultChecked size="sm">
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox defaultChecked size="md">
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox defaultChecked size="lg">
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
</HStack>`;

const checkboxVariants = `<HStack spacing="$4">
  <Checkbox variant="outline">
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox variant="filled">
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
</HStack>`;

const checkboxDisabled = `<HStack spacing="$4">
  <Checkbox disabled>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox variant="filled" disabled>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox defaultChecked disabled>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
</HStack>`;

const checkboxInvalid = `<HStack spacing="$4">
  <Checkbox invalid>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox variant="filled" invalid>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox defaultChecked invalid>
    <CheckboxControl />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
</HStack>`;

const checkboxIndeterminate = `function IndeterminateExample() {
  const [checkedItems, setCheckedItems] = createSignal([false, false]);

  const allChecked = () => checkedItems().every(Boolean);
  const isIndeterminate = () => checkedItems().some(Boolean) && !allChecked();
  
  return (
    <>
      <Checkbox
        checked={allChecked()}
        indeterminate={isIndeterminate()}
        onChange={e => setCheckedItems([e.target.checked, e.target.checked])}
      >
        <CheckboxControl />
        <CheckboxLabel>Parent Checkbox</CheckboxLabel>
      </Checkbox>
      <VStack alignItems="flex-start" pl="$6" mt="$1" spacing="$1">
        <Checkbox
          checked={checkedItems()[0]}
          onChange={e => setCheckedItems([e.target.checked, checkedItems()[1]])}
        >
          <CheckboxControl />
          <CheckboxLabel>Child Checkbox 1</CheckboxLabel>
        </Checkbox>
        <Checkbox
          checked={checkedItems()[1]}
          onChange={e => setCheckedItems([checkedItems()[0], e.target.checked])}
        >
          <CheckboxControl />
          <CheckboxLabel>Child Checkbox 2</CheckboxLabel>
        </Checkbox>
      </VStack>
    </>
  )
}`;

const checkboxCustomIcon = `<HStack spacing="$4">
  <Checkbox defaultChecked>
    <CheckboxControl iconChecked={<IconPlus />} />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
  <Checkbox indeterminate>
    <CheckboxControl iconIndeterminate={<IconQuestionMark />} />
    <CheckboxLabel>Checkbox</CheckboxLabel>
  </Checkbox>
</HStack>`;

const checkboxGroup = `<CheckboxGroup colorScheme="success" defaultValue={["luffy", "sanji"]}>
  <HStack spacing="$5">
    <Checkbox value="luffy">
      <CheckboxControl />
      <CheckboxLabel>Luffy</CheckboxLabel>
    </Checkbox>
    <Checkbox value="zoro">
      <CheckboxControl />
      <CheckboxLabel>Zoro</CheckboxLabel>
    </Checkbox>
    <Checkbox value="sanji">
      <CheckboxControl />
      <CheckboxLabel>Sanji</CheckboxLabel>
    </Checkbox>
  </HStack>
</CheckboxGroup>`;

const composition = `function CompositionExample() {
  const preferences = [
    {
      id: 1,
      name: "Comments",
      description: "Get notified when someones posts a comment on a posting.",
    },
    {
      id: 2,
      name: "Candidates",
      description: "Get notified when a candidate applies for a job.",
    },
    {
      id: 3,
      name: "Offers",
      description: "Get notified when a candidate accepts or rejects an offer.",
    },
  ];

  return (
    <CheckboxGroup>
      <VStack spacing="$4">
        <For each={preferences}>
          {preference => (
            <Checkbox
              value={preference.id}
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
                  <CheckboxLabel>
                    <VStack alignItems="flex-start">
                      <Text size="sm" fontWeight="$semibold">
                        {preference.name}
                      </Text>
                      <Text
                        size="sm"
                        color="$neutral11"
                        _groupChecked={{
                          color: "$whiteAlpha12",
                        }}
                      >
                        {preference.description}
                      </Text>
                    </VStack>
                  </CheckboxLabel>
                  <Center
                    rounded="$sm"
                    border="1px solid $neutral7"
                    bg="$whiteAlpha7"
                    boxSize="$5"
                    _groupChecked={{
                      borderColor: "transparent",
                    }}
                  >
                    <Show when={checked}>
                      <IconCheck boxSize="$4" />
                    </Show>
                  </Center>
                </HStack>
              )}
            </Checkbox>
          )}
        </For>
      </VStack>
    </CheckboxGroup>
  );
}`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Checkbox: {
      baseStyle: {
        root: SystemStyleObject,
        group: SystemStyleObject,
        control: SystemStyleObject,
        label: SystemStyleObject,
      },
      defaultProps: {
        root: ThemeableCheckboxOptions,
        group: ThemeableCheckboxOptions,
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  checkboxColors,
  checkboxSizes,
  checkboxVariants,
  checkboxDisabled,
  checkboxInvalid,
  checkboxIndeterminate,
  checkboxCustomIcon,
  checkboxGroup,
  composition,
  theming,
};
