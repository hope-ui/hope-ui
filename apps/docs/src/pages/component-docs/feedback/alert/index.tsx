import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@hope-ui/solid";
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

export default function AlertDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/navigation/tabs",
    label: "Tabs",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/feedback/circular-progress",
    label: "CircularProgress",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#statuses", label: "Alert statuses", indent: true },
    { href: "#variants", label: "Alert variants", indent: true },
    { href: "#composition", label: "Composition", indent: true },
    { href: "#theming", label: "Theming" },
    { href: "#props", label: "Props" },
    { href: "#alert-props", label: "Alert props", indent: true },
    { href: "#alert-icon-props", label: "AlertIcon props", indent: true },
    { href: "#alert-title-props", label: "AlertTitle props", indent: true },
    { href: "#alert-description-props", label: "AlertDescription props", indent: true },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "variant",
      description: "The visual style of the alert.",
      type: '"solid" | "subtle" | "left-accent" | "top-accent"',
      defaultValue: '"subtle"',
    },
    {
      name: "status",
      description: "The status of the alert. This affects the color scheme and icon used.",
      type: '"success" | "info" | "warning" | "danger"',
      defaultValue: '"info"',
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
      <PageTitle>Alert</PageTitle>
      <Text mb="$5">
        Alerts are used to communicate a state that affects a system, feature or page.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>
          <strong>Alert:</strong> The wrapper for alert components.
        </ListItem>
        <ListItem>
          <strong>AlertIcon:</strong> The visual icon for the alert that changes based on the{" "}
          <Code>status</Code> prop.
        </ListItem>
        <ListItem>
          <strong>AlertTitle:</strong> The title of the alert to be announced by screen readers.
        </ListItem>
        <ListItem>
          <strong>AlertDescription:</strong> The description of the alert to be announced by screen
          readers.
        </ListItem>
      </UnorderedList>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$5"></Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Alert status="danger">
          <AlertIcon mr="$2_5" />
          <AlertTitle mr="$2_5">Your browser is outdated!</AlertTitle>
          <AlertDescription>Your Hope UI experience may be degraded.</AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      </Preview>
      <SectionSubtitle id="statuses">Alert statuses</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>status</Code> prop to change the status of the alert. This affects the color
        scheme and icon used. You can set the value to <Code>success</Code>, <Code>info</Code>,{" "}
        <Code>warning</Code> or <Code>danger</Code>.
      </Text>
      <Preview snippet={snippets.status} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <Alert status="info">
            <AlertIcon mr="$2_5" />
            Hope UI is going live on April 7th. Get ready!
          </Alert>
          <Alert status="success">
            <AlertIcon mr="$2_5" />
            Data uploaded to the server. Fire on!
          </Alert>
          <Alert status="warning">
            <AlertIcon mr="$2_5" />
            Seems your account is about expire, upgrade now
          </Alert>
          <Alert status="danger">
            <AlertIcon mr="$2_5" />
            There was an error processing your request
          </Alert>
        </VStack>
      </Preview>
      <SectionSubtitle id="variants">Alert variants</SectionSubtitle>
      <Text mb="$5">
        Use the <Code>variant</Code> prop to change the visual style of the Alert You can set the
        value to <Code>solid</Code>, <Code>subtle</Code>, <Code>left-accent</Code> or{" "}
        <Code>top-accent</Code>.
      </Text>
      <Preview snippet={snippets.variants} mb="$10">
        <VStack alignItems="stretch" spacing="$4">
          <Alert status="success" variant="solid">
            <AlertIcon mr="$2_5" />
            Data uploaded to the server. Fire on!
          </Alert>
          <Alert status="success" variant="subtle">
            <AlertIcon mr="$2_5" />
            Data uploaded to the server. Fire on!
          </Alert>
          <Alert status="success" variant="left-accent">
            <AlertIcon mr="$2_5" />
            Data uploaded to the server. Fire on!
          </Alert>
          <Alert status="success" variant="top-accent">
            <AlertIcon mr="$2_5" />
            Data uploaded to the server. Fire on!
          </Alert>
        </VStack>
      </Preview>
      <SectionSubtitle id="composition">Composition</SectionSubtitle>
      <Text mb="$5">
        <Code>Alert</Code> ships with smaller components to allow for flexibility in creating all
        kinds of layouts. Here's an example of a custom alert style and layout:
      </Text>
      <Preview snippet={snippets.composition} mb="$8">
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr="0" />
          <AlertTitle mt="$4" mb="$1" fontSize="$lg">
            Application submitted!
          </AlertTitle>
          <AlertDescription maxWidth="$sm">
            Thanks for submitting your application. Our team will get back to you soon.
          </AlertDescription>
        </Alert>
      </Preview>
      <Text mb="$5">
        <Code>Alert</Code> can also incorporate other Hope UI components. Here's an example of an
        alert with wrapping description text:
      </Text>
      <Preview snippet={snippets.compositionTwo} mb="$12">
        <Alert status="success">
          <AlertIcon mr="$2_5" />
          <Box flex="1">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription display="block">
              Your application has been received. We will review your application and respond within
              the next 48 hours.
            </AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      </Preview>
      <SectionTitle id="theming">Theming</SectionTitle>
      <Text mb="$5">
        <Code>Alert</Code> base styles and default props can be overridden in the Hope UI theme
        configuration like below:
      </Text>
      <CodeSnippet lang="js" snippet={snippets.theming} mb="$12" />
      <SectionTitle id="props">Props</SectionTitle>
      <SectionSubtitle id="alert-props">Alert props</SectionSubtitle>
      <PropsTable items={propItems} mb="$10" />
      <SectionSubtitle id="alert-icon-props">AlertIcon props</SectionSubtitle>
      <Text mb="$10">
        <Code>AlertIcon</Code> composes <Code>Icon</Code> and changes the icon based on the{" "}
        <Code>status</Code> prop. You can use the <Code>as</Code> prop to render a custom icon.
      </Text>
      <SectionSubtitle id="alert-title-props">AlertTitle props</SectionSubtitle>
      <Text mb="$10">
        <Code>AlertTitle</Code> composes the <Code>Box</Code> component.
      </Text>
      <SectionSubtitle id="alert-description-props">AlertDescription props</SectionSubtitle>
      <Text mb="$10">
        <Code>AlertDescription</Code> composes the <Code>Box</Code> component.
      </Text>
    </PageLayout>
  );
}
