import { Flex } from "@hope-ui/design-system";

import MainNavContent from "./MainNavContent";

export default function MainNavigation() {
  return (
    <Flex
      as="nav"
      class="hide-scrollbar"
      position="sticky"
      top="72px"
      overflowY="auto"
      display={{
        "@initial": "none",
        "@lg": "flex",
      }}
      direction="column"
      flexShrink="0"
      maxW="$60"
      height="calc(100vh - 72px)"
      p="$6"
    >
      <MainNavContent />
    </Flex>
  );
}
