import { Anchor, Center, HStack, Text } from "@hope-ui/design-system";

import { IconGithub } from "@/icons/IconGithub";
import { IconTwitter } from "@/icons/IconTwitter";

export default function Footer() {
  return (
    <Center as="footer" flexDirection="column" h="$40">
      <Text mb="$3">Made in 🇫🇷 &nbsp;by Fabien MARIE-LOUISE</Text>
      <HStack spacing="$3">
        <Anchor external href="https://github.com/fabien-ml">
          <IconGithub boxSize="$5" color="$neutral11" />
        </Anchor>
        <Anchor external href="https://twitter.com/MLFabien">
          <IconTwitter boxSize="$5" color="$neutral11" />
        </Anchor>
      </HStack>
    </Center>
  );
}
