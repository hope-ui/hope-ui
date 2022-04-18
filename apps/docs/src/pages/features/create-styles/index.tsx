import { Anchor, Text } from "@hope-ui/design-system";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function CreateStyles() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/css-prop",
    label: "The css prop",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/features/responsive-styles",
    label: "Responsive styles",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#the-css-function", label: "The `css` function" },
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
      <PageTitle>Create styles</PageTitle>
      <Text mb="$8">
        All Hope UI components are built with the{" "}
        <Anchor href="https://stitches.dev" external color="$primary11" fontWeight="$semibold">
          stitches
        </Anchor>{" "}
        css-in-js libary. Meaning you can use all tools available in stitches to create styles in
        Hope UI.
      </Text>
      <SectionTitle id="the-css-function">
        The <Code>css</Code> function
      </SectionTitle>
      <Text mb="$5">
        Hope UI expose the <Code>css</Code> function from <Code>@stitches/core</Code> configured
        with the Hope UI theme.
      </Text>
      <CodeSnippet snippet={snippets.importCssFunction} mb="$8" />
      <Text mb="$5">
        If you don't like the style props API or your HTML is comming too verbose the css function
        is a great way to extract your styles plus you get the full power of the stitches API.
      </Text>
      <CodeSnippet snippet={snippets.usingCssFunction} mb="$5" />
      <Text>
        If you want to learn more, check out{" "}
        <Anchor
          href="https://stitches.dev/docs/framework-agnostic"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          stitches
        </Anchor>{" "}
        documentation.
      </Text>
    </PageLayout>
  );
}
