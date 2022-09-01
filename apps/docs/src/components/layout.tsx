import { Box, Flex, hope, HStack, Text } from "@hope-ui/core";
import { Link, useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

import { NAV_SECTIONS } from "../NAV_SECTIONS";
import { ArrowLeftIcon, ArrowRightIcon, GitHubIcon } from "./icons";
import { Logo } from "./logo";
import { Navigation } from "./navigation";
import { MobileNavigation } from "./mobile-navigation";

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
    position: "sticky",
    top: 0,
    zIndex: "sticky",

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

function Header() {
  return (
    <StyledHeader>
      <Flex d={{ lg: "none" }} mr={4}>
        <MobileNavigation sections={NAV_SECTIONS} />
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
        </HStack>
      </Flex>
      <Box mr={[6, 8, 0]} my={vars => `calc(${vars.space[5]} * -1)`}>
        {/*<Search />*/}
      </Box>
      <Flex
        pos="relative"
        flexBasis={0}
        justifyContent="flex-end"
        gap={[6, 8]}
        flexGrow={{ md: 1 }}
      >
        {/*<ThemeSelector class="relative z-10" />*/}
        <Link href="https://github.com/hope-ui/hope-ui" class="group" aria-label="GitHub">
          <GitHubIcon
            boxSize={6}
            color="neutral.700"
            _groupHover={{
              color: "neutral.800",
            }}
          />
        </Link>
      </Flex>
    </StyledHeader>
  );
}

export function Layout(props: ParentProps) {
  const location = useLocation();
  const allLinks = NAV_SECTIONS.flatMap(section => section.links);
  const linkIndex = () => allLinks.findIndex(link => link.href === location.pathname);
  const previousPage = () => allLinks[linkIndex() - 1];
  const nextPage = () => allLinks[linkIndex() + 1];
  const section = () =>
    NAV_SECTIONS.find(section => section.links.find(link => link.href === location.pathname));

  return (
    <>
      <Header />
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
            top="4.5rem"
            ml={vars => `calc(${vars.space["0.5"]} * -1)`}
            h="calc(100vh - 4.5rem)"
            overflowY="auto"
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
        {/*
        <div class="hidden xl:sticky xl:top-[4.5rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.5rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6">
          <nav aria-labelledby="on-this-page-title" class="w-56">
            {tableOfContents.length > 0 && (
              <>
                <h2
                  id="on-this-page-title"
                  class="font-display text-sm font-medium text-slate-900 dark:text-white"
                >
                  On this page
                </h2>
                <ol role="list" class="mt-4 space-y-3 text-sm">
                  {tableOfContents.map(section => (
                    <li key={section.id}>
                      <h3>
                        <Link
                          href={`#${section.id}`}
                          class={clsx(
                            isActive(section)
                              ? "text-sky-500"
                              : "font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                          )}
                        >
                          {section.title}
                        </Link>
                      </h3>
                      {section.children.length > 0 && (
                        <ol
                          role="list"
                          class="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400"
                        >
                          {section.children.map(subSection => (
                            <li key={subSection.id}>
                              <Link
                                href={`#${subSection.id}`}
                                class={
                                  isActive(subSection)
                                    ? "text-sky-500"
                                    : "hover:text-slate-600 dark:hover:text-slate-300"
                                }
                              >
                                {subSection.title}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </nav>
        </div>
        */}
      </Flex>
    </>
  );
}
