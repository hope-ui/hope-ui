const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: "@storybook/html",
  core: {
    builder: "webpack5",
  },
  babel: async options => ({
    ...options,
    presets: ["@babel/preset-typescript", "solid"],
  }),
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        "style-loader",
        "css-loader",
        {
          loader: "sass-loader",
          options: {
            webpackImporter: false,
            sassOptions: {
              includePaths: ["node_modules"],
            },
            implementation: require.resolve("sass"),
          },
        },
      ],
      include: path.resolve(__dirname, "./"),
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };

    return config;
  },
};
