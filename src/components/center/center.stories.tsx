import { HopeWrapper } from "@/utils/storybook";

import { Center } from "./center";

export default {
  title: "Layout/Center",
  component: Center,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
};

export const Default = () => (
  <Center bg="$info7" w="$40" h="$24">
    This is the Center
  </Center>
);
Default.storyName = "Center";
