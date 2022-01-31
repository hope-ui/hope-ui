import { action } from "@storybook/addon-actions";
import { JSX } from "solid-js";

import { HopeWrapper } from "@/utils/storybookUtils";

import { IconButton } from "./IconButton";

function IconTrash(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none">
        <path
          d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
}

export default {
  title: "General/IconButton",
  component: IconButton,
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
      options: ["solid", "subtle", "outline", "dashed", "ghost", "default"],
    },
    colorScheme: {
      control: { type: "select" },
      options: ["primary", "neutral", "success", "info", "warning", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    borderRadius: {
      control: { type: "select" },
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"],
    },
    compact: {
      control: { type: "boolean" },
    },
    loading: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    "aria-label": {
      control: "text",
    },
  },
  args: {
    variant: "solid",
    colorScheme: "primary",
    size: "md",
    borderRadius: "sm",
    compact: false,
    loading: false,
    disabled: false,
    "aria-label": "Delete",
  },
};

export const Default = (args: any) => (
  <IconButton icon={<IconTrash />} onClick={action("clicked")} {...args} />
);
Default.storyName = "IconButton";
