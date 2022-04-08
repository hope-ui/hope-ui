import {
  Alert,
  AlertDescription,
  Anchor,
  Button,
  ButtonGroup,
  hope,
  HStack,
  IconButton,
  ListItem,
  Text,
  UnorderedList,
} from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import { BeatLoader } from "@/components/BeatLoader";
import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";
import { IconArrowRight } from "@/icons/IconArrowRight";
import { IconEmail } from "@/icons/IconEmail";
import { IconPlus } from "@/icons/IconPlus";

import { snippets } from "./snippets";

export default function ButtonDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/theming/color-mode",
    label: "Color mode",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/general/icon-button",
    label: "IconButton",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#button-colors", label: "Button colors", indent: true },
    { href: "#button-sizes", label: "Button sizes", indent: true },
    { href: "#button-variants", label: "Button variants", indent: true },
    { href: "#button-with-icon", label: "Button with icon", indent: true },
    { href: "#button-loading-state", label: "Button loading state", indent: true },
    { href: "#button-group", label: "Grouping buttons", indent: true },
    { href: "#accessibility", label: "Accessibility" },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#button-props", label: "Button props", indent: true },
    { href: "#button-group-props", label: "ButtonGroup props", indent: true },
  ];

  const buttonPropItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the button.",
      type: '"solid" | "subtle" | "outline" | "dashed" | "ghost"',
      defaultValue: '"solid"',
    },
    {
      name: "colorScheme",
      description: "The color of the button.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
      defaultValue: '"primary"',
    },
    {
      name: "size",
      description: "The size of the button.",
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
      defaultValue: '"md"',
    },
    {
      name: "compact",
      description: "If `true`, Reduces the button padding.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "fullWidth",
      description: "If `true`, the button will take up the full width of its container.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "disabled",
      description: "If `true`, the button will be disabled.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "loading",
      description: "If `true`, the button will show a loader.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "loadingText",
      description: "The label to show in the button when `loading` is true.",
      type: "string",
      defaultValue: "",
    },
    {
      name: "loader",
      description: "Replace the loader component when `loading` is `true`.",
      type: "JSX.Element",
      defaultValue: "",
    },
    {
      name: "loaderPlacement",
      description: "Determines the placement of the loader when `loading` is `true`.",
      type: '"start" | "end"',
      defaultValue: '"start"',
    },
    {
      name: "iconSpacing",
      description: "The space between the button icon and label.",
      type: "Property.MarginRight<SpaceScaleValue>",
      defaultValue: "0.5rem",
    },
    {
      name: "leftIcon",
      description: "If added, the button will show an icon before the button's label.",
      type: "JSX.Element",
      defaultValue: "",
    },
    {
      name: "rightIcon",
      description: "If added, the button will show an icon after the button's label.",
      type: "JSX.Element",
      defaultValue: "",
    },
  ];

  const buttonGroupPropItems: PropsTableItem[] = [
    {
      name: "spacing",
      description: "The spacing between each buttons.",
      type: 'MarginProps["marginRight"]',
      defaultValue: "0.5rem",
    },
    {
      name: "attached",
      description:
        "If `true`, the borderRadius of button that are direct children will be altered to look flushed together.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      name: "variant",
      description: "The visual style of all wrapped buttons.",
      type: '"solid" | "subtle" | "outline" | "dashed" | "ghost"',
    },
    {
      name: "colorScheme",
      description: "The color of all wrapped buttons.",
      type: '"primary" | "accent" | "neutral" | "success" | "info" | "warning" | "danger"',
    },
    {
      name: "size",
      description: "The size of all wrapped buttons.",
      type: '"xs" | "sm" | "md" | "lg" | "xl"',
    },
    {
      name: "disabled",
      description: "If `true`, all wrapped buttons will be disabled.",
      type: "boolean",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Button</PageTitle>
      <Text mb="$8">
        The Button component is used to trigger an action or event, such as submitting a form, opening a dialog,
        canceling an action, or performing a delete operation.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Button>Button</Button>
      </Preview>
      <SectionSubtitle id="button-colors">Button colors</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>colorScheme</Code> prop to change the color of the Button. You can set the value to{" "}
        <Code>primary</Code>, <Code>accent</Code>, <Code>neutral</Code>, <Code>success</Code>, <Code>info</Code>,{" "}
        <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.buttonColors} mb="$10">
        <HStack spacing="$4">
          <Button colorScheme="primary">Button</Button>
          <Button colorScheme="accent">Button</Button>
          <Button colorScheme="neutral">Button</Button>
          <Button colorScheme="success">Button</Button>
          <Button colorScheme="info">Button</Button>
          <Button colorScheme="warning">Button</Button>
          <Button colorScheme="danger">Button</Button>
        </HStack>
      </Preview>
      <SectionSubtitle id="button-sizes">Button sizes</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>size</Code> prop to change the size of the Button. You can set the value to <Code>xs</Code>,{" "}
        <Code>sm</Code>, <Code>md</Code>, <Code>lg</Code> or <Code>xl</Code>.
      </Text>
      <Preview snippet={snippets.buttonSizes} mb="$8">
        <HStack spacing="$4">
          <Button size="xs">Button</Button>
          <Button size="sm">Button</Button>
          <Button size="md">Button</Button>
          <Button size="lg">Button</Button>
          <Button size="xl">Button</Button>
        </HStack>
      </Preview>
      <Text mb="$5">
        Use the <Code>compact</Code> prop to reduces the Button padding.
      </Text>
      <Preview snippet={snippets.buttonSizesCompact} mb="$10">
        <HStack spacing="$4">
          <Button size="xs" compact>
            Button
          </Button>
          <Button size="sm" compact>
            Button
          </Button>
          <Button size="md" compact>
            Button
          </Button>
          <Button size="lg" compact>
            Button
          </Button>
          <Button size="xl" compact>
            Button
          </Button>
        </HStack>
      </Preview>
      <SectionSubtitle id="button-variants">Button variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Button. You can set the value to{" "}
        <Code>solid</Code>, <Code>subtle</Code>, <Code>outline</Code>, <Code>dashed</Code> or <Code>ghost</Code>.
      </Text>
      <Preview snippet={snippets.buttonVariants} mb="$10">
        <HStack spacing="$4">
          <Button variant="solid">Button</Button>
          <Button variant="subtle">Button</Button>
          <Button variant="outline">Button</Button>
          <Button variant="dashed">Button</Button>
          <Button variant="ghost">Button</Button>
        </HStack>
      </Preview>
      <SectionSubtitle id="button-with-icon">Button with icon</SectionSubtitle>
      <Text mb="$5">
        You can add left and right icons to the Button component using the <Code>leftIcon</Code> and{" "}
        <Code>rightIcon</Code> props respectively.
      </Text>
      <Alert status="warning" mb="$5">
        <AlertDescription>
          The <Code>leftIcon</Code> and <Code>rightIcon</Code> prop values should be jsx elements not strings.
        </AlertDescription>
      </Alert>
      <Preview snippet={snippets.buttonWithIcon} mb="$5">
        <HStack spacing="$4">
          <Button leftIcon={<IconEmail boxSize={18} />}>Email</Button>
          <Button rightIcon={<IconArrowRight />} variant="outline">
            Call us
          </Button>
        </HStack>
      </Preview>
      <Text mb="$10">
        If you want to create your own icon components check out Hope UI{" "}
        <Anchor as={Link} href="/docs/data-display/icon" color="$primary11" fontWeight="$semibold">
          Icon
        </Anchor>{" "}
        documentation.
      </Text>
      <SectionSubtitle id="button-loading-state">Button loading state</SectionSubtitle>
      <Text mb="$5">
        Pass the <Code>loading</Code> prop to show its loading state. By default, the button will show a spinner and
        leave the button's width unchanged. You can also pass the <Code>loadingText</Code> prop to show a spinner and
        the loading text.
      </Text>
      <Preview snippet={snippets.buttonLoadingState} mb="$8">
        <HStack spacing="$4">
          <Button loading>Loading</Button>
          <Button variant="outline" loading loadingText="Submitting">
            Submit
          </Button>
        </HStack>
      </Preview>
      <Text mb="$5">
        You can change the loader element to use custom loaders as per your design requirements. Pass the{" "}
        <Code>loader</Code> prop and set it to a custom jsx element.
      </Text>
      <Preview snippet={snippets.buttonCustomLoader} mb="$8">
        <Button loading loader={<BeatLoader boxSize="$8" />}>
          Button
        </Button>
      </Preview>
      <Text mb="$5">
        When a <Code>loaderText</Code> is present, you can change the placement of the loader element to either{" "}
        <Code>start</Code> or <Code>end</Code>.
      </Text>
      <Preview snippet={snippets.buttonLoaderPlacement} mb="$10">
        <HStack spacing="$4">
          <Button variant="outline" loading loadingText="Loading" loaderPlacement="start">
            Submit
          </Button>
          <Button variant="outline" loading loadingText="Loading" loaderPlacement="end">
            Continue
          </Button>
        </HStack>
      </Preview>
      <SectionSubtitle id="button-group">Grouping buttons</SectionSubtitle>
      <Text mb="$3">
        You can use the <Code>Stack</Code> or <Code>ButtonGroup</Code> component to group buttons. When you use the{" "}
        <Code>ButtonGroup</Code> component, it allows you to:
      </Text>
      <UnorderedList spacing="$2" mb="$5">
        <ListItem>
          Set the <Code>variant</Code>, <Code>colorScheme</Code>, <Code>size</Code> and <Code>disabled</Code> state of
          all buttons within it.
        </ListItem>
        <ListItem>
          Add <Code>spacing</Code> between the buttons.
        </ListItem>
        <ListItem>Flush the buttons together by removing the border radius of its children as needed.</ListItem>
      </UnorderedList>
      <Preview snippet={snippets.buttonGroup} mb="$6">
        <ButtonGroup variant="outline" spacing="$6">
          <Button colorScheme="info">Save</Button>
          <Button>Cancel</Button>
        </ButtonGroup>
      </Preview>
      <Text mb="$5">
        To flush the buttons, pass the <Code>attached</Code> prop.
      </Text>
      <Preview snippet={snippets.buttonGroupAttached} mb="$12">
        <ButtonGroup size="sm" variant="outline" attached>
          <Button mr="-1px">Save</Button>
          <IconButton aria-label="Add to friends" icon={<IconPlus />} />
        </ButtonGroup>
      </Preview>
      <SectionTitle id="accessibility">Accessibility</SectionTitle>
      <hope.ul ps="$5" mb="$12">
        <hope.li mb="$2">
          Button has <Code>role</Code> of <Code>button</Code>.
        </hope.li>
        <hope.li>When Button has focus, Space or Enter activates it.</hope.li>
      </hope.ul>
      <SectionTitle id="composition">Composition</SectionTitle>
      <Text mb="$5">You can override any style of the Button via style props.</Text>
      <Preview snippet={snippets.composition} mb="$12">
        <Button
          variant="ghost"
          colorScheme="neutral"
          size="md"
          height="48px"
          width="200px"
          borderWidth="2px"
          borderColor="$success8"
        >
          Button
        </Button>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Button</Code> base styles and default props can be overridden in the Hope UI theme configuration like
        below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="button-props">Button props</SectionSubtitle>
      <PropsTable items={buttonPropItems} mb="$10" />
      <SectionSubtitle id="button-group-props">ButtonGroup props</SectionSubtitle>
      <PropsTable items={buttonGroupPropItems} />
    </PageLayout>
  );
}
