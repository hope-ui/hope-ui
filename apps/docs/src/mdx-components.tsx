import { hope, IconButton } from "@hope-ui/core";
import { Title as MetaTitle } from "@solidjs/meta";
import { Link, LinkProps } from "@solidjs/router";
import { ComponentProps, createMemo, createSignal, Show, splitProps } from "solid-js";

import { CheckIcon, ClipboardIcon } from "./components/icons";

const H1 = hope("h1", {
  base: {
    color: "neutral.800",
    fontFamily: "display",
    fontSize: "4xl",
    fontWeight: "medium",
    lineHeight: 10,
    letterSpacing: "tight",
    mt: 1,
    scrollMarginTop: "150px", // header height x1.5
    mb: 8,
  },
});

const H2 = hope("h2", ({ vars }) => ({
  base: {
    color: "neutral.700",
    fontFamily: "display",
    fontSize: "3xl",
    fontWeight: "medium",
    lineHeight: 9,
    mt: 10,
    scrollMarginTop: "150px", // header height x1.5
    pb: 1,
    borderBottom: `1px solid ${vars.colors.neutral[200]}`,
  },
}));

const H3 = hope("h3", {
  base: {
    color: "neutral.700",
    fontFamily: "display",
    fontSize: "2xl",
    fontWeight: "medium",
    lineHeight: 8,
    mt: 8,
    scrollMarginTop: "150px", // header height x1.5
  },
});

const P = hope("p", {
  base: {
    _notFirst: {
      mt: 6,

      "h3 + &": {
        mt: 4,
      },
    },
  },
});

const Code = hope("code", ({ vars }) => ({
  base: {
    rounded: "md",
    bg: "neutral.100",
    px: "0.4em",
    py: "0.2em",
    fontSize: "0.9em",
    fontFamily: "mono",
    overflowWrap: "break-word",

    // Reset style inside Callout.
    ".hope-docs-Callout-root &": {
      border: `1px solid ${vars.colors.neutral["300"]}`,
      color: "neutral.700",
    },

    // Reset style inside headings.
    "h1 &, h2 &, h3 &": {
      rounded: "none",
      bg: "transparent",
      p: 0,
      color: "primary.500",
      fontWeight: "semibold",
    },

    // Reset style inside table (ex: for props tables).
    "table &": {
      rounded: "none",
      bg: "transparent",
      p: 0,
      color: "primary.500",
    },
  },
}));

const Pre = (props: ComponentProps<"pre">) => {
  let domRef: HTMLPreElement | undefined;

  const [local, others] = splitProps(props, ["children"]);

  const [isCopied, setIsCopied] = createSignal(false);

  const reset = () => {
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    const innerText = domRef?.querySelector("code")?.innerText ?? "";
    setIsCopied(true);
    void navigator.clipboard.writeText(innerText);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <pre ref={domRef} onMouseLeave={reset} {...others}>
      <IconButton
        aria-label="copy to clipboard"
        variant={isCopied() ? "soft" : "plain"}
        colorScheme={isCopied() ? "success" : "neutral"}
        onClick={copyToClipboard}
        size="xs"
        pos="absolute"
        top={2}
        right={2}
        zIndex="docked"
        fontSize="16px"
        styleConfig={{
          root: {
            compoundVariants: [
              {
                variants: {
                  variant: "plain",
                  colorScheme: "neutral",
                },
                style: {
                  _hover: {
                    bg: "neutral.200",
                  },
                },
              },
            ],
          },
        }}
      >
        <Show when={isCopied()} fallback={<ClipboardIcon />}>
          <CheckIcon />
        </Show>
      </IconButton>
      {local.children}
    </pre>
  );
};

const Ul = hope("ul", {
  base: {
    ml: 6,
    mt: 6,
    listStyleType: "disc",
  },
});

const Ol = hope("ol", {
  base: {
    ml: 6,
    mt: 6,
    listStyleType: "decimal",
  },
});

const Li = hope("li", {
  base: {
    my: 3,
  },
});

const Table = hope("table", {
  base: {
    w: "full",
    p: 0,
    fontSize: "sm",
    lineHeight: 5,
    borderCollapse: "collapse",
    _notFirst: {
      mt: 6,
    },
  },
});

const Tr = hope("tr", ({ vars }) => ({
  base: {
    m: 0,
    p: 0,
    _notLast: {
      borderBottom: `1px solid ${vars.colors.neutral[200]}`,
    },
    _even: {
      bg: "neutral.50",
    },
  },
}));

const Th = hope("th", ({ vars }) => ({
  base: {
    m: 0,
    px: 4,
    py: 2,
    color: "neutral.600",
    fontWeight: "semibold",
    textAlign: "start",
    borderBottom: `1px solid ${vars.colors.neutral[300]}`,
  },
}));

const Td = hope("td", {
  base: {
    m: 0,
    px: 4,
    py: 2,
  },
});

const ExternalLink = (props: LinkProps) => {
  const isExternal = createMemo(() => props.href[0] !== "/");

  return (
    <Link
      {...props}
      target={isExternal() ? "_blank" : undefined}
      rel={isExternal() ? "noopener noreferrer" : undefined}
    />
  );
};

const A = hope(ExternalLink, {
  base: {
    color: "primary.500",
    textDecoration: "underline",
  },
});

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => {
    const [local, others] = splitProps(props, ["children"]);

    return (
      <H1 {...others}>
        <MetaTitle>{local.children + " | Hope UI"}</MetaTitle>
        {local.children}
      </H1>
    );
  },
  h2: H2,
  h3: H3,
  p: P,
  code: Code,
  pre: Pre,
  ul: Ul,
  ol: Ol,
  li: Li,
  table: Table,
  tr: Tr,
  th: Th,
  td: Td,
  a: A,
};
