import { action } from "@storybook/addon-actions";

import { HopeProvider } from "@/contexts/HopeContext";
import { IconInfoCircle } from "@/icons";

import { Button } from "./Button";

export default {
  title: "General/Button",
  component: Button,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeProvider>
        <div style={{ display: "flex", "justify-content": "center", width: "90vw" }}>
          <Story />
        </div>
      </HopeProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "subtle", "outline", "dashed", "ghost", "default"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "dark", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    borderRadius: {
      control: { type: "select" },
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"],
    },
    loaderPosition: {
      control: { type: "inline-radio" },
      options: ["left", "right"],
    },
    compact: {
      control: { type: "boolean" },
    },
    fullWidth: {
      control: { type: "boolean" },
    },
    loading: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "solid",
    colorScheme: "primary",
    size: "md",
    borderRadius: "sm",
    loaderPosition: "left",
    compact: false,
    fullWidth: false,
    loading: false,
    disabled: false,
    children: "Button",
  },
};

export const Default = (args: any) => <Button {...args} onClick={action("clicked")} />;

export const WithLeftIcon = (args: any) => (
  <Button leftIcon={<IconInfoCircle />} onClick={action("clicked")} {...args} />
);
WithLeftIcon.storyName = "With left icon";

export const WithRightIcon = (args: any) => (
  <Button rightIcon={<IconInfoCircle />} onClick={action("clicked")} {...args} />
);
WithRightIcon.storyName = "With right icon";
