import "./storybook.scss";

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
      order: ["General", "Data entry", "Data display", "Navigation", "Feedback", "Overlay"],
    },
  },
  backgrounds: {
    default: "neutral-50",
    values: [
      {
        name: "white",
        value: "#fff",
      },
      {
        name: "neutral-50",
        value: "#f8f9fa",
      },
      {
        name: "dark-700",
        value: "#1a121e",
      },
    ],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
