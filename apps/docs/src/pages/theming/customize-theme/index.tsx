import { Alert, AlertDescription, hope, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function CustomizeTheme() {
  const previousLink: ContextualNavLink = {
    href: "/docs/theming/default-theme",
    label: "Default theme",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/theming/css-variables",
    label: "CSS variables",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#customizing-theme-tokens", label: "Customizing theme tokens" },
    { href: "#token-aliases", label: "Token aliases" },
    { href: "#customizing-component-styles", label: "Customizing component styles" },
    {
      href: "#styling-single-part-components",
      label: "Styling single-part components",
      indent: true,
    },
    {
      href: "#styling-muti-parts-components",
      label: "Styling multi-parts components",
      indent: true,
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Customize theme</PageTitle>
      <Text mb="$5">
        By default, all Hope UI components inherit values from the default theme. In some scenarios, you might need to
        customize the theme tokens to match your design requirements.
      </Text>
      <Text mb="$3">Here are some options depending on your goals:</Text>
      <hope.ul ps="$5" mb="$12">
        <hope.li mb="$2">Customize the theme tokens like colors, font sizes, line heights, etc.</hope.li>
        <hope.li>Customize components base styles.</hope.li>
      </hope.ul>
      <SectionTitle id="customizing-theme-tokens">Customizing theme tokens</SectionTitle>
      <Text mb="$5">
        To override a token in the default theme, create a theme config and add the keys you'd like to override. You can
        also add new values to the theme.
      </Text>
      <Text mb="$5">
        For example, if you'd like to override the primary color palette in the theme, here's what you'll do:
      </Text>
      <CodeSnippet snippet={snippets.overrideThemeColors} mb="$5" />
      <Alert status="warning" mb="$12">
        <AlertDescription>
          Custom keys added to the Hope UI theme are not inferred by Typescript and won't appears in IntelliSense.
        </AlertDescription>
      </Alert>
      <SectionTitle id="token-aliases">Token aliases</SectionTitle>
      <Text mb="$5">
        Hope UI supports token aliases (aka semantic tokens) in it's theme configuration. For example, you can create an{" "}
        <Code>appBg</Code> token representing your application <Code>background-color</Code> which is <Code>white</Code>{" "}
        in light mode and refers to Hope UI <Code>neutral3</Code> color token in dark mode:
      </Text>
      <CodeSnippet snippet={snippets.tokenAliases} mb="$12" />
      <SectionTitle id="customizing-component-styles">Customizing component styles</SectionTitle>
      <Text mb="$10">
        Hope UI provides a <Code>components</Code> option in it's theme configuration allowing you to globally set base
        style and default props for each Hope UI components.
      </Text>
      <SectionSubtitle id="styling-single-part-components">Styling single-part components</SectionSubtitle>
      <Text mb="$5">
        Let's say you want all <Code>Button</Code> to have a "pill shape", be uppercased and apply the{" "}
        <Code>subtle</Code> variant and <Code>success</Code> colorScheme by default, here's what you'll do:
      </Text>
      <CodeSnippet snippet={snippets.singlePartComponentStyles} mb="$12" />
      <SectionSubtitle id="styling-muti-parts-components">Styling multi-parts components</SectionSubtitle>
      <Text mb="$5">
        Some Hope UI components are composed of multiple parts that you can stylize. Below is and example for the{" "}
        <Code>Alert</Code> component.
      </Text>
      <CodeSnippet snippet={snippets.multiPartsComponentStyles} mb="$5" />
      <Text mb="$5">
        To know which part of a component can be stylized in the Hope UI theme configuration, please refer to it's
        documentation.
      </Text>
    </PageLayout>
  );
}
