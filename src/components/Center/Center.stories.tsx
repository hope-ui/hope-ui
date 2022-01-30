import { HopeProvider } from "@/theme/HopeProvider";

import { Center } from "./Center";

export default {
  title: "Layout/Center",
  component: Center,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <Story />
      </HopeProvider>
    ),
  ],
};

export const Default = () => (
  <Center bg="info500" w="40" h="24" color="white">
    This is the Center
  </Center>
);
Default.storyName = "Center";
