# @hope-ui/tailwind

A TailwindCSS plugin to add Hope UI color palettes to the `tailwind.config` theme colors.

## Installation

```bash
npm install @hope-ui/tailwind
# or
yarn add @hope-ui/tailwind
# or
pnpm add @hope-ui/tailwind
```

## Usage

```js
// tailwind.config.js

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {},
  plugins: [require("@hope-ui/tailwind")],
};
```

## Changelog

All notable changes are described in the [CHANGELOG.md](./CHANGELOG.md) file.
