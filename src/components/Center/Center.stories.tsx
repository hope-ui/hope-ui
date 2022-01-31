import { HopeWrapper } from "@/utils/storybookUtils";

import { Center } from "./Center";

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
  <Center bg="info500" w="40" h="24" color="white">
    This is the Center
  </Center>
);
Default.storyName = "Center";
