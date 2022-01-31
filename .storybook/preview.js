import { themes } from "@storybook/theming";

import { render } from "solid-js/web";

let disposeStory;

// SolidJS decorators
export const decorators = [
  Story => {
    if (disposeStory) {
      disposeStory();
    }
    const root = document.getElementById("root");
    const solid = document.createElement("div");

    solid.setAttribute("id", "solid-root");
    root.appendChild(solid);
    disposeStory = render(Story, solid);
    return solid;
  },
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  decorators,
  options: {
    storySort: {
      order: [
        "General",
        "Layout",
        "Data entry",
        "Data display",
        "Navigation",
        "Feedback",
        "Overlay",
      ],
    },
  },
  darkMode: {
    dark: { ...themes.dark, appBg: "#141517", appContentBg: "#1a1b1e" },
    light: { ...themes.normal, appBg: "#f9fafb", appContentBg: "#ffffff" },
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
