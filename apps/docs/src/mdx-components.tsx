import { Anchor, Heading, hope, Text } from "@hope-ui/core";
import { Link } from "@solidjs/router";

export default {
  h1: (props: any) => (
    <Heading
      level={1}
      size="4xl"
      fontWeight="semibold"
      fontFamily="display"
      letterSpacing="tight"
      color="neutral.900"
      mt={1}
      mb={8}
      {...props}
    />
  ),
  h2: (props: any) => (
    <Heading
      level={2}
      color="neutral.800"
      size="3xl"
      fontWeight="semibold"
      fontFamily="display"
      borderBottom={vars => `1px solid ${vars.colors.neutral[200]} `}
      mt={10}
      pb={1}
      {...props}
    />
  ),
  h3: (props: any) => (
    <Heading
      level={3}
      color="neutral.800"
      size="2xl"
      fontWeight="semibold"
      fontFamily="display"
      mt={8}
      {...props}
    />
  ),
  p: (props: any) => <Text _notFirst={{ mt: 6 }} {...props} />,
  a: (props: any) => <Anchor as={Link} color="primary.500" textDecoration="underline" {...props} />,
  code: (props: any) => (
    <hope.code
      fontSize="0.9em"
      fontFamily="mono"
      rounded="md"
      bg="neutral.100"
      px="0.4em"
      py="0.2em"
      sx={vars => ({
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
      })}
      {...props}
    />
  ),
  ul: (props: any) => <hope.ul ml={6} mt={6} sx={{ listStyleType: "disc" }} {...props} />,
  ol: (props: any) => <hope.ol ml={6} mt={6} sx={{ listStyleType: "decimal" }} {...props} />,
  li: (props: any) => <hope.li my={3} {...props} />,
  table: (props: any) => (
    <hope.table
      p={0}
      w="full"
      fontSize="sm"
      lineHeight={5}
      _notFirst={{ mt: 6 }}
      sx={{ borderCollapse: "collapse" }}
      {...props}
    />
  ),
  tr: (props: any) => (
    <hope.tr
      m={0}
      p={0}
      _notLast={vars => ({
        borderBottom: `1px solid ${vars.colors.neutral[300]} `,
      })}
      _even={{ bg: "neutral.50" }}
      {...props}
    />
  ),
  th: (props: any) => (
    <hope.th
      m={0}
      px={4}
      py={2}
      color="neutral.600"
      fontWeight="semibold"
      textAlign="start"
      borderBottom={vars => `1px solid ${vars.colors.neutral[300]} `}
      {...props}
    />
  ),
  td: (props: any) => <hope.td m={0} px={4} py={2} {...props} />,
};
