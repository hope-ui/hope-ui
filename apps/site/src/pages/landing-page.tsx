import {
  Box,
  Button,
  Center,
  Container,
  GridItem,
  Heading,
  HTMLHopeProps,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  VStackProps,
} from "@hope-ui/solid";
import { Link } from "solid-app-router";

import Header from "@/components/Header";
import { IconAccessibility } from "@/icons/IconAccessibility";
import { IconCode } from "@/icons/IconCode";
import { IconComponent } from "@/icons/IconComponent";
import { IconGithub } from "@/icons/IconGithub";
import { IconMoon } from "@/icons/IconMoon";
import { IconPalette } from "@/icons/IconPalette";
import { IconRocket } from "@/icons/IconRocket";

function HeroSection(props: VStackProps) {
  return (
    <VStack
      minH="calc(100vh - 72px)"
      maxW="$containerLg"
      mx={{ "@initial": "$4", "@lg": "auto" }}
      textAlign="center"
      justifyContent="center"
      {...props}
    >
      <Heading
        level="1"
        size={{ "@initial": "4xl", "@sm": "5xl", "@md": "6xl" }}
        fontWeight="$black"
        mb={{ "@initial": "$6", "@sm": "$8", "@md": "$10" }}
      >
        The SolidJS component library you've{" "}
        <Text as="span" color="$primary10">
          hoped
        </Text>{" "}
        for
      </Heading>
      <Text size={{ "@initial": "base", "@sm": "xl" }} color="$neutral11" maxW="$prose" mb="$8">
        Hope UI is a composable and accessible component library that gives you the foundation to build your next
        SolidJS application.
      </Text>
      <Stack
        direction={{ "@initial": "column", "@sm": "row" }}
        spacing="$4"
        justifyContent="center"
        alignItems="center"
        w="$full"
        mb={{ "@initial": "$4", "@sm": 0 }}
      >
        <Button
          as={Link}
          href="/docs/getting-started"
          size="xl"
          rounded="$lg"
          fullWidth={{ "@initial": true, "@sm": false }}
        >
          Get Started
        </Button>
        <Button
          as="a"
          target="_blank"
          rel="noopenner noreferrer"
          href="https://github.com/fabien-ml/hope-ui"
          variant="subtle"
          colorScheme="neutral"
          size="xl"
          rounded="$lg"
          leftIcon={<IconGithub />}
          fullWidth={{ "@initial": true, "@sm": false }}
        >
          Github
        </Button>
      </Stack>
    </VStack>
  );
}

function FeatureSection(props: HTMLHopeProps<"div">) {
  return (
    <Box minH="calc(100vh - 72px)" bg="$neutral2" {...props}>
      <Container>
        <VStack mx={{ "@initial": "$4", "@xl": "auto" }} py={{ "@initial": "$10", "@sm": "$20" }}>
          <Heading
            level={2}
            color="$primary9"
            fontSize="$sm"
            fontWeight="$semibold"
            textTransform="uppercase"
            letterSpacing="$wide"
            mb={{ "@initial": "$1", "@sm": "$2" }}
          >
            Iterate fast
          </Heading>
          <Text
            size={{ "@initial": "2xl", "@sm": "3xl", "@md": "4xl" }}
            fontWeight="$black"
            textAlign="center"
            mb={{ "@initial": "$4", "@sm": "$6" }}
          >
            Do it yourself, but not alone.
          </Text>
          <Text
            size={{ "@initial": "base", "@sm": "xl" }}
            color="$neutral11"
            textAlign="center"
            maxW="$prose"
            mb={{ "@initial": "$14", "@sm": "$20" }}
          >
            Hope UI provides the foundation for building your application's user interface, giving you the ability to
            focus on what really matter for your users.
          </Text>
          <SimpleGrid
            columns={{ "@initial": 1, "@sm": 2, "@lg": 3 }}
            columnGap="$12"
            rowGap={{ "@initial": "$14", "@sm": "$20" }}
            mx="auto"
          >
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconRocket color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Ready to go
              </Text>
              <Text color="$neutral11">
                Start your project with well designed SolidJS components that work out of the box.
              </Text>
            </GridItem>
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconComponent color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Composable
              </Text>
              <Text color="$neutral11">Compose your application interface with reusable building blocks.</Text>
            </GridItem>
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconAccessibility color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Accessible
              </Text>
              <Text color="$neutral11">
                Hope UI follows WAI-ARIA standards, helping you to reach the largest audience possible with less effort.
              </Text>
            </GridItem>
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconPalette color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Themeable
              </Text>
              <Text color="$neutral11">Use Hope UI's design system or build your own using the theming features.</Text>
            </GridItem>
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconMoon color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Dark mode
              </Text>
              <Text color="$neutral11">
                Add dark mode support to your app with just a few lines of code. All components are built with dark mode
                in mind.
              </Text>
            </GridItem>
            <GridItem as={VStack} bg="$neutral3" rounded="$sm" px="$6" pb="$6" maxW="$sm" textAlign="center">
              <Center
                bg="$primary9"
                boxSize="$12"
                rounded="$sm"
                shadow="$md"
                css={{
                  transform: "translateY(-50%)",
                }}
              >
                <IconCode color="$neutral1" boxSize="$6" />
              </Center>
              <Text fontSize="$lg" fontWeight="$semibold" mt="-8px" mb="$3">
                Developer experience
              </Text>
              <Text color="$neutral11">An intuitive and familiar API that help you speed up your development.</Text>
            </GridItem>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

function FooterSection(props: HTMLHopeProps<"div">) {
  return (
    <Box minH="calc(50vh - 72px)" bg="$neutral12" {...props}>
      <Container>
        <VStack mx={{ "@initial": "$4", "@lg": "auto" }}></VStack>
      </Container>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <VStack alignItems="stretch">
      <Header />
      <HeroSection />
      <FeatureSection />
    </VStack>
  );
}
