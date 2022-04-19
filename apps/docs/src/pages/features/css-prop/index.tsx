import { Anchor, Box, Heading, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function CSSProp() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/style-props",
    label: "Style props",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/features/create-styles",
    label: "Create styles",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#defining-any-standard-css-property", label: "Defining any standard CSS property" },
    { href: "#defining-css-custom-properties", label: "Defining CSS custom properties" },
    { href: "#creating-nested-selectors", label: "Creating nested selectors" },
    { href: "#targeting-other-hope-components", label: "tageting other Hope UI components" },
    { href: "#targeting-other-solid-components", label: "tageting other SolidJS components" },
    { href: "#custom-media-queries", label: "Custom media queries" },
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
      <PageTitle>
        The <Code>css</Code> prop
      </PageTitle>
      <Text mb="$5">
        With <Code>css</Code> you can provide any valid CSS to an element and utilize tokens from
        your theme to ensure consistency and that you are utilizing constraint-based design
        principles when styling your application.
      </Text>
      <Text mb="$5">
        This prop provides a superset of CSS (contains all CSS properties/selectors in addition to
        custom ones) that maps values directly from the theme, depending on the CSS property used.
        Also, it allows a simple way of defining responsive values that correspond to the
        breakpoints defined in the theme.
      </Text>
      <Text mb="$5">
        To find out which properties are theme-aware, see the{" "}
        <Anchor
          as={Link}
          href="/docs/features/style-props"
          color="$primary11"
          fontWeight="$semibold"
        >
          Style Props
        </Anchor>
        .
      </Text>
      <Text mb="$8">
        Although the <Code>css</Code> prop is considered an escape hatch, there are few cases where
        it is needed.
      </Text>
      <SectionTitle id="defining-any-standard-css-property">
        Defining any standard CSS property
      </SectionTitle>
      <Text mb="$5">
        In case you need to set a CSS property that is not listed in the Style Props list, you can
        use the <Code>css</Code> prop and pass it whatever CSS property you desire.
      </Text>
      <Text mb="$5">
        One such example is the <Code>filter</Code> property:
      </Text>
      <Preview snippet={snippets.defineStandardCSSProperty} mb="$12">
        <Box
          as="img"
          src="http://placekitten.com/200/300"
          alt="a kitten"
          css={{ filter: "blur(8px)" }}
        />
      </Preview>
      <SectionTitle id="defining-css-custom-properties">
        Defining CSS custom properties
      </SectionTitle>
      <Text mb="$5">
        Custom CSS properties can be defined via the <Code>css</Code> prop as well:
      </Text>
      <Preview snippet={snippets.defineCustomCSSProperty} mb="$12">
        <Box css={{ "--my-color": "#53c8c4" }}>
          <Heading color="var(--my-color)" size="4xl">
            This uses CSS Custom Properties!
          </Heading>
        </Box>
      </Preview>
      <SectionTitle id="creating-nested-selectors">Creating nested selectors</SectionTitle>
      <Text mb="$5">
        To create complex, nested selectors, you can use the <Code>&</Code> operator like in sass.
      </Text>
      <Preview snippet={snippets.createNestingSelectors} mb="$12">
        <Box borderWidth={2} borderColor="$primary9" p="$5" class="my-box">
          <Heading size="4xl">
            Hover the box...
            <Box
              as="span"
              color="$danger9"
              css={{
                ".my-box:hover &": {
                  color: "$success9",
                },
              }}
            >
              And I will turn green!
            </Box>
          </Heading>
        </Box>
      </Preview>
      <SectionTitle id="targeting-other-hope-components">
        Targeting other Hope UI components
      </SectionTitle>
      <Text mb="$5">
        Inside the <Code>css</Code> prop you can target other Hope UI components using string
        interpolation in the selector.
      </Text>
      <CodeSnippet snippet={snippets.targetingOtherHopeComponent} mb="$12" />

      <SectionTitle id="targeting-other-solid-components">
        Targeting other SolidJS components
      </SectionTitle>
      <Text mb="$5">
        Inside the <Code>css</Code> prop you can target other SolidJS components using string
        interpolation in the selector.
      </Text>
      <CodeSnippet snippet={snippets.targetingOtherSolidComponent} mb="$12" />

      <SectionTitle id="custom-media-queries">Custom media queries</SectionTitle>
      <Preview snippet={snippets.customMediaQueries}>
        <Box
          css={{
            "@media print": {
              display: "none",
            },
          }}
        >
          This text won't be shown when printing this page.
        </Box>
      </Preview>
    </PageLayout>
  );
}
