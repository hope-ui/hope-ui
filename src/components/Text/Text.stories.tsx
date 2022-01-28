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
    color: {
      control: "text",
    },
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
    font: {
      control: { type: "select" },
      options: ["sans", "serif", "mono"],
    },
    weight: {
      control: { type: "select" },
      options: [
        "hairline",
        "thin",
        "light",
        "normal",
        "medium",
        "semibold",
        "bold",
        "extrabold",
        "black",
      ],
    },
    letterSpacing: {
      control: { type: "select" },
      options: ["tighter", "tight", "normal", "wide", "wider", "widest"],
    },
    align: {
      control: { type: "select" },
      options: ["left", "right", "center", "justify"],
    },
    capitalized: {
      control: "boolean",
    },
    uppercased: {
      control: "boolean",
    },
    lowercased: {
      control: "boolean",
    },
    lineClamp: {
      control: { type: "select" },
      options: ["none", "1", "2", "3", "4", "5"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    color: "dark900",
    size: "base",
    font: "sans",
    weight: "normal",
    letterSpacing: "normal",
    align: "left",
    capitalized: false,
    uppercased: false,
    lowercased: false,
    lineClamp: "none",
    children:
      'Monkey D. Luffy, also known as "Straw Hat Luffy" and commonly as "Straw Hat", is the main protagonist of the manga and anime, One Piece. He is the founder and captain of the increasingly infamous and powerful Straw Hat Pirates, as well as one of its top fighters. His lifelong dream is to become the Pirate King by finding the legendary treasure left behind by the late Gol D. Roger. He believes that being the Pirate King means having the most freedom in the world.',
  },
};

export const Default = (args: any) => <Text {...args} />;
Default.storyName = "Text";
