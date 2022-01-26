module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      babelConfig: {
        presets: ["babel-preset-solid", "@babel/preset-env"],
      },
    },
  },

  // The test environment that will be used for testing, jsdom for browser environment
  // https://jestjs.io/docs/configuration#testenvironment-string
  testEnvironment: "jsdom",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed
  // https://jestjs.io/docs/configuration#setupfilesafterenv-array
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Code coverage config
  // https://jestjs.io/docs/configuration#collectcoveragefrom-array
  coverageDirectory: "<rootDir>/coverage/",
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!**/__mocks__/**",
    "!**/node_modules/**",
    "!**/*.d.ts",
  ],

  moduleNameMapper: {
    // SolidJS cannot detect browser mode here,
    // so we need to manually point it to the right versions:
    "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
    "solid-js/store": "<rootDir>/node_modules/solid-js/store/dist/store.cjs",
    "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs",

    // Handle TypeScript path aliases
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  verbose: true,
  testTimeout: 30000,
};
