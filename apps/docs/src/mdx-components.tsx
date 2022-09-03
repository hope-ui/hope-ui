import { hope } from "@hope-ui/core";
import { Link, LinkProps } from "@solidjs/router";
import { createMemo } from "solid-js";

const H1 = hope("h1", {
  base: {
    color: "neutral.900",
    fontFamily: "display",
    fontSize: "4xl",
    fontWeight: "medium",
    lineHeight: 10,
    letterSpacing: "tight",
    mt: 1,
    mb: 8,
  },
});

const H2 = hope("h2", vars => ({
  base: {
    color: "neutral.800",
    fontFamily: "display",
    fontSize: "3xl",
    fontWeight: "medium",
    lineHeight: 9,
    mt: 10,
    pb: 1,
    borderBottom: `1px solid ${vars.colors.neutral[200]}`,
  },
}));

const H3 = hope("h3", {
  base: {
    color: "neutral.800",
    fontFamily: "display",
    fontSize: "2xl",
    fontWeight: "medium",
    lineHeight: 8,
    mt: 8,
  },
});

const P = hope("p", {
  base: {
    _notFirst: {
      mt: 6,
    },
  },
});

const Code = hope("code", vars => ({
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

    // Reset style inside table (ex: for props tables).
    "table &": {
      color: "primary.500",
      bg: "transparent",
      px: 0,
    },
  },
}));

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

const Tr = hope("tr", vars => ({
  base: {
    m: 0,
    p: 0,
    _notLast: {
      borderBottom: `1px solid ${vars.colors.neutral[300]}`,
    },
    _even: {
      bg: "neutral.50",
    },
  },
}));

const Th = hope("th", vars => ({
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
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  code: Code,
  ul: Ul,
  ol: Ol,
  li: Li,
  table: Table,
  tr: Tr,
  th: Th,
  td: Td,
  a: A, //(props: any) => <Anchor as={Link} color="primary.500" textDecoration="underline" {...props} />,
};
