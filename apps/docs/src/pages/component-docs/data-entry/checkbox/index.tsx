import {
  Anchor,
  Center,
  Checkbox,
  CheckboxGroup,
  CheckboxPrimitive,
  CheckboxPrimitiveIndicator,
  css,
  HStack,
  ListItem,
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
import { IconCheck } from "@/icons/IconCheck";
import { IconPlus } from "@/icons/IconPlus";
import { IconQuestionMark } from "@/icons/IconQuestionMark";

import { snippets } from "./snippets";

const styledCheckboxRootStyles = css({
  rounded: "$md",
  border: "1px solid $neutral7",
  shadow: "$sm",
  bg: "$loContrast",
  px: "$4",
  py: "$3",
  w: "$full",
  cursor: "pointer",

  "&[data-focus]": {
    borderColor: "$info7",
    shadow: "0 0 0 3px $colors$info5",
  },

  "&[data-checked]": {
    borderColor: "transparent",
    bg: "#0c4a6e",
    color: "white",
  },
});

const styledCheckboxBoxStyles = css({
  rounded: "$sm",
  border: "1px solid $neutral7",
  bg: "$whiteAlpha7",
  boxSize: "$5",

  _groupChecked: {
    borderColor: "transparent",
  },
});

export default function CheckboxDoc() {
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

  const previousLink: ContextualNavLink = {
    href: "/docs/typography/text",
    label: "Text",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/form-control",
    label: "FormControl",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Checkbox colors", indent: true },
    { href: "#sizes", label: "Checkbox sizes", indent: true },
    { href: "#variants", label: "Checkbox variants", indent: true },
    { href: "#label-placement", label: "Checkbox label placement", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#indeterminate", label: "Indeterminate state", indent: true },
    { href: "#custom-icon", label: "Custom icon", indent: true },
    { href: "#checkbox-group", label: "CheckboxGroup", indent: true },
    { href: "#headless-api", label: "Headless API" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#checkbox-primitive-props", label: "CheckboxPrimitive props", indent: true },
    { href: "#checkbox-props", label: "Checkbox props", indent: true },
    { href: "#checkbox-group-props", label: "CheckboxGroup props", indent: true },
    { href: "#other-components-props", label: "Other components props", indent: true },
  ];

  const checkboxPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the checkbox.",
      type: '"outline" | "filled"',
      defaultValue: '"outline"',
    },
    {
      name: "colorScheme",
      description: "The color of the checkbox.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the checkbox.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "name",
      description: "The name of the input field in a checkbox (Useful for form submission).",
      type: "string",
    },
    {
      name: "value",
      description:
        "The value to be used in the checkbox input. This is the value that will be returned on form submission.",
      type: "string | number",
    },
    {
      name: "checked",
      description:
        "If `true`, the checkbox will be checked. You'll need to pass `onChange` to update its value (since it is now controlled).",
      type: "boolean",
    },
    {
      name: "defaultChecked",
      description: "If `true`, the checkbox will be initially checked.",
      type: "boolean",
    },
    {
      name: "indeterminate",
      description:
        "If `true`, the checkbox will be indeterminate. This only affects the icon shown inside checkbox and does not modify the checked property.",
      type: "boolean",
    },
    {
      name: "required",
      description: "If `true`, the checkbox is marked as required, and `required` attribute will be added",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the checkbox will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the checkbox will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the checkbox will be readonly.",
      type: "boolean",
    },
    {
      name: "children",
      description: "The children of the checkbox. If used as a render props, the internal state will be passed.",
      type: "JSX.Element | (props: { state: Accessor<CheckboxState> }) => JSX.Element",
    },
    {
      name: "onChange",
      description: "The callback invoked when the checked state of the `Checkbox` changes.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, Event>",
    },
    {
      name: "onFocus",
      description: "The callback invoked when the checkbox is focused.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
    {
      name: "onBlur",
      description: "The callback invoked when the checkbox is blurred (loses focus).",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
  ];

  const checkboxControlPropItems: PropsTableItem[] = [
    {
      name: "iconChecked",
      description: "The icon to use when the checkbox is checked.",
      type: "JSX.Element",
    },
    {
      name: "iconIndeterminate",
      description: "The icon to use when the checkbox is in indeterminate state.",
      type: "JSX.Element",
    },
  ];
  const checkboxGroupPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the checkboxes.",
      type: '"outline" | "filled"',
      defaultValue: '"outline"',
    },
    {
      name: "colorScheme",
      description: "The color of the checkboxes.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the checkboxes.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "name",
      description: "The `name` attribute forwarded to each `checkbox` element.",
      type: "string",
    },
    {
      name: "value",
      description: "The value of the checkbox group (in controlled mode).",
      type: "(string | number)[]",
    },
    {
      name: "defaultValue",
      description: "The initial value of the checkbox group (in uncontrolled mode).",
      type: "(string | number)[]",
    },
    {
      name: "required",
      description:
        "If `true`, all wrapped checkbox inputs will be marked as required, and `required` attribute will be added.",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, all wrapped checkbox inputs will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, all wrapped checkbox inputs will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, all wrapped checkbox inputs will be readonly.",
      type: "boolean",
    },
    {
      name: "onChange",
      description: "The callback invoked when a checkbox is checked.",
      type: "(value: (string | number)[]) => void",
    },
  ];

  const [checkedItems, setCheckedItems] = createSignal([false, false]);

  const allChecked = () => checkedItems().every(Boolean);
  const isIndeterminate = () => checkedItems().some(Boolean) && !allChecked();

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Checkbox</PageTitle>
      <Text mb="$5">
        The <Code>Checkbox</Code> component is used in forms when a user needs to select multiple values from several
        options.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>CheckboxPrimitive:</strong> Unstyled component containing all the parts of a checkbox. It renders a{" "}
          <Code>label</Code> and a visualy hidden <Code>input</Code> with type set to <Code>checkbox</Code>.
        </ListItem>
        <ListItem>
          <strong>CheckboxPrimitiveIndicator:</strong> Unstyled component rendered when the{" "}
          <Code>CheckboxPrimitive</Code> is in a <Code>checked</Code> or <Code>indeterminate</Code> state.
        </ListItem>
        <ListItem>
          <strong>Checkbox:</strong> The Hope UI styled checkbox component based on <Code>CheckboxPrimitive</Code>.
        </ListItem>
        <ListItem>
          <strong>CheckboxGroup:</strong> Component to help manage the checked state of its children{" "}
          <Code>Checkbox</Code> components and conveniently pass a few shared style props to each.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Checkbox defaultChecked>Checkbox</Checkbox>
      </Preview>
      <SectionSubtitle id="colors">Checkbox colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Checkbox. You can set the value to{" "}
        <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>, <Code>success</Code>, <Code>info</Code>,{" "}
        <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.checkboxColors} mb="$10">
        <HStack spacing="$4">
          <Checkbox defaultChecked colorScheme="primary" />
          <Checkbox defaultChecked colorScheme="accent" />
          <Checkbox defaultChecked colorScheme="neutral" />
          <Checkbox defaultChecked colorScheme="success" />
          <Checkbox defaultChecked colorScheme="info" />
          <Checkbox defaultChecked colorScheme="warning" />
          <Checkbox defaultChecked colorScheme="danger" />
        </HStack>
      </Preview>
      <SectionSubtitle id="sizes">Checkbox sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Checkbox. You can set the value to <Code>sm</Code>,{" "}
        <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.checkboxSizes} mb="$10">
        <HStack spacing="$4">
          <Checkbox defaultChecked size="sm">
            Checkbox
          </Checkbox>
          <Checkbox defaultChecked size="md">
            Checkbox
          </Checkbox>
          <Checkbox defaultChecked size="lg">
            Checkbox
          </Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="variants">Checkbox variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Checkbox. You can set the value to{" "}
        <Code>outline</Code> or <Code>filled</Code>.
      </Text>
      <Preview snippet={snippets.checkboxVariants} mb="$10">
        <HStack spacing="$4">
          <Checkbox variant="outline">Checkbox</Checkbox>
          <Checkbox variant="filled">Checkbox</Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="label-placement">Checkbox label placement</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>labelPlacement</Code> prop to change the placement of the label. You can set the value to{" "}
        <Code>start</Code> or <Code>end</Code>.
      </Text>
      <Preview snippet={snippets.checkboxLabelPlacement} mb="$10">
        <HStack spacing="$4">
          <Checkbox labelPlacement="start">Checkbox</Checkbox>
          <Checkbox labelPlacement="end">Checkbox</Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Checkbox.
      </Text>
      <Preview snippet={snippets.checkboxDisabled} mb="$10">
        <HStack spacing="$4">
          <Checkbox disabled>Checkbox</Checkbox>
          <Checkbox variant="filled" disabled>
            Checkbox
          </Checkbox>
          <Checkbox defaultChecked disabled>
            Checkbox
          </Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Checkbox as invalid.
      </Text>
      <Preview snippet={snippets.checkboxInvalid} mb="$10">
        <HStack spacing="$4">
          <Checkbox invalid>Checkbox</Checkbox>
          <Checkbox variant="filled" invalid>
            Checkbox
          </Checkbox>
          <Checkbox defaultChecked invalid>
            Checkbox
          </Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="indeterminate">Indeterminate state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>indeterminate</Code> prop to mark the Checkbox as indeterminate.
      </Text>
      <Preview snippet={snippets.checkboxIndeterminate} mb="$10">
        <Checkbox
          checked={allChecked()}
          indeterminate={isIndeterminate()}
          onChange={(e: Event) =>
            setCheckedItems([(e.target as HTMLInputElement).checked, (e.target as HTMLInputElement).checked])
          }
        >
          Parent Checkbox
        </Checkbox>
        <VStack alignItems="flex-start" pl="$6" mt="$1" spacing="$1">
          <Checkbox
            checked={checkedItems()[0]}
            onChange={(e: Event) => setCheckedItems([(e.target as HTMLInputElement).checked, checkedItems()[1]])}
          >
            Child Checkbox 1
          </Checkbox>
          <Checkbox
            checked={checkedItems()[1]}
            onChange={(e: Event) => setCheckedItems([checkedItems()[0], (e.target as HTMLInputElement).checked])}
          >
            Child Checkbox 2
          </Checkbox>
        </VStack>
      </Preview>
      <SectionSubtitle id="custom-icon">Custom icon</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>iconChecked</Code> and <Code>iconIndeterminate</Code> prop on <Code>CheckboxControl</Code> to
        change the Checkbox icon.
      </Text>
      <Preview snippet={snippets.checkboxCustomIcon} mb="$12">
        <HStack spacing="$4">
          <Checkbox defaultChecked iconChecked={<IconPlus />}>
            Checkbox
          </Checkbox>
          <Checkbox indeterminate iconIndeterminate={<IconQuestionMark />}>
            Checkbox
          </Checkbox>
        </HStack>
      </Preview>
      <SectionSubtitle id="checkbox-group">CheckboxGroup</SectionSubtitle>
      <Text mb="$5">
        You can use the <Code>CheckboxGroup</Code> component to manage the checked state of related{" "}
        <Code>Checkbox</Code> components and conveniently pass a few shared style props to each. See the props table at
        the bottom of this page for a list of the shared styling props.
      </Text>
      <Preview snippet={snippets.checkboxGroup} mb="$12">
        <CheckboxGroup colorScheme="success" defaultValue={["luffy", "sanji"]}>
          <HStack spacing="$5">
            <Checkbox value="luffy">Luffy</Checkbox>
            <Checkbox value="zoro">Zoro</Checkbox>
            <Checkbox value="sanji">Sanji</Checkbox>
          </HStack>
        </CheckboxGroup>
      </Preview>{" "}
      <SectionTitle id="headless-api">Headless API</SectionTitle>
      <Text mb="$5">
        Use the unstyled <Code>CheckboxPrimitive</Code> component to achieve your desired design. You can pair it with
        your styling solution of choice. The below example uses both Hope UI styles props and Stitches.
      </Text>
      <Preview snippet={snippets.headless} mb="$12">
        <CheckboxGroup>
          <VStack spacing="$4">
            <For each={preferences}>
              {preference => (
                <CheckboxPrimitive value={preference.id} class={styledCheckboxRootStyles()}>
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
                    <Center class={styledCheckboxBoxStyles()}>
                      <CheckboxPrimitiveIndicator>
                        <IconCheck boxSize="$4" />
                      </CheckboxPrimitiveIndicator>
                    </Center>
                  </HStack>
                </CheckboxPrimitive>
              )}
            </For>
          </VStack>
        </CheckboxGroup>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Checkbox</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="checkbox-props">Checkbox props</SectionSubtitle>
      <PropsTable items={checkboxPropItems} mb="$10" />
      <SectionSubtitle id="checkbox-control-props">CheckboxControl props</SectionSubtitle>
      <PropsTable items={checkboxControlPropItems} mb="$10" />
      <SectionSubtitle id="checkbox-group-props">CheckboxGroup props</SectionSubtitle>
      <PropsTable items={checkboxGroupPropItems} mb="$10" />
      <SectionSubtitle id="other-components-props">Other components props</SectionSubtitle>
      <Text>
        <Code>CheckboxLabel</Code> composes{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>
        .
      </Text>
    </PageLayout>
  );
}
