import { action } from "@storybook/addon-actions";

import { HopeWrapper } from "@/utils/storybook";

import { AsyncButton } from "./async-button";

export default {
  title: "General/AsyncButton",
  component: AsyncButton,
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <div style={{ display: "flex", "justify-content": "center", width: "90vw" }}>
          <Story />
        </div>
      </HopeWrapper>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["solid", "subtle", "outline", "dashed", "ghost"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    loaderPlacement: {
      control: { type: "inline-radio" },
      options: ["start", "end"],
    },
    compact: {
      control: { type: "boolean" },
    },
    fullWidth: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    loadingText: {
      control: "text",
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "solid",
    colorScheme: "primary",
    size: "md",
    loaderPlacement: "start",
    compact: false,
    fullWidth: false,
    disabled: false,
    loadingText: "",
    children: "Async button",
    onClick: async () => {
      action("clicked");
      await new Promise(resolve => setTimeout(resolve, 10000));
    },
  },
};

export const Default = (args: any) => <AsyncButton {...args} />;
Default.storyName = "AsyncButton";
