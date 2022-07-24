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
    },
    thickness: {
      control: "text",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    labelPlacement: {
      control: "select",
      options: ["start", "center", "end"],
    },
    children: {
      control: "text",
    },
  },
  args: {
    variant: "solid",
    thickness: "1",
    orientation: "horizontal",
    labelPlacement: "start",
    children: "Label",
  },
};

export const Default = (args: any) => <Divider {...args} />;
