import { Alert, AlertDescription, Anchor, hope, Text } from "@hope-ui/design-system";
import Prism from "prismjs";
import { Link } from "solid-app-router";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function HopeFactory() {
  const previousLink: ContextualNavLink = {
    href: "/docs/features/global-styles",
    label: "Global styles",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/theming/default-theme",
    label: "Default theme",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#hope-jsx-elements", label: "Hope JSX elements" },
    { href: "#hope-factory-function", label: "Hope factory function" },
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
      <PageTitle>Hope factory</PageTitle>
      <Text mb="$5">
        Hope factory serves as an <strong>object of hope enabled JSX elements</strong>, and also a{" "}
        <strong>function that can be used to enable custom component</strong> receive hope's style
        props.
      </Text>
      <CodeSnippet snippet={snippets.importHopeFactory} mb="$12" />
      <SectionTitle id="hope-jsx-elements">Hope JSX elements</SectionTitle>
      <Text mb="$5">
        Create base html elements with theme-aware style props using{" "}
        <Code>hope.&lt;element&gt;</Code> notation. For example, if you want a plain html button
        with ability to pass Hope UI styles, you can write <Code>&lt;hope.button /&gt;</Code>.
      </Text>
      <Preview snippet={snippets.hopeJsxElements} mb="$5">
        <hope.button px="$3" py="$2" bg="$success7" rounded="$md" _hover={{ bg: "$success8" }}>
          Click me
        </hope.button>
      </Preview>
      <Text mb="$8">
        This reduces the need to create custom component wrappers and name them. This syntax is
        available for any html elements.
      </Text>
      <SectionTitle id="hope-factory-function">Hope factory function</SectionTitle>
      <Text mb="$5">
        This is a function that converts <strong>non-hope components</strong> or{" "}
        <strong>jsx element</strong> to hope-enabled components so you can pass style props to them.
      </Text>
      <Text mb="$5">
        Consider the <Code>Link</Code> component of the <Code>solid-app-router</Code> package, let's
        use the hope factory function to make possible to pass style props to it.
      </Text>
      <CodeSnippet snippet={snippets.hopeFactoryFunction} mb="$5" />
      <Alert status="warning" mb="$10">
        <AlertDescription>
          Considering that Hope UI uses <Code>stitches</Code> under the hood, ensure the non-hope
          component accepts <Code>class</Code> as props for this to work correctly
        </AlertDescription>
      </Alert>
      <SectionSubtitle>Attaching styles</SectionSubtitle>
      <Text mb="$5">
        In some instances, you might need to attach specific styles to the component wrapped in the
        hope factory
      </Text>
      <CodeSnippet snippet={snippets.attachingStyles} mb="$8" />
      <Text mb="$5">You can also use the hope factory on jsx elements as well.</Text>
      <CodeSnippet snippet={snippets.attachingStylesJsxElement} mb="$5" />
      <Text mb="$5">
        The <strong>baseClass</strong> property is the CSS class to use when targeting this
        component in a css selector. This class will be applied to the rendered dom element.
      </Text>
      <Text>
        Taking the above example, in stitches <Code>css()</Code> method or Hope UI <Code>css</Code>{" "}
        prop, if you want to target all <Code>p</Code> in the <Code>Card</Code> component you can
        use the css selector <Code>{"${Card} p"}</Code> and it will evaluate to{" "}
        <Code>{".my-card p"}</Code>. If you want to learn more, check out "Targeting other SolidJS
        components" in the{" "}
        <Anchor
          as={Link}
          href="/docs/features/css-prop#targeting-other-solid-components"
          color="$primary11"
          fontWeight="$semibold"
        >
          css prop
        </Anchor>{" "}
        documentation.
      </Text>
    </PageLayout>
  );
}
