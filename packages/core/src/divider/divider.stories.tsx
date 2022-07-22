import { Divider } from "./divider";

export default {
  title: "Data display/Divider",
  component: Divider,
  decorators: [
    (Story: any) => (
      <div style={{ height: "100px" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "dashed"],
      defaultValue: "solid",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
    labelPlacement: {
      control: "select",
      options: ["start", "center", "end"],
      defaultValue: "start",
    },
    children: {
      control: "text",
      defaultValue: "Label",
    },
  },
  args: {
    variant: "solid",
    orientation: "horizontal",
    labelPlacement: "start",
    children: "Label",
  },
};

export const Default = (args: any) => <Divider {...args} />;
