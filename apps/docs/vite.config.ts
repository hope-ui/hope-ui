import solid from "solid-start/vite";
import netlify from "solid-start-netlify";
import node from "solid-start-node";
import { defineConfig } from "vite";

const adapter = process.env.GITHUB_ACTIONS ? node() : netlify();

export default defineConfig({
  plugins: [solid({ adapter })],
});
