import { HopeWrapper } from "@/utils/storybook";

import { Flex, IconExternalLink, Text } from "..";
import { Anchor } from "./anchor";

export default {
  title: "Navigation/Anchor",
  component: Anchor,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
};

export const Default = (args: any) => (
  <Flex direction="column" rowGap="$4">
    <Anchor>Hope UI</Anchor>
    <Anchor href="https://hope-ui-solid.vercel.app" external>
      Hope Design system <IconExternalLink mx="2px" />
    </Anchor>
    <Text>
      Did you know that{" "}
      <Anchor color="$primary9" href="#">
        links can live inline with text
      </Anchor>
    </Text>
  </Flex>
);
Default.storyName = "Anchor";
