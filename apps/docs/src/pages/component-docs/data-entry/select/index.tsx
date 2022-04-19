import {
  Alert,
  AlertDescription,
  Anchor,
  Box,
  Divider,
  hope,
  Kbd,
  ListItem,
  Select,
  SelectContent,
  SelectIcon,
  SelectLabel,
  SelectListbox,
  SelectOptGroup,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPlaceholder,
  SelectProps,
  SelectTrigger,
  SelectValue,
  SimpleOption,
  SimpleSelect,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { createSignal, For, onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconCaretDown } from "@/icons/IconCaretDown";

import { snippets } from "./snippets";

const frameworksWithTagline = [
  { id: 1, name: "React", tagLine: "A JavaScript library for building user interfaces" },
  { id: 2, name: "Angular", tagLine: "The modern web developer's platform" },
  { id: 3, name: "Vue", tagLine: "The progressive javaScript framework" },
  { id: 4, name: "Svelte", tagLine: "Cybernetically enhanced web apps" },
  {
    id: 5,
    name: "Solid",
    tagLine: "Simple and performant reactivity for building user interfaces",
  },
];

export default function SelectDoc() {
  const [controlledValue, setControlledValue] = createSignal("");
  const [controlledMultiValue, setControlledMultiValue] = createSignal<string[]>([]);

  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/radio",
    label: "Radio",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/switch",
    label: "Switch",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#sizes", label: "Trigger sizes", indent: true },
    { href: "#variants", label: "Trigger variants", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#default-value", label: "Default value", indent: true },
    { href: "#disabled-option", label: "Make an option disabled", indent: true },
    { href: "#option-group", label: "Option group", indent: true },
    { href: "#typeahead-complex-option", label: "Typeahead with complex option", indent: true },
    { href: "#controlled", label: "Controlled select", indent: true },
    { href: "#multi-select", label: "Multi select" },
    { href: "#multi-default-value", label: "Default values", indent: true },
    { href: "#multi-controlled", label: "Controlled multi-select", indent: true },
    { href: "#composition", label: "Composition" },
    { href: "#simple-select", label: "Simple select" },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#select-props", label: "Select props", indent: true },
    { href: "#select-option-props", label: "SelectOption props", indent: true },
    { href: "#select-value-props", label: "SelectValue props", indent: true },
    { href: "#select-icon-props", label: "SelectIcon props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const selectPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the select trigger.",
      type: '"outline" | "filled" | "unstyled"',
      defaultValue: '"outline"',
    },
    {
      name: "size",
      description: "The size of the select trigger.",
      type: '"xs" | "sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "offset",
      description: "Offset between the listbox and the reference (trigger) element.",
      type: "number",
    },
    {
      name: "id",
      description: "The `id` of the select.",
      type: "string",
    },
    {
      name: "multiple",
      description: "If `true`, allow multi-selection.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "value",
      description: "The value of the select (in controlled mode).",
      type: "string | number | (string | number)[]",
    },
    {
      name: "defaultValue",
      description: "The value of the select when initially rendered (in uncontrolled mode).",
      type: "string | number | (string | number)[]",
    },
    {
      name: "required",
      description: "If `true`, the select will be required.",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the select trigger will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the select trigger will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the select will be readonly.",
      type: "boolean",
    },
    {
      name: "onChange",
      description: "Callback invoked when the selected value changes (in controlled mode).",
      type: "(value: string | number | (string | number)[]) => void",
    },
    {
      name: "onFocus",
      description: "Callback invoked when the select trigger gain focus.",
      type: "JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>",
    },
    {
      name: "onBlur",
      description: "Callback invoked when the select trigger loose focus.",
      type: "JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>",
    },
  ];

  const selectOptionPropItems: PropsTableItem[] = [
    {
      required: true,
      name: "value",
      description: "The value of the option.",
      type: "string | number",
    },
    {
      name: "textValue",
      description:
        "Optional text used for typeahead purposes. By default the typeahead behavior will use the `.textContent` of the `SelectOption`. Use this when the content is complex, or you have non-textual content inside.",
      type: "string",
    },
    {
      name: "disabled",
      description: "If `true`, the option will be disabled.",
      type: "boolean",
    },
  ];

  const selectValuePropItems: PropsTableItem[] = [
    {
      name: "children",
      description:
        "A custom content to use in place of the select value. The array of selected options will be passed to the render prop.",
      type: "JSX.Element | (props: { selectedOptions: SelectOptionData[] }) => JSX.Element",
    },
  ];

  const selectIconPropItems: PropsTableItem[] = [
    {
      name: "rotateOnOpen",
      description: "If `true`, the icon will perform a 180deg rotation when the select is open",
      type: "boolean",
      defaultValue: "false",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Select</PageTitle>
      <Text mb="$5">
        <Code>Select</Code> component is a component that allows users pick a value from predefined
        options. Ideally, it should be used when there are more than 5 options, otherwise you might
        consider using a radio group instead.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Select:</strong> The wrapper component that provides context for all its children.
        </ListItem>
        <ListItem>
          <strong>SelectTrigger:</strong> The trigger that toggles the select.
        </ListItem>
        <ListItem>
          <strong>SelectPlaceholder:</strong> The component used to display a placeholder when no
          option is selected.
        </ListItem>
        <ListItem>
          <strong>SelectValue:</strong> The part that reflects the selected value in the trigger.
        </ListItem>
        <ListItem>
          <strong>SelectTag:</strong> The component used to display a selected value in a
          multi-select.
        </ListItem>
        <ListItem>
          <strong>SelectTagCloseButton:</strong> The button used to remove a selected option in a
          multi-select.
        </ListItem>
        <ListItem>
          <strong>SelectIcon:</strong> The container for the select dropdown icon.
        </ListItem>
        <ListItem>
          <strong>SelectContent:</strong> The component that pops out when the select is open.
        </ListItem>
        <ListItem>
          <strong>SelectListbox:</strong> The scrolling viewport that contains all of the options.
        </ListItem>
        <ListItem>
          <strong>SelectOptGroup:</strong> The component used to group multiple options.
        </ListItem>
        <ListItem>
          <strong>SelectLabel:</strong> The label of an options group.
        </ListItem>
        <ListItem>
          <strong>SelectOption:</strong> The component that contains a selectable option.
        </ListItem>
        <ListItem>
          <strong>SelectOptionText:</strong> The textual part of the option.
        </ListItem>
        <ListItem>
          <strong>SelectOptionIndicator:</strong> A visual indicator rendered when the option is
          selected.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Select>
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
      </Preview>
      <SectionSubtitle id="sizes">Trigger sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the <Code>SelectTrigger</Code>. You can
        set the value to <Code>xs</Code>, <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.triggerSizes} mb="$10">
        <VStack spacing="$4">
          <For each={["xs", "sm", "md", "lg"]}>
            {(size: SelectProps["size"]) => (
              <Select size={size}>
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
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="variants">Trigger variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the{" "}
        <Code>SelectTrigger</Code>. You can set the value to <Code>outline</Code>,{" "}
        <Code>filled</Code> or <Code>unstyled</Code>.
      </Text>
      <Preview snippet={snippets.triggerVariants} mb="$10">
        <VStack spacing="$4">
          <For each={["outline", "filled", "unstyled"]}>
            {(variant: SelectProps["variant"]) => (
              <Select variant={variant}>
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
            )}
          </For>
        </VStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Select.
      </Text>
      <Preview snippet={snippets.disabledState} mb="$10">
        <Select disabled>
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
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Select as invalid.
      </Text>
      <Preview snippet={snippets.invalidState} mb="$10">
        <Select invalid>
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
      </Preview>
      <SectionSubtitle id="default-value">Default value</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>defaultValue</Code> prop to make an option selected by default.
      </Text>
      <Preview snippet={snippets.defaultValue} mb="$10">
        <Select defaultValue="Solid">
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
      </Preview>
      <SectionSubtitle id="disabled-option">Make an option disabled</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop on <Code>SelectOption</Code> to make an option disabled.
      </Text>
      <Preview snippet={snippets.disabledOption} mb="$10">
        <Select>
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
        </Select>
      </Preview>
      <SectionSubtitle id="option-group">Option group</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>SelectOptGroup</Code> and <Code>SelectLabel</Code> to visualy group options.
      </Text>
      <Preview snippet={snippets.optionGroup} mb="$10">
        <Select>
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
        </Select>
      </Preview>
      <SectionSubtitle id="typeahead-complex-option">Typeahead with complex option</SectionSubtitle>
      <Text mb="$3">
        By default the typeahead behavior will use the <Code>.textContent</Code> of the{" "}
        <Code>SelectOption</Code>.
      </Text>
      <Text mb="$5">
        However, when the content is more complex than just a text, Use the <Code>textValue</Code>{" "}
        prop on <Code>SelectOption</Code> to define which text should be used for typeahead
        purposes.
      </Text>
      <Preview snippet={snippets.typeaheadComplexOption} mb="$10">
        <Select>
          <SelectTrigger>
            <SelectPlaceholder>Choose a framework</SelectPlaceholder>
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent>
            <SelectListbox maxH="$xs">
              <For each={frameworksWithTagline}>
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
      </Preview>
      <SectionSubtitle id="controlled">Controlled select</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>value</Code> and <Code>onChange</Code> props to control the select.
      </Text>
      <Preview snippet={snippets.controlled} mb="$12">
        <Text mb="$2">Value: {controlledValue()}</Text>
        <Select value={controlledValue()} onChange={setControlledValue}>
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
      </Preview>
      <SectionTitle id="multi-select">Multi select</SectionTitle>
      <Text mb="$5">
        Use the <Code>multiple</Code> prop to allow multi-selection.
      </Text>
      <Preview snippet={snippets.multiSelectBasicUsage} mb="$10">
        <Select multiple>
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
      </Preview>
      <SectionSubtitle id="multi-default-value">Default values</SectionSubtitle>
      <Text mb="$5">
        In a multi-select pass an array to the <Code>defaultValue</Code> prop to make some options
        selected by default.
      </Text>
      <Preview snippet={snippets.multiSelectDefaultValues} mb="$10">
        <Select multiple defaultValue={["React", "Solid"]}>
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
      </Preview>
      <SectionSubtitle id="multi-controlled">Controlled multi-select</SectionSubtitle>
      <Text mb="$5">
        In a multi-select <Code>value</Code> and <Code>onChange</Code> props uses arrays.
      </Text>
      <Preview snippet={snippets.multiSelectControlled} mb="$12">
        <Text mb="$2">Value: {JSON.stringify(controlledMultiValue())}</Text>
        <Select multiple value={controlledMultiValue()} onChange={setControlledMultiValue}>
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
      </Preview>
      <SectionTitle id="composition">Composition</SectionTitle>
      <Text mb="$5">
        <Code>Select</Code> is made up of several components that you can customize to achieve your
        desired design.
      </Text>
      <Preview snippet={snippets.composition} mb="$6">
        <Select multiple offset={-1}>
          <SelectTrigger rounded="$none" _focus={{ shadow: "$none", borderColor: "$warning7" }}>
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
            <SelectIcon as={IconCaretDown} rotateOnOpen boxSize="$6" color="$warning10" />
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
        </Select>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          Obviously, don't make ugly design like the above example 😅.
        </AlertDescription>
      </Alert>
      <SectionTitle id="simple-select">Simple select</SectionTitle>
      <Text mb="$5">
        If you don't need to customize every parts of <Code>Select</Code> and want a simpler API,
        Hope UI exposes the <Code>SimpleSelect</Code> and <Code>SimpleOption</Code> components.
        Those are just abstraction over the base <Code>Select</Code> component.
      </Text>
      <Preview snippet={snippets.simpleSelect} mb="$5">
        <SimpleSelect placeholder="Choose a framework">
          <SimpleOption value="react">React</SimpleOption>
          <SimpleOption value="angular" disabled>
            Angular
          </SimpleOption>
          <SimpleOption value="vue">Vue</SimpleOption>
          <SimpleOption value="svelte">Svelte</SimpleOption>
          <SimpleOption value="solid">Solid</SimpleOption>
        </SimpleSelect>
      </Preview>
      <Alert status="warning" mb="$12">
        <AlertDescription>
          If you want to build your own abstraction you can look at the{" "}
          <Anchor
            href="https://github.com/fabien-ml/hope-ui/tree/main/src/components/simple-select"
            external
            color="$primary11"
            fontWeight="$semibold"
          >
            SimpleSelect implementation
          </Anchor>
          .
        </AlertDescription>
      </Alert>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <Text mb="$5">
        <Code>Select</Code> follow the{" "}
        <Anchor
          href="https://www.w3.org/TR/wai-aria-practices-1.2/examples/combobox/combobox-select-only.html"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          WAI ARIA Select-Only Combobox
        </Anchor>{" "}
        design pattern.
      </Text>
      <SectionSubtitle>ARIA roles and attributes</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Code>SelectTrigger</Code> has <Code>role</Code> of <Code>combobox</Code>.
        </ListItem>
        <ListItem>
          <Code>SelectTrigger</Code> has <Code>aria-haspopup</Code> set to <Code>listbox</Code>.
        </ListItem>
        <ListItem>
          <Code>SelectTrigger</Code> has <Code>aria-controls</Code> set to the <Code>id</Code> of{" "}
          <Code>SelectListbox</Code>.
        </ListItem>
        <ListItem>
          <Code>SelectTrigger</Code> has <Code>aria-expanded</Code> set to <Code>true</Code> when
          the listbox is displayed and <Code>false</Code> otherwise.
        </ListItem>
        <ListItem>
          When the select is open, <Code>SelectTrigger</Code> has <Code>aria-activedescendant</Code>{" "}
          set to the <Code>id</Code> of the active <Code>SelectOption</Code>.
        </ListItem>
        <ListItem>
          <Code>SelectListbox</Code> has <Code>role</Code> of <Code>listbox</Code>.
        </ListItem>
        <ListItem>
          <Code>SelectOption</Code> has <Code>role</Code> of <Code>option</Code>.
        </ListItem>
        <ListItem>
          The selected <Code>SelectOption</Code> has <Code>aria-selected</Code> set to{" "}
          <Code>true</Code>.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (closed select)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Kbd>enter</Kbd>, <Kbd>space</Kbd> , <Kbd>↓</Kbd> and <Kbd>↑</Kbd> opens the select and
          move visual focus to the first option or the selected one.
        </ListItem>
        <ListItem>
          <Kbd>home</Kbd> open the select and move visual focus to the first option.
        </ListItem>
        <ListItem>
          <Kbd>end</Kbd> open the select and move visual focus to the last option.
        </ListItem>
        <ListItem>
          In multi-select, <Kbd>backspace</Kbd> remove the last selected option.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Keyboard support (opened select)</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$8">
        <ListItem>
          <Kbd>enter</Kbd>, <Kbd>space</Kbd> or <Kbd>alt</Kbd> + <Kbd>↑</Kbd> select the option and
          close the select.
        </ListItem>
        <ListItem>
          <Kbd>↓</Kbd> move visual focus to the next option.
        </ListItem>
        <ListItem>
          <Kbd>↑</Kbd> move visual focus to the previous option.
        </ListItem>
        <ListItem>
          <Kbd>home</Kbd> and <Kbd>pageup</Kbd> move visual focus to the first option.
        </ListItem>
        <ListItem>
          <Kbd>end</Kbd> and <Kbd>pagedown</Kbd> move visual focus to the last option.
        </ListItem>
        <ListItem>
          <Kbd>tab</Kbd> closes the select and moves focus to the next focusable element.
        </ListItem>
        <ListItem>
          <Kbd>esc</Kbd> closes the select.
        </ListItem>
        <ListItem>
          In multi-select, <Kbd>backspace</Kbd> remove the last selected option.
        </ListItem>
      </UnorderedList>
      <SectionSubtitle>Typeahead behavior</SectionSubtitle>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          Any printable characters move visual focus to the first option that matches the typed
          character.
        </ListItem>
        <ListItem>
          If multiple keys are typed in quick succession, visual focus moves to the first option
          that matches the full string.
        </ListItem>
        <ListItem>
          If the same character is typed in succession, visual focus cycles among the options
          starting with that character.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Select</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="select-props">Select props</SectionSubtitle>
      <PropsTable items={selectPropItems} mb="$10" />
      <SectionSubtitle id="select-option-props">SelectOption props</SectionSubtitle>
      <PropsTable items={selectOptionPropItems} mb="$10" />
      <SectionSubtitle id="select-value-props">SelectValue props</SectionSubtitle>
      <PropsTable items={selectValuePropItems} mb="$10" />
      <SectionSubtitle id="select-icon-props">SelectIcon props</SectionSubtitle>
      <PropsTable items={selectIconPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <Text>
        All other components composes{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>
        .
      </Text>
    </PageLayout>
  );
}
