import { Flex } from "@hope-ui/solid";

import MainNavContent from "./MainNavContent";

export default function MainNavigation() {
  return (
    <Flex
      as="nav"
      class="hide-scrollbar"
      position="sticky"
      top="92px"
      overflowY="auto"
      display={{
        "@initial": "none",
        "@lg": "flex",
      }}
      direction="column"
      flexShrink="0"
      maxW="$60"
      height="calc(100vh - 92px)"
      p="$6"
    >
      <MainNavContent />
    </Flex>
  );
}
