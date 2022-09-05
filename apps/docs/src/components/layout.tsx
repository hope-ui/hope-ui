import { Anchor, Box, Flex, hope, HStack, Text } from "@hope-ui/core";
import { Link, useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

import { NAV_SECTIONS, NavSection } from "../NAV_SECTIONS";
import { ArrowLeftIcon, ArrowRightIcon, ExclamationCircleMiniIcon, GitHubIcon } from "./icons";
import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-navigation";
import { Navigation } from "./navigation";
import { TableOfContents } from "./table-of-contents";

const PageLink = hope(Link, {
  base: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    color: "neutral.500",
    fontSize: "base",
    lineHeight: 6,
    fontWeight: "semibold",

    _hover: {
      color: "neutral.600",
    },
  },
});

const StyledHeader = hope("header", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",

    boxShadow: "md",
    backgroundColor: "common.white",

    px: [4, 6, null, 8],
    py: 5,
  },
});

interface HeaderProps {
  navSections: NavSection[];
}

function Header(props: HeaderProps) {
  return (
    <Box pos="sticky" top={0} zIndex="sticky">
      <HStack
        fontSize="sm"
        fontWeight="medium"
        lineHeight={5}
        px={2}
        py={1}
        spacing={1}
        bg="danger.600"
        color="common.white"
      >
        <ExclamationCircleMiniIcon fontSize="1.3em" />
        <span>
          You are looking at the <em>work in progress</em> documentation of Hope UI{" "}
          <strong>1.0</strong>, examples and information may be broken or outdated.
        </span>
      </HStack>
      <StyledHeader>
        <Flex d={{ lg: "none" }} mr={4}>
          <MobileNavigation sections={props.navSections} />
        </Flex>
        <Flex pos="relative" alignItems="center" flexGrow={1} flexBasis={0}>
          <HStack as={Link} href="/" aria-label="Home page" spacing={2}>
            <Logo boxSize={8} />
            <hope.span color="neutral.900" fontWeight="medium" fontSize="xl">
              Hope
              <hope.span color="primary.500" fontWeight="bold" ml={1}>
                UI
              </hope.span>
            </hope.span>
            <hope.span
              rounded="sm"
              bg="neutral.100"
              px="1.5"
              py="1"
              fontSize="sm"
              lineHeight="none"
              fontWeight="medium"
            >
              v1.0.0-next.0
            </hope.span>
          </HStack>
        </Flex>
        <Box mr={[6, 8, 0]} my={({ vars }) => `calc(${vars.space[5]} * -1)`}>
          {/*<Search />*/}
        </Box>
        <Flex
          pos="relative"
          flexBasis={0}
          justifyContent="flex-end"
          gap={[6, 8]}
          flexGrow={{ md: 1 }}
        >
          {/*<ThemeSelector />*/}
          <Anchor
            unstyled
            isExternal
            href="https://github.com/hope-ui/hope-ui"
            aria-label="GitHub"
            color="neutral.600"
            _hover={{
              color: "neutral.700",
            }}
          >
            <GitHubIcon boxSize={5} />
          </Anchor>
        </Flex>
      </StyledHeader>
    </Box>
  );
}

export function Layout(props: ParentProps) {
  const location = useLocation();

  const allLinks = NAV_SECTIONS.flatMap(section => section.links);
  const linkIndex = () => allLinks.findIndex(link => link.href === location.pathname);
  const previousPage = () => allLinks[linkIndex() - 1];
  const nextPage = () => allLinks[linkIndex() + 1];
  const section = () => {
    return NAV_SECTIONS.find(section =>
      section.links.find(link => link.href === location.pathname)
    );
  };

  return (
    <>
      <Header navSections={NAV_SECTIONS} />
      <Flex
        pos="relative"
        mx="auto"
        maxW="8xl"
        justifyContent="center"
        px={{ sm: 2, lg: 8, xl: 12 }}
      >
        <Box d={{ base: "none", lg: "block" }} pos={{ lg: "relative" }} flex={{ lg: "none" }}>
          <Box
            pos="sticky"
            top="100px" // height of the header
            ml={({ vars }) => `calc(${vars.space["0.5"]} * -1)`}
            h="calc(100vh - 100px)" // 100vh - height of the header
            overflowY="auto"
            overflowX="hidden"
            py={16}
            pl={0.5}
          >
            <Navigation sections={NAV_SECTIONS} w={{ base: 64, xl: 72 }} pr={{ base: 8, xl: 16 }} />
          </Box>
        </Box>
        <Box
          minW={0}
          maxW={{ base: "2xl", lg: "none" }}
          flex="1 1 auto"
          px={{ base: 4, xl: 16 }}
          pr={{ lg: 0 }}
          pl={{ lg: 8 }}
          py={16}
        >
          <article>
            <Show when={section()}>
              <header>
                <Text size="sm" fontFamily="display" fontWeight="medium" color="primary.500">
                  {section()?.title}
                </Text>
              </header>
            </Show>
            <div>{props.children}</div>
          </article>
          <Flex
            as="dl"
            mt={12}
            pt={6}
            borderTop="1px"
            borderTopStyle="solid"
            borderTopColor="neutral.200"
          >
            <Show when={previousPage()}>
              <div>
                <hope.dt fontSize="sm" lineHeight={5} fontWeight="medium" color="neutral.900">
                  Previous
                </hope.dt>
                <hope.dd mt={1}>
                  <PageLink href={previousPage().href}>
                    <ArrowLeftIcon aria-hidden="true" />
                    <span>{previousPage().title}</span>
                  </PageLink>
                </hope.dd>
              </div>
            </Show>
            <Show when={nextPage()}>
              <Box ml="auto" textAlign="right">
                <hope.dt fontSize="sm" lineHeight={5} fontWeight="medium" color="neutral.900">
                  Next
                </hope.dt>
                <hope.dd mt={1}>
                  <PageLink href={nextPage().href}>
                    <span>{nextPage().title}</span>
                    <ArrowRightIcon aria-hidden="true" />
                  </PageLink>
                </hope.dd>
              </Box>
            </Show>
          </Flex>
        </Box>
        <TableOfContents />
      </Flex>
    </>
  );
}
