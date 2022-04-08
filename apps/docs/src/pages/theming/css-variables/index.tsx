import { Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";

import { snippets } from "./snippets";

export default function CSSVariables() {
  const previousLink: ContextualNavLink = {
    href: "/docs/theming/customize-theme",
    label: "Customize theme",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/theming/color-mode",
    label: "Color mode",
  };

  const contextualNavLinks: ContextualNavLink[] = [];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>CSS variables</PageTitle>
      <Text mb="$5">
        All Hope UI theme tokens are available as CSS custom properties (aka CSS variables) with the <Code>hope</Code>{" "}
        prefix.
      </Text>
      <Text mb="$5">
        Let's say you want to change your application <Code>#root</Code> div <Code>background-color</Code> using a color
        from the Hope UI theme. In a plain CSS file you can do it like this:
      </Text>
      <CodeSnippet lang="css" snippet={snippets.cssVariables} />
    </PageLayout>
  );
}
