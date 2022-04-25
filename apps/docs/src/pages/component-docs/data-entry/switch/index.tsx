import {
  Anchor,
  Box,
  css,
  HStack,
  ListItem,
  Switch,
  SwitchPrimitive,
  SwitchPrimitiveThumb,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

const switchRootClass = css({
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid $neutral7",
  rounded: "$sm",
  px: "$5",
  py: "$3",
  w: "$full",
  cursor: "pointer",
  userSelect: "none",
  transition: "box-shadow 250ms",

  _focus: {
    borderColor: "$primary7",
    shadow: "0 0 0 3px $colors$primary5",
  },
});

const switchControlClass = css({
  all: "unset",
  width: 34,
  height: 12,
  backgroundColor: "$blackAlpha9",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: "0 2px 10px $colors$blackAlpha7",
  transition: "background-color 250ms",

  _groupChecked: {
    backgroundColor: "$primary9",
  },
});

const switchThumbClass = css({
  display: "block",
  width: 20,
  height: 20,
  backgroundColor: "white",
  borderRadius: "9999px",
  boxShadow: "0 0 2px $colors$blackAlpha7",
  transition: "transform 250ms",
  transform: "translate(-4px, -4px)",
  willChange: "transform",

  _checked: {
    transform: "translate(16px, -4px)",
  },
});

export default function SwitchDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-entry/select",
    label: "Select",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-entry/textarea",
    label: "Textarea",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#colors", label: "Switch colors", indent: true },
    { href: "#sizes", label: "Switch sizes", indent: true },
    { href: "#variants", label: "Switch variants", indent: true },
    { href: "#label-placement", label: "Switch label placement", indent: true },
    { href: "#disabled", label: "Disabled state", indent: true },
    { href: "#invalid", label: "Invalid state", indent: true },
    { href: "#headless-api", label: "Headless API" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#switch-primitive-props", label: "SwitchPrimitive props", indent: true },
    { href: "#switch-props", label: "Switch props", indent: true },
  ];

  const switchPrimitivePropItems: PropsTableItem[] = [
    {
      name: "id",
      description: "The id to be passed to the internal <input> tag.",
      type: "string",
    },
    {
      name: "name",
      description: "The name to be passed to the internal <input> tag.",
      type: "string",
    },
    {
      name: "value",
      description:
        "The value to be used in the switch input. This is the value that will be returned on form submission.",
      type: "string | number",
    },
    {
      name: "checked",
      description:
        "If `true`, the switch will be checked. You'll need to pass `onChange` to update its value (since it is now controlled).",
      type: "boolean",
    },
    {
      name: "defaultChecked",
      description: "If `true`, the switch will be initially checked.",
      type: "boolean",
    },
    {
      name: "required",
      description:
        "If `true`, the switch is marked as required, and `required` attribute will be added",
      type: "boolean",
    },
    {
      name: "disabled",
      description: "If `true`, the switch will be disabled.",
      type: "boolean",
    },
    {
      name: "invalid",
      description: "If `true`, the switch will have `aria-invalid` set to `true`.",
      type: "boolean",
    },
    {
      name: "readOnly",
      description: "If `true`, the switch will be readonly.",
      type: "boolean",
    },
    {
      name: "children",
      description:
        "The children of the switch. If used as a render props, the internal state will be passed.",
      type: "JSX.Element | (props: { state: Accessor<SwitchState> }) => JSX.Element",
    },
    {
      name: "onChange",
      description: "The callback invoked when the checked state of the `Switch` changes.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, Event>",
    },
    {
      name: "onFocus",
      description: "The callback invoked when the switch is focused.",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
    {
      name: "onBlur",
      description: "The callback invoked when the switch is blurred (loses focus).",
      type: "JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>",
    },
  ];

  const switchPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the switch.",
      type: '"outline" | "filled"',
      defaultValue: '"filled"',
    },
    {
      name: "colorScheme",
      description: "The color of the switch.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the switch.",
      type: '"sm" | "md" | "lg"',
      defaultValue: '"md"',
    },
    {
      name: "labelPlacement",
      description: "The placement of the switch label.",
      type: '"start" | "end"',
      defaultValue: '"start"',
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
      <PageTitle>Switch</PageTitle>
      <Text mb="$5">
        The <Code>Switch</Code> component is used as an alternative for the{" "}
        <Anchor
          as={Link}
          href="/docs/data-entry/checkbox"
          color="$primary11"
          fontWeight="$semibold"
        >
          Checkbox
        </Anchor>{" "}
        component. You can switch between enabled or disabled states.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>SwitchPrimitive:</strong> Unstyled component containing all the parts of a switch.
          It renders a <Code>label</Code> and a visualy hidden <Code>input</Code> with type set to{" "}
          <Code>checkbox</Code> and role set to <Code>switch</Code>.
        </ListItem>
        <ListItem>
          <strong>SwitchPrimitiveThumb:</strong> The thumb that is used to visually indicate whether
          the switch is on or off.
        </ListItem>
        <ListItem>
          <strong>Switch:</strong> The Hope UI styled switch component based on{" "}
          <Code>SwitchPrimitive</Code>.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <Switch defaultChecked>Switch</Switch>
      </Preview>
      <SectionSubtitle id="colors">Switch colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Switch. You can set the
        value to <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>,{" "}
        <Code>success</Code>, <Code>info</Code>, <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.switchColors} mb="$10">
        <HStack spacing="$4">
          <Switch defaultChecked colorScheme="primary" />
          <Switch defaultChecked colorScheme="accent" />
          <Switch defaultChecked colorScheme="neutral" />
          <Switch defaultChecked colorScheme="success" />
          <Switch defaultChecked colorScheme="info" />
          <Switch defaultChecked colorScheme="warning" />
          <Switch defaultChecked colorScheme="danger" />
        </HStack>
      </Preview>
      <SectionSubtitle id="sizes">Switch sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Switch. You can set the value to{" "}
        <Code>sm</Code>, <Code>md</Code> or <Code>lg</Code>.
      </Text>
      <Preview snippet={snippets.switchSizes} mb="$10">
        <HStack spacing="$4">
          <Switch defaultChecked size="sm">
            Switch
          </Switch>
          <Switch defaultChecked size="md">
            Switch
          </Switch>
          <Switch defaultChecked size="lg">
            Switch
          </Switch>
        </HStack>
      </Preview>
      <SectionSubtitle id="variants">Switch variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Switch. You can set the
        value to <Code>outline</Code> or <Code>filled</Code>.
      </Text>
      <Preview snippet={snippets.switchVariants} mb="$10">
        <HStack spacing="$4">
          <Switch variant="filled">Switch</Switch>
          <Switch variant="outline">Switch</Switch>
        </HStack>
      </Preview>
      <SectionSubtitle id="label-placement">Switch label placement</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>labelPlacement</Code> prop to change the placement of the label. You can set
        the value to <Code>start</Code> or <Code>end</Code>.
      </Text>
      <Preview snippet={snippets.switchLabelPlacement} mb="$10">
        <HStack spacing="$4">
          <Switch labelPlacement="start">Switch</Switch>
          <Switch labelPlacement="end">Switch</Switch>
        </HStack>
      </Preview>
      <SectionSubtitle id="disabled">Disabled state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>disabled</Code> prop to disable the Switch.
      </Text>
      <Preview snippet={snippets.switchDisabled} mb="$10">
        <HStack spacing="$4">
          <Switch disabled>Switch</Switch>
          <Switch variant="outline" disabled>
            Switch
          </Switch>
          <Switch defaultChecked disabled>
            Switch
          </Switch>
        </HStack>
      </Preview>
      <SectionSubtitle id="invalid">Invalid state</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>invalid</Code> prop to mark the Switch as invalid.
      </Text>
      <Preview snippet={snippets.switchInvalid} mb="$12">
        <HStack spacing="$4">
          <Switch invalid>Switch</Switch>
          <Switch variant="outline" invalid>
            Switch
          </Switch>
          <Switch defaultChecked invalid>
            Switch
          </Switch>
        </HStack>
      </Preview>
      <SectionTitle id="headless-api">Headless API</SectionTitle>
      <Text mb="$5">
        Use the unstyled <Code>SwitchPrimitive</Code> component to achieve your desired design. You
        can pair it with your styling solution of choice. The below example uses style props and the{" "}
        <Code>css</Code> function.
      </Text>
      <Preview snippet={snippets.headless} mb="$12">
        <SwitchPrimitive class={switchRootClass()}>
          <VStack w="$full" alignItems="flex-start">
            <Text size="sm" fontWeight="$semibold">
              Annual billing
            </Text>
            <Text size="xs" color="$neutral11">
              Save 10%
            </Text>
          </VStack>
          <Box class={switchControlClass()}>
            <SwitchPrimitiveThumb class={switchThumbClass()} />
          </Box>
        </SwitchPrimitive>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Switch</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="switch-primitive-props">SwitchPrimitive props</SectionSubtitle>
      <PropsTable items={switchPrimitivePropItems} mb="$10" />
      <SectionSubtitle id="switch-props">Switch props</SectionSubtitle>
      <Text mb="$5">
        <Code>Switch</Code> composes the <Code>SwitchPrimitive</Code> component, so you can pass all
        its props. These are props specific to the <Code>Switch</Code> component:
      </Text>
      <PropsTable items={switchPropItems} />
    </PageLayout>
  );
}
