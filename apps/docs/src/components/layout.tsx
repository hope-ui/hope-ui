import { Box, createIcon, Flex, hope, rgba } from "@hope-ui/core";
import { useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

import { NAV_SECTIONS } from "../NAV_SECTIONS";

const GitHubIcon = createIcon({
  viewBox: "0 0 16 16",
  path: () => (
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
    />
  ),
});

const StyledHeader = hope("header", vars => ({
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

    _dark: {
      boxShadow: "none",
      backgroundColor: rgba(vars.colors.neutral["900"], 0.95),
    },
  },
}));

function Header() {
  return (
    <StyledHeader>
      <Flex d={{ lg: "none" }} mr={6}>
        {/* <MobileNavigation navigation={NAV_SECTIONS} /> */}
      </Flex>
      <Flex pos="relative" alignItems="center" flexGrow={1} flexBasis={0}>
        {/*
        <Link href="/" aria-label="Home page">
          <Logomark class="h-9 w-9 lg:hidden" />
          <Logo class="hidden h-9 w-auto fill-slate-700 dark:fill-sky-100 lg:block" />
        </Link>
        */}
      </Flex>
      <Box mr={[6, 8, 0]} my={vars => `calc(${vars.space[5]} * -1)`}>
        {/*<Search />*/}
      </Box>
      <Flex class="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow">
        {/*<ThemeSelector class="relative z-10" />*/}
        {/*
        <Link href="https://github.com/hope-ui/hope-ui" class="group" aria-label="GitHub">
          <GitHubIcon class="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
        </Link>
        */}
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

  /*
  const currentSection = useTableOfContents(tableOfContents);

  function isActive(section) {
    if (section.id === currentSection) {
      return true;
    }
    if (!section.children) {
      return false;
    }
    return section.children.findIndex(isActive) > -1;
  }
  */

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
            pos="absolute"
            top={0}
            bottom={0}
            right={0}
            w="50vw"
            bg="neutral.50"
            _dark={{ display: "none" }}
          />
          <div class="sticky top-[4.5rem] -ml-0.5 h-[calc(100vh-4.5rem)] overflow-y-auto py-16 pl-0.5">
            <div class="absolute top-16 bottom-0 right-0 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
            <div class="absolute top-28 bottom-0 right-0 hidden w-px bg-slate-800 dark:block" />
            {/*<Navigation navigation={NAV_SECTIONS} class="w-64 pr-8 xl:w-72 xl:pr-16" />*/}
          </div>
        </Box>
        <div class="min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none lg:pr-0 lg:pl-8 xl:px-16">
          <article>
            {/*
            {(title || section()) && (
              <header class="mb-9 space-y-1">
                {section() && (
                  <p class="font-display text-sm font-medium text-sky-500">{section()?.title}</p>
                )}
                {title && (
                  <h1 class="font-display text-3xl tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h1>
                )}
              </header>
            )}
            <Prose>{props.children}</Prose>
            */}
          </article>
          <Flex
            as="dl"
            mt={12}
            pt={6}
            borderTop="1px"
            borderTopColor="neutral.200"
            _dark={{ borderTopColor: "neutral.800" }}
          >
            <Show when={previousPage()}>
              <div>
                <dt class="font-display text-sm font-medium text-slate-900 dark:text-white">
                  Previous
                </dt>
                <dd class="mt-1">
                  {/*
                  <Link
                    href={previousPage.href}
                    class="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    <span aria-hidden="true">&larr;</span> {previousPage.title}
                  </Link>
                  */}
                </dd>
              </div>
            </Show>
            <Show when={nextPage()}>
              <div class="ml-auto text-right">
                <dt class="font-display text-sm font-medium text-slate-900 dark:text-white">
                  Next
                </dt>
                <dd class="mt-1">
                  {/*
                  <Link
                    href={nextPage.href}
                    class="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {nextPage.title} <span aria-hidden="true">&rarr;</span>
                  </Link>
                  */}
                </dd>
              </div>
            </Show>
          </Flex>
        </div>
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
