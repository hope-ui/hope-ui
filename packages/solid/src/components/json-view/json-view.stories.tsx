import { HopeWrapper } from "../storybook-utils";
import { SolidJsonView } from ".";

const exampleJson = {
  stringV: "this is a test string",
  integer: 42,
  empty_array: [],
  empty_object: {},
  array: [1, 2, 3, "test"],
  float: -2.757,
  undefined_var: undefined,
  parent: {
    sibling1: true,
    sibling2: false,
    sibling3: null,
    isString: (value: any) => {
      if (typeof value === "string") {
        return "string";
      } else {
        return "other";
      }
    },
  },
  string_number: "1234",
  date: new Date(),
  regexp: /[0-9]/gi,
};

export default {
  title: "Data display/JsonViewer",
  component: SolidJsonView,
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <div style={{ width: "90vw" }}>
          <Story />
        </div>
      </HopeWrapper>
    ),
  ],
  argTypes: {
    theme: {
      control: { type: "select" },
      options: [
        "apathy",
        "apathy:inverted",
        "ashes",
        "bespin",
        "brewer",
        "bright:inverted",
        "bright",
        "chalk",
        "codeschool",
        "colors",
        "eighties",
        "embers",
        "flat",
        "google",
        "grayscale",
        "grayscale:inverted",
        "greenscreen",
        "harmonic",
        "hopscotch",
        "isotope",
        "marrakesh",
        "mocha",
        "monokai",
        "ocean",
        "paraiso",
        "pop",
        "railscasts",
        "jv_default",
        "shapeshifter",
        "shapeshifter:inverted",
        "solarized",
        "summerfruit",
        "summerfruit:inverted",
        "threezerotwofour",
        "tomorrow",
        "tube",
        "twilight",
      ],
    },
    displayDataTypes: {
      control: { type: "boolean" },
    },
    displayObjectSize: {
      control: { type: "boolean" },
    },
    //TODO: Work in Progress
    // onAdd: {
    //   control: { type: "boolean" },
    // },
    // onEdit: {
    //   control: { type: "boolean" },
    // },
    // onDelete: {
    //   control: { type: "boolean" },
    // },
    enableClipboard: {
      control: { type: "boolean" },
    },
    indentWidth: {
      control: { type: "number", min: 0 },
    },
    collapsed: {
      control: { type: "select" },
      options: [true, false, 1, 2],
    },
    fontSize: {
      control: { type: "text" },
    },
  },
  args: {
    theme: "jv_default",
    displayDataTypes: true,
    displayObjectSize: true,
    indentWidth: 4,
    //TODO: Work in Progress
    // onAdd: false,
    // onEdit: false,
    // onDelete: false,
    enableClipboard: true,
    collapsed: false,
    fontSize: "12px",
  },
};

export const Default = (args: any) => (
  <SolidJsonView style={{ "font-size": args.fontSize }} src={exampleJson} {...args} />
);
Default.storyName = "JsonViewer";
