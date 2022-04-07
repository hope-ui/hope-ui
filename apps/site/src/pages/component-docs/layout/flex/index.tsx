import { Anchor, Box, Button, Center, Flex, Grid, Heading, hope, HStack, Spacer, Text } from "@hope-ui/solid";
import Prism from "prismjs";
import { Link } from "solid-app-router";
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

export default function FlexDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/layout/divider",
    label: "Divider",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/grid",
    label: "Grid",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#using-the-spacer", label: "Using the Spacer", indent: true },
    { href: "#vs", label: "Flex and Spacer vs Grid vs Stack" },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "direction",
      description: "Shorthand for flexDirection style prop.",
      type: "Property.FlexDirection",
    },
    {
      name: "wrap",
      description: "Shorthand for flexWrap style prop.",
      type: "Property.FlexWrap",
    },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout previousLink={previousLink} nextLink={nextLink} contextualNavLinks={contextualNavLinks}>
      <PageTitle>Flex</PageTitle>
      <Text mb="$5">
        Flex is{" "}
        <Anchor as={Link} href="/docs/layout/box" color="$primary11" fontWeight="$semibold">
          Box
        </Anchor>{" "}
        with <Code>display: flex</Code> and comes with helpful style shorthand. It renders a <Code>div</Code> element.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$6" />
      <hope.ul ps="$6" mb="$12">
        <hope.li mb="$2">
          <strong>Flex:</strong> A <Code>Box</Code> with <Code>display: flex</Code>.
        </hope.li>
        <hope.li>
          <strong>Spacer:</strong> Creates an adjustable, empty space that can be used to tune the spacing between child
          elements within <Code>Flex</Code>.
        </hope.li>
      </hope.ul>
      <SectionTitle id="usage">Usage</SectionTitle>
      <Text mb="$3">Using the Flex components, here are some helpful shorthand props:</Text>
      <hope.ul ps="$6" mb="$5">
        <hope.li mb="$2">
          <Code>flexDirection</Code> is <Code>direction</Code>.
        </hope.li>
        <hope.li>
          <Code>flexWrap</Code> is <Code>wrap</Code>.
        </hope.li>
      </hope.ul>
      <Text mb="$5">While you can pass the verbose props, using the shorthand can save you some time.</Text>
      <Preview snippet={snippets.basicUsage} mb="$10">
        <Flex color="white">
          <Center w="100px" bg="$success10">
            <Text>Box 1</Text>
          </Center>
          <Center boxSize="150px" bg="$info10">
            <Text>Box 2</Text>
          </Center>
          <Box flex="1" bg="tomato">
            <Text>Box 3</Text>
          </Box>
        </Flex>
      </Preview>
      <SectionSubtitle id="using-the-spacer">Using the Spacer</SectionSubtitle>
      <Text mb="$5">
        As an alternative to <Code>Stack</Code>, you can combine <Code>Flex</Code> and <Code>Spacer</Code> to create
        stackable and responsive layouts.
      </Text>
      <Preview snippet={snippets.usingSpacer} mb="$12">
        <Flex>
          <Box p="$4" bg="$danger9">
            Box 1
          </Box>
          <Spacer />
          <Box p="$4" bg="$success9">
            Box 2
          </Box>
        </Flex>
      </Preview>
      <SectionTitle id="vs">Flex and Spacer vs Grid vs Stack</SectionTitle>
      <Text mb="$4">
        The <Code>Flex</Code> and <Code>Spacer</Code> components, <Code>Grid</Code> and <Code>HStack</Code> treat
        children of different widths differently.
      </Text>
      <hope.ul ps="$6" mb="$6">
        <hope.li mb="$2">
          With <Code>Flex</Code> and <Code>Spacer</Code>, the children will span the entire width of the container and
          also have equal spacing between them.
        </hope.li>
        <hope.li mb="$2">
          In <Code>Grid</Code>, the starting points of the children will be equally spaced but the gaps between them
          will not be equal.
        </hope.li>
        <hope.li>
          In <Code>HStack</Code>, the children will have equal spacing between them but they won't span the entire width
          of the container.
        </hope.li>
      </hope.ul>
      <Preview snippet={snippets.vs} mb="$8">
        <Box>
          <Text>Flex and Spacer: Full width, equal spacing</Text>
          <Flex>
            <Box w="70px" h="$10" bg="$danger9" />
            <Spacer />
            <Box w="170px" h="$10" bg="$danger9" />
            <Spacer />
            <Box w="180px" h="$10" bg="$danger9" />
          </Flex>

          <Text mt="$4">Grid: The children start at the beginning, the 1/3 mark and 2/3 mark</Text>
          <Grid templateColumns="repeat(3, 1fr)" gap="$6">
            <Box w="70px" h="$10" bg="$info9" />
            <Box w="170px" h="$10" bg="$info9" />
            <Box w="180px" h="$10" bg="$info9" />
          </Grid>

          <Text mt="$4">HStack: The children have equal spacing but don't span the whole container</Text>
          <HStack spacing="24px">
            <Box w="70px" h="$10" bg="$success9" />
            <Box w="170px" h="$10" bg="$success9" />
            <Box w="180px" h="$10" bg="$success9" />
          </HStack>
        </Box>
      </Preview>
      <Text mb="$5">
        A good use case for <Code>Spacer</Code> is to create a navbar with a signup/login button aligned to the right.
      </Text>
      <Preview snippet={snippets.spacerUseCase} mb="$12">
        <Flex>
          <Box p="$2">
            <Heading size="xl" fontWeight="$bold">
              Hope App
            </Heading>
          </Box>
          <Spacer />
          <Box>
            <Button mr="$4">Sign Up</Button>
            <Button>Log in</Button>
          </Box>
        </Flex>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
