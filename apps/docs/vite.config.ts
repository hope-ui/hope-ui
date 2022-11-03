// @ts-ignore
import mdx from "@hope-ui/mdx";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import solid from "solid-start/vite";
// @ts-ignore
import netlify from "solid-start-netlify";
// @ts-ignore
import node from "solid-start-node";
import { defineConfig } from "vite";

const adapter = process.env.GITHUB_ACTIONS ? node() : netlify();

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    await mdx({
      rehypePlugins: [rehypePrettyCode],
      remarkPlugins: [remarkGfm],
    }),
    solid({ adapter, extensions: [".mdx", ".md"] }),
  ],
});
