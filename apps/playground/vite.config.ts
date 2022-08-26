import solid from "solid-start/vite";
import node from "solid-start-node";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid({ adapter: node })],
});
