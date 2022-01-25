import { HopeProvider } from "@/contexts/HopeContext";

import { Text } from "./Text";

export default {
  title: "Typography/Text",
  component: Text,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <div style={{ "max-width": "65ch" }}>
          <Story />
        </div>
      </HopeProvider>
    ),
  ],
  argTypes: {
    size: {
      control: { type: "select" },
      options: [
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
        "7xl",
        "8xl",
        "9xl",
      ],
    },
    weight: {
      control: { type: "select" },
      options: ["light", "normal", "medium", "semibold", "bold"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "dark", "neutral", "success", "info", "warning", "danger"],
    },
    align: {
      control: { type: "select" },
      options: ["left", "right", "center", "justify"],
    },
    lineClamp: {
      control: { type: "select" },
      options: ["none", "1", "2", "3", "4", "5"],
    },
    secondary: {
      control: "boolean",
    },
    children: {
      control: "text",
    },
  },
  args: {
    size: "base",
    weight: "normal",
    color: "dark",
    align: "left",
    children:
      'Monkey D. Luffy, also known as "Straw Hat Luffy" and commonly as "Straw Hat", is the main protagonist of the manga and anime, One Piece. He is the founder and captain of the increasingly infamous and powerful Straw Hat Pirates, as well as one of its top fighters. His lifelong dream is to become the Pirate King by finding the legendary treasure left behind by the late Gol D. Roger. He believes that being the Pirate King means having the most freedom in the world.',
  },
};

export const Default = (args: any) => <Text {...args} />;
Default.storyName = "Text";
