import { Anchor, createIcon, hope, HStack, Icon, IconProps, Text } from "@hope-ui/solid";
import Prism from "prismjs";
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

function CircleIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 200 200" {...props}>
      <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
    </Icon>
  );
}

export default function IconDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/badge",
    label: "Badge",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/image",
    label: "Image",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#using-third-party-icon-library", label: "Using a third-party icon library" },
    { href: "#creating-custom-icons", label: "Creating your custom icons" },
    { href: "#using-icon-component", label: "Using the `Icon` component", indent: true },
    { href: "#using-create-icon-function", label: "Using the `createIcon` function", indent: true },
    { href: "#tips", label: "Tips for generating your own icons", indent: true },
    { href: "#fallback-icon", label: "Fallback icon" },
    { href: "#props", label: "Props" },
    { href: "#icon-props", label: "Icon props", indent: true },
    { href: "#create-icon-options", label: "createIcon options", indent: true },
  ];

  const iconPropItems: PropsTableItem[] = [
    {
      name: "viewBox",
      description: "The viewBox of the icon.",
      type: "string",
      defaultValue: "0 0 24 24",
    },
    {
      name: "boxSize",
      description: "The size (width and height) of the icon.",
      type: "string",
      defaultValue: "1em",
    },
    {
      name: "color",
      description: "The color of the icon.",
      type: "string",
      defaultValue: "currentColor",
    },
  ];

  const createIconPropItems: PropsTableItem[] = [
    {
      name: "viewBox",
      description: "The viewBox of the icon.",
      type: "string",
      defaultValue: "0 0 24 24",
    },
    {
      name: "path",
      description: "A function that return the `svg` path or group element.",
      type: "() => JSX.Element | JSX.Element[]",
    },
    {
      name: "defaultProps",
      description: "Default props automatically passed to the component; overwriteable.",
      type: "IconProps",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Icon</PageTitle>
      <Text mb="$5">
        The <Code>Icon</Code> component is used to render <Code>svg</Code>.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="using-third-party-icon-library">Using a third-party icon library</SectionTitle>
      <Text mb="$3">To use third-party icon libraries, here are the steps:</Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          Import the <Code>Icon</Code> component from <Code>@hope-ui/solid</Code>.
        </hope.li>
        <hope.li>
          Pass the desired third party icon into the <Code>as</Code> prop.
        </hope.li>
      </hope.ul>
      <CodeSnippet snippet={snippets.usingThirdPartyIconLibrary} mb="$12"></CodeSnippet>
      <SectionTitle id="creating-custom-icons">Creating your custom icons</SectionTitle>
      <Text mb="$3">Hope UI provides two methods for creating your custom icons:</Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          Using the <Code>Icon</Code> component.
        </hope.li>
        <hope.li>
          Using the <Code>createIcon</Code> function.
        </hope.li>
      </hope.ul>
      <Text mb="$5">
        They can be imported from <Code>@hope-ui/solid</Code>:
      </Text>
      <CodeSnippet snippet={snippets.importIconAndCreateIcon} mb="$10" />
      <SectionSubtitle id="using-icon-component">
        Using the <Code>Icon</Code> component
      </SectionSubtitle>
      <Text mb="$5">
        The <Code>Icon</Code> component renders as an <Code>svg</Code> element.
      </Text>
      <Preview snippet={snippets.customIconWithIconComponent} mb="$8">
        <Icon viewBox="0 0 200 200" color="$danger9">
          <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
        </Icon>
      </Preview>
      <Text mb="$5">This enables you to define your own custom icon components:</Text>
      <CodeSnippet snippet={snippets.customIconAsComponent} mb="$8" />
      <Text mb="$5">And style them with style props:</Text>
      <Preview snippet={snippets.customIconAsComponentUsage} mb="$10">
        <HStack>
          <CircleIcon />
          <CircleIcon boxSize="$6" />
          <CircleIcon boxSize="$8" color="$danger9" />
        </HStack>
      </Preview>
      <SectionSubtitle id="using-create-icon-function">
        Using the <Code>createIcon</Code> function
      </SectionSubtitle>
      <Text mb="$5">
        The <Code>createIcon</Code> function is a convenience wrapper around the process of generating icons with{" "}
        <Code>Icon</Code>, allowing you to achieve the same functionality with less effort.
      </Text>
      <CodeSnippet snippet={snippets.createIconExample} mb="$10" />
      <SectionSubtitle id="tips">Tips for generating your own icons</SectionSubtitle>
      <hope.ul ps="$6" mb="$12">
        <hope.li mb="$2">
          Export icons as <Code>svg</Code> from{" "}
          <Anchor href="https://www.figma.com/" external color="$primary11" fontWeight="$semibold">
            Figma
          </Anchor>
          ,{" "}
          <Anchor href="https://www.sketch.com/" external color="$primary11" fontWeight="$semibold">
            Sketch
          </Anchor>
          , etc.
        </hope.li>
        <hope.li mb="$2">
          Use a tool like{" "}
          <Anchor href="https://jakearchibald.github.io/svgomg/" external color="$primary11" fontWeight="$semibold">
            SvgOmg
          </Anchor>{" "}
          to reduce the size and minify the markup.
        </hope.li>
        <hope.li>
          To use the <Code>color</Code> style prop, set the <Code>fill</Code> or <Code>stroke</Code> prop of your svg{" "}
          <Code>path</Code> to <Code>currentColor</Code>.
        </hope.li>
      </hope.ul>
      <SectionTitle id="fallback-icon">Fallback icon</SectionTitle>
      <Text mb="$5">
        When <Code>children</Code> is not provided, the <Code>Icon</Code> component renders a fallback icon.
      </Text>
      <Preview snippet={snippets.fallbackIcon} mb="$12">
        <Icon />
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <Text mb="$5">
        <Code>Icon</Code> render an <Code>svg</Code>, you can use any <Code>svg</Code> attributes.
      </Text>
      <SectionSubtitle id="icon-props">
        <Code>Icon</Code> props
      </SectionSubtitle>
      <PropsTable items={iconPropItems} mb="$10" />
      <SectionSubtitle id="create-icon-options">
        <Code>createIcon</Code> options
      </SectionSubtitle>
      <PropsTable items={createIconPropItems} />
    </PageLayout>
  );
}
