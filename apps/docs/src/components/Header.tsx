import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  hope,
  HStack,
  IconButton,
  Tag,
  Text,
  useColorMode,
  useColorModeValue,
} from "@hope-ui/solid";
import { Link } from "solid-app-router";
import { createSignal } from "solid-js";

import { IconGithub } from "@/icons/IconGithub";
import { IconMenu } from "@/icons/IconMenu";
import { IconMoon } from "@/icons/IconMoon";
import { IconSun } from "@/icons/IconSun";

import MainNavContent from "./MainNavContent";

export default function Header() {
  const [isMainNavOverlayVisible, setIsMainNavOverlayVisible] = createSignal(false);

  const { toggleColorMode } = useColorMode();
  const headerBgColor = useColorModeValue("white", "$neutral1");
  const colorModeButtonIcon = useColorModeValue(<IconMoon />, <IconSun />);
  const headerShadow = useColorModeValue("$sm", "$none");

  const toggleMainNavOverlay = () => {
    setIsMainNavOverlayVisible(prev => !prev);
  };

  const onNavKeyup = (event: KeyboardEvent) => {
    if (isMainNavOverlayVisible() && event.key === "Enter") {
      setIsMainNavOverlayVisible(false);
    }
  };

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      left="0"
      right="0"
      zIndex="$sticky"
      height="72px"
      flexShrink={0}
      shadow={headerShadow()}
      bg={headerBgColor()}
    >
      <Container h="$full">
        <HStack h="$full" px="$4" justifyContent="space-between">
          <HStack spacing="$2">
            <IconButton
              display={{ "@lg": "none" }}
              aria-label="Open main navigation"
              variant="ghost"
              colorScheme="neutral"
              size="sm"
              rounded="$md"
              fontSize="$lg"
              icon={<IconMenu />}
              onClick={toggleMainNavOverlay}
            />
            <Text as={Link} href="/" textDecoration="none" letterSpacing="$wide" fontSize="$2xl">
              <hope.span color="$neutral12" fontWeight="$medium" mr="$1">
                Hope
              </hope.span>
              <hope.span color="$primary9" fontWeight="$bold">
                UI
              </hope.span>
            </Text>
            <Tag size="sm" rounded="$sm" fontWeight="$semibold">
              v0.6.1
            </Tag>
          </HStack>
          <HStack spacing="$2">
            <IconButton
              as="a"
              href="https://github.com/fabien-ml/hope-ui"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Go to the github repository"
              variant="ghost"
              colorScheme="neutral"
              size="sm"
              rounded="$md"
              fontSize="$lg"
              icon={<IconGithub />}
            />
            <IconButton
              aria-label="Toggle color mode"
              variant="ghost"
              colorScheme="neutral"
              size="sm"
              rounded="$md"
              fontSize="$lg"
              icon={colorModeButtonIcon}
              onClick={toggleColorMode}
            />
          </HStack>
        </HStack>
      </Container>
      <Drawer
        placement="left"
        opened={isMainNavOverlayVisible()}
        onClose={() => setIsMainNavOverlayVisible(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader fontWeight="$bold" fontSize="$2xl">
            Hope UI
          </DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <hope.nav d="flex" flexDirection="column" onKeyUp={onNavKeyup}>
              <MainNavContent />
            </hope.nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
