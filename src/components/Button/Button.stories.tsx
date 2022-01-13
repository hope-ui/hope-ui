import { HopeProvider } from "@/contexts";
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
      options: ["filled", "light", "outline", "dashed", "text", "default"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "dark", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    radius: {
      control: { type: "select" },
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    loaderPosition: {
      control: { type: "inline-radio" },
      options: ["left", "right"],
    },
    compact: {
      control: { type: "boolean" },
    },
    uppercase: {
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
    variant: "filled",
    color: "primary",
    size: "sm",
    radius: "sm",
    loaderPosition: "left",
    compact: false,
    uppercase: false,
    fullWidth: false,
    loading: false,
    disabled: false,
    children: "Button",
  },
};

export const BasicUsage = (args: any) => <Button {...args} />;
BasicUsage.storyName = "Basic usage";

export const WithLeftIcon = (args: any) => <Button leftIcon={<IconInfoCircle />} {...args} />;
WithLeftIcon.storyName = "With left icon";
WithLeftIcon.args = { children: "Informations" };

export const WithRightIcon = (args: any) => <Button rightIcon={<IconInfoCircle />} {...args} />;
WithRightIcon.storyName = "With right icon";
WithRightIcon.args = { children: "Informations" };
