import { Anchor, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function GlobalStyles() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/responsive-styles",
    label: "Responsive styles",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/features/hope-factory",
    label: "Hope factory",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#the-globalcss-function", label: "The `globalCss` function" },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Global styles</PageTitle>
      <Text mb="$8">For handling things like global resets, you can write global CSS styles.</Text>
      <SectionTitle id="the-globalcss-function">
        The <Code>globalCss</Code> function
      </SectionTitle>
      <Text mb="$5">
        Hope UI expose the <Code>globalCss</Code> function from <Code>@stitches/core</Code>.
      </Text>
      <CodeSnippet snippet={snippets.importGlobalCssFunction} mb="$8" />
      <Text mb="$5">This function will return another function, which you must call in your app.</Text>
      <CodeSnippet snippet={snippets.usingGlobalCssFunction} mb="$8" />
      <Text>
        If you want to learn more, check out{" "}
        <Anchor
          href="https://stitches.dev/docs/framework-agnostic#global-styles"
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
