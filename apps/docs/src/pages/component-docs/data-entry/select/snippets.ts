const importComponent = `import { 
  Select,
  SelectTrigger,
  SelectPlaceholder,
  SelectValue,
  SelectTag,
  SelectTagCloseButton,
  SelectIcon,
  SelectContent,
  SelectListbox,
  SelectOptGroup,
  SelectLabel,
  SelectOption,
  SelectOptionText,
  SelectOptionIndicator,
} from "@hope-ui/solid"`;

const basicUsage = `<Select>
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const triggerSizes = `<VStack spacing="$4">
  <Select size="xs">...</Select>
  <Select size="sm">...</Select>
  <Select size="md">...</Select>
  <Select size="lg">...</Select>
</VStack>`;

const triggerVariants = `<VStack spacing="$4">
  <Select variant="outline">...</Select>
  <Select variant="filled">...</Select>
  <Select variant="unstyled">...</Select>
</VStack>`;

const disabledState = `<Select disabled>
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const invalidState = `<Select invalid>
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const defaultValue = `<Select defaultValue="Solid">
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const disabledOption = `<Select>
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item} disabled={item === "Angular"}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const optionGroup = `<Select>
  <SelectTrigger>
    <SelectPlaceholder>Choose a framework</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox maxH="$96">
      <SelectOptGroup>
        <SelectLabel>Old school</SelectLabel>
        <For each={["React", "Angular", "Vue"]}>
          {item => (
            <SelectOption value={item}>
              <SelectOptionText>{item}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          )}
        </For>
      </SelectOptGroup>
      <SelectOptGroup>
        <SelectLabel>New school</SelectLabel>
        <For each={["Svelte", "Solid"]}>
          {item => (
            <SelectOption value={item}>
              <SelectOptionText>{item}</SelectOptionText>
              <SelectOptionIndicator />
            </SelectOption>
          )}
        </For>
      </SelectOptGroup>
    </SelectListbox>
  </SelectContent>
</Select>`;

const typeaheadComplexOption = `const frameworks = [
  { 
    id: 1,
    name: "React", 
    tagLine: "A JavaScript library for building user interfaces" 
  },
  { 
    id: 2, 
    name: "Angular", 
    tagLine: "The modern web developer's platform" 
  },
  { 
    id: 3, 
    name: "Vue", 
    tagLine: "The progressive javaScript framework" 
  },
  { 
    id: 4, 
    name: "Svelte",
     tagLine: "Cybernetically enhanced web apps"
  },
  {
    id: 5,
    name: "Solid",
    tagLine: "Simple and performant reactivity for building user interfaces",
  },
];

function ComplexTypeaheadExample() {
  return (
    <Select>
      <SelectTrigger>
        <SelectPlaceholder>Choose a framework</SelectPlaceholder>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectListbox maxH="$xs">
          <For each={frameworks}>
            {item => (
              <SelectOption value={item.id} textValue={item.name} px="$3" py="$1">
                <VStack alignItems="flex-start">
                  <Text>{item.name}</Text>
                  <Text size="sm" color="$neutral11">
                    {item.tagLine}
                  </Text>
                </VStack>
                <SelectOptionIndicator />
              </SelectOption>
            )}
          </For>
        </SelectListbox>
      </SelectContent>
    </Select>
  )
}`;

const controlled = `function Example() {
  const [value, setValue] = createSignal("");

  return (
    <>
      <Text mb="$2">Value: {value()}</Text>
      <Select value={value()} onChange={setValue}>
        <SelectTrigger>
          <SelectPlaceholder>Choose a framework</SelectPlaceholder>
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectListbox>
            <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
              {item => (
                <SelectOption value={item}>
                  <SelectOptionText>{item}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              )}
            </For>
          </SelectListbox>
        </SelectContent>
      </Select>
    </>
  )
}`;

const multiSelectBasicUsage = `<Select multiple>
  <SelectTrigger>
    <SelectPlaceholder>Choose some frameworks</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const multiSelectDefaultValues = `<Select multiple defaultValue={["React", "Solid"]}>
  <SelectTrigger>
    <SelectPlaceholder>Choose some frameworks</SelectPlaceholder>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectListbox>
      <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
        {item => (
          <SelectOption value={item}>
            <SelectOptionText>{item}</SelectOptionText>
            <SelectOptionIndicator />
          </SelectOption>
        )}
      </For>
    </SelectListbox>
  </SelectContent>
</Select>`;

const multiSelectControlled = `function Example() {
  const [value, setValue] = createSignal([]);

  return (
    <>
      <Text mb="$2">Value: {JSON.stringify(value())}</Text>
      <Select multiple value={value()} onChange={setValue}>
        <SelectTrigger>
          <SelectPlaceholder>Choose some frameworks</SelectPlaceholder>
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent>
          <SelectListbox>
            <For each={["React", "Angular", "Vue", "Svelte", "Solid"]}>
              {item => (
                <SelectOption value={item}>
                  <SelectOptionText>{item}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              )}
            </For>
          </SelectListbox>
        </SelectContent>
      </Select>
    </>
  )
}`;

const simpleSelect = `<SimpleSelect placeholder="Choose a framework">
  <SimpleOption value="react">React</SimpleOption>
  <SimpleOption value="angular" disabled>Angular</SimpleOption>
  <SimpleOption value="vue">Vue</SimpleOption>
  <SimpleOption value="svelte">Svelte</SimpleOption>
  <SimpleOption value="solid">Solid</SimpleOption>
</SimpleSelect>`;

const composition = `<Select multiple offset={-1}>
  <SelectTrigger 
    rounded="$none" 
    _focus={{ 
      shadow: "$none", 
      borderColor: "$warning7" 
    }}
  >
    <SelectPlaceholder color="$neutral12" fontSize="$sm">
      Choose some frameworks
    </SelectPlaceholder>
    <SelectValue>
      {({ selectedOptions }) => (
        <hope.span fontSize="$sm">
          {selectedOptions
            .map(option => option.textValue)
            .join(", ")
            .trim()}
        </hope.span>
      )}
    </SelectValue>
    <SelectIcon 
      as={IconCaretDown} 
      rotateOnOpen 
      boxSize="$6" 
      color="$warning10" 
    />
  </SelectTrigger>
  <SelectContent rounded="$none" shadow="$xl" borderColor="$warning7">
    <Box px="$3" py="$2">
      You can put a header here
    </Box>
    <Divider />
    <SelectListbox px="0" py="$1" maxH="$96">
      <SelectOptGroup>
        <SelectLabel>Old school</SelectLabel>
        <For each={["React", "Angular", "Vue"]}>
          {option => (
            <SelectOption
              value={option}
              rounded="$none"
              fontSize="$sm"
              _active={{ bg: "$warning3", color: "$warning11" }}
              _selected={{ bg: "$warning9", color: "white" }}
            >
              <SelectOptionText _groupSelected={{ fontWeight: "$medium" }}>
                {option}
              </SelectOptionText>
            </SelectOption>
          )}
        </For>
      </SelectOptGroup>
      <SelectOptGroup>
        <SelectLabel>New school</SelectLabel>
        <For each={["Svelte", "Solid"]}>
          {option => (
            <SelectOption
              value={option}
              rounded="$none"
              fontSize="$sm"
              _active={{ bg: "$warning3", color: "$warning11" }}
              _selected={{ bg: "$warning9", color: "white" }}
            >
              <SelectOptionText _groupSelected={{ fontWeight: "$medium" }}>
                {option}
              </SelectOptionText>
            </SelectOption>
          )}
        </For>
      </SelectOptGroup>
    </SelectListbox>
    <Divider />
    <Box px="$3" py="$2">
      Or put a footer here
    </Box>
  </SelectContent>
</Select>`;

const theming = `const config: HopeThemeConfig = {
  components: {
    Select: {
      baseStyle: {
        trigger: SystemStyleObject
        placeholder: SystemStyleObject
        singleValue: SystemStyleObject
        multiValue: SystemStyleObject
        tag: SystemStyleObject
        tagCloseButton: SystemStyleObject
        icon: SystemStyleObject
        content: SystemStyleObject
        listbox: SystemStyleObject
        optgroup: SystemStyleObject
        label: SystemStyleObject
        option: SystemStyleObject
        optionText: SystemStyleObject
        optionIndicator: SystemStyleObject
      },
      defaultProps: {
        root: ThemeableSelectOptions
      }
    }
  }
}`;

export const snippets = {
  importComponent,
  basicUsage,
  triggerSizes,
  triggerVariants,
  disabledState,
  invalidState,
  defaultValue,
  disabledOption,
  optionGroup,
  typeaheadComplexOption,
  controlled,
  multiSelectBasicUsage,
  multiSelectDefaultValues,
  multiSelectControlled,
  simpleSelect,
  composition,
  theming,
};
