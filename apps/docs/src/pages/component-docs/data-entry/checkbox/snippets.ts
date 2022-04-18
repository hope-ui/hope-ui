const importComponent = `import { 
  CheckboxPrimitive,
  CheckboxPrimitiveIndicator,
  Checkbox, 
  CheckboxGroup
} from "@hope-ui/design-system"`;

const basicUsage = `<Checkbox defaultChecked>Checkbox</Checkbox>`;

const checkboxColors = `<HStack spacing="$4">
  <Checkbox defaultChecked colorScheme="primary" />
  <Checkbox defaultChecked colorScheme="accent" />
  <Checkbox defaultChecked colorScheme="neutral" />
  <Checkbox defaultChecked colorScheme="success" />
  <Checkbox defaultChecked colorScheme="info" />
  <Checkbox defaultChecked colorScheme="warning" />
  <Checkbox defaultChecked colorScheme="danger" />
</HStack>`;

const checkboxSizes = `<HStack spacing="$4">
  <Checkbox defaultChecked size="sm">Checkbox</Checkbox>
  <Checkbox defaultChecked size="md">Checkbox</Checkbox>
  <Checkbox defaultChecked size="lg">Checkbox</Checkbox>
</HStack>`;

const checkboxVariants = `<HStack spacing="$4">
  <Checkbox variant="outline">Checkbox</Checkbox>
  <Checkbox variant="filled">Checkbox</Checkbox>
</HStack>`;

const checkboxLabelPlacement = `<HStack spacing="$4">
  <Checkbox LabelPlacement="start">Checkbox</Checkbox>
  <Checkbox LabelPlacement="end">Checkbox</Checkbox>
</HStack>`;

const checkboxDisabled = `<HStack spacing="$4">
  <Checkbox disabled>Checkbox</Checkbox>
  <Checkbox variant="filled" disabled>Checkbox</Checkbox>
  <Checkbox defaultChecked disabled>Checkbox</Checkbox>
</HStack>`;

const checkboxInvalid = `<HStack spacing="$4">
  <Checkbox invalid>Checkbox</Checkbox>
  <Checkbox variant="filled" invalid>Checkbox</Checkbox>
  <Checkbox defaultChecked invalid>Checkbox</Checkbox>
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
        Parent Checkbox
      </Checkbox>
      <VStack alignItems="flex-start" pl="$6" mt="$1" spacing="$1">
        <Checkbox
          checked={checkedItems()[0]}
          onChange={e => setCheckedItems([e.target.checked, checkedItems()[1]])}
        >
          Child Checkbox 1
        </Checkbox>
        <Checkbox
          checked={checkedItems()[1]}
          onChange={e => setCheckedItems([checkedItems()[0], e.target.checked])}
        >
          Child Checkbox 2
        </Checkbox>
      </VStack>
    </>
  )
}`;

const checkboxCustomIcon = `<HStack spacing="$4">
  <Checkbox defaultChecked iconChecked={<IconPlus />}>
    Checkbox
  </Checkbox>
  <Checkbox indeterminate iconIndeterminate={<IconQuestionMark />}>
    Checkbox
  </Checkbox>
</HStack>`;

const checkboxGroup = `<CheckboxGroup colorScheme="success" defaultValue={["luffy", "sanji"]}>
  <HStack spacing="$5">
    <Checkbox value="luffy">Luffy</Checkbox>
    <Checkbox value="zoro">Zoro</Checkbox>
    <Checkbox value="sanji">Sanji</Checkbox>
  </HStack>
</CheckboxGroup>`;

const headless = `import { css } from "@hope-ui/design-system"

const checkboxRootStyles = css({
  rounded: "$md",
  border: "1px solid $neutral7",
  shadow: "$sm",
  bg: "$loContrast",
  px: "$4",
  py: "$3",
  w: "$full",
  cursor: "pointer",

  _focus: {
    borderColor: "$info7",
    shadow: "0 0 0 3px $colors$info5",
  },

  _checked: {
    borderColor: "transparent",
    bg: "#0c4a6e",
    color: "white",
  },
});

const checkboxIndicatorStyles = css({
  rounded: "$sm",
  border: "1px solid $neutral7",
  bg: "$whiteAlpha7",
  boxSize: "$5",

  _groupChecked: {
    borderColor: "transparent",
  },
});

function HeadlessExample() {
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
            <CheckboxPrimitive 
              value={preference.id} 
              class={checkboxRootStyles()}
            >
              <HStack justifyContent="space-between" w="$full">
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
                <Center class={checkboxIndicatorStyles()}>
                  <CheckboxPrimitiveIndicator>
                    <IconCheck display="block" boxSize="$4" />
                  </CheckboxPrimitiveIndicator>
                </Center>
              </HStack>
            </CheckboxPrimitive>
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
  checkboxLabelPlacement,
  checkboxDisabled,
  checkboxInvalid,
  checkboxIndeterminate,
  checkboxCustomIcon,
  checkboxGroup,
  headless,
  theming,
};
