import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Text,
  useColorMode,
  useColorModeValue,
} from "@hope-ui/design-system";
import Prism from "prismjs";
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

export default function ColorMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("$danger9", "$info9");
  const color = useColorModeValue("white", "$blackAlpha12");

  const previousLink: ContextualNavLink = {
    href: "/docs/theming/css-variables",
    label: "CSS variables",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/general/button",
    label: "Button",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#initial-color-mode", label: "Initial color mode" },
    { href: "#changing-color-mode", label: "Changing color mode" },
    { href: "#use-color-mode", label: "useColorMode", indent: true },
    { href: "#use-color-mode-value", label: "useColorModeValue", indent: true },
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
      <PageTitle>Color mode</PageTitle>
      <Text mb="$5">
        Hope UI comes with built-in support for managing color mode in your applications. All Hope
        UI components are color-mode aware.
      </Text>
      <Alert status="info" mb="$12">
        <AlertDescription>
          Hope UI stores the color mode in <Code>localStorage</Code> and appends a className to the{" "}
          <Code>body</Code> to ensure the color mode is persistent.
        </AlertDescription>
      </Alert>
      <SectionTitle id="initial-color-mode">Initial color mode</SectionTitle>
      <Text mb="$5">
        The default color mode used by Hope UI is <Code>light</Code>. To set the initial color mode
        your application should start with, create a theme config, set the{" "}
        <Code>initialColorMode</Code> to either <Code>light</Code>, <Code>dark</Code> or{" "}
        <Code>system</Code> and pass the config to the HopeProvider.
      </Text>
      <CodeSnippet snippet={snippets.initialColorMode} mb="$6" />
      <Alert status="warning" mb="$12">
        <AlertDescription>
          When using <Code>system</Code> as initial color mode, the theme will change with the
          system preference. However, if another theme is manually selected by the user then that
          theme will be used on the next page load. To reset it to system preference, simply remove
          the <Code>hope-ui-color-mode</Code> entry from localStorage.
        </AlertDescription>
      </Alert>
      <SectionTitle id="changing-color-mode">Changing color mode</SectionTitle>
      <Text mb="$10">
        To manage color mode in your application, Hope UI exposes the <Code>useColorMode</Code> and{" "}
        <Code>useColorModeValue</Code> hooks.
      </Text>
      <SectionSubtitle id="use-color-mode">useColorMode</SectionSubtitle>
      <Text mb="$5">
        <Code>useColorMode</Code> is a custom hook that gives you an accessor to get the current
        color mode, and a function to toggle it.
      </Text>
      <Preview snippet={snippets.useColorMode} mb="$5">
        <Button onClick={toggleColorMode}>
          Toggle {colorMode() === "light" ? "dark" : "light"}
        </Button>
      </Preview>
      <Text mb="$10">
        Calling <Code>toggleColorMode</Code> anywhere in your app tree toggles the color mode from
        <Code>light</Code> or <Code>dark</Code> and vice versa.
      </Text>
      <SectionSubtitle id="use-color-mode-value">useColorModeValue</SectionSubtitle>
      <Text mb="$5">
        <Code>useColorModeValue</Code> is a custom hook used to change any value or style based on
        the color mode. It takes 2 arguments: the value in light mode, the value in dark mode and
        returns a derived signal with the correct value based on the color mode.
      </Text>
      <Text mb="$5">
        Here's an example that changes the <Code>background-color</Code> and <Code>color</Code>{" "}
        using the <Code>useColorModeValue</Code> hook.
      </Text>
      <Preview snippet={snippets.useColorModeValue}>
        <div>
          <Box mb="$4" p="$2" bg={bg()} color={color()}>
            This box's style will change based on the color mode.
          </Box>
          <Button size="sm" onClick={toggleColorMode}>
            Toggle Mode
          </Button>
        </div>
      </Preview>
    </PageLayout>
  );
}
