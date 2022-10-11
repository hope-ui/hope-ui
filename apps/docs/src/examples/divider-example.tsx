import { Divider, HStack, Text, VStack } from "@hope-ui/core";

import { SearchIcon } from "../components/icons";

export function WithLabelExample() {
  return (
    <VStack spacing={4}>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </Text>
      <Divider>Start</Divider>
      <Text>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
      <Divider labelPlacement="center">Center</Divider>
      <Text>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
        laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
        architecto beatae vitae dicta sunt explicabo.
      </Text>
      <Divider labelPlacement="end">End</Divider>
      <Text>
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
        consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
        velit, sed quia non numquam eius modi.
      </Text>
      <Divider
        labelPlacement="center"
        labelProps={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SearchIcon boxSize={5} />
        <Text fontWeight="semibold" fontSize="lg">
          Custom label
        </Text>
      </Divider>
      <Text>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
        voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
        cupiditate non provident
      </Text>
    </VStack>
  );
}

export function VerticalWithLabelExample() {
  return (
    <HStack spacing={4}>
      <Text flex={1}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
      </Text>
      <Divider orientation="vertical" labelPlacement="center">
        Or
      </Divider>
      <Text flex={1}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>
    </HStack>
  );
}
