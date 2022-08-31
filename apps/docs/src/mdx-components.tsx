import { Anchor, Heading, hope, Text } from "@hope-ui/core";
import { Link } from "@solidjs/router";

export default {
  h1: props => (
    <Heading
      level={1}
      size="4xl"
      fontWeight="semibold"
      fontFamily="display"
      letterSpacing="tight"
      color="neutral.900"
      mt={1}
      mb={9}
      {...props}
    />
  ),
  h2: props => (
    <Heading
      level={2}
      color="neutral.800"
      size="3xl"
      fontWeight="medium"
      fontFamily="display"
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="neutral.200"
      mt={10}
      pb={1}
      {...props}
    />
  ),
  h3: props => (
    <Heading
      level={3}
      color="neutral.800"
      size="2xl"
      fontWeight="medium"
      fontFamily="display"
      mt={8}
      {...props}
    />
  ),
  p: props => <Text _notFirst={{ mt: 6 }} {...props} />,
  code: props => (
    <hope.code
      sx={vars => ({
        fontSize: "0.9em",
        fontFamily: "mono",
        rounded: "md",
        bg: "neutral.100",
        border: `1px solid ${vars.colors.neutral["300"]}`,
        px: "0.25em",
        py: "2px",
        overflowWrap: "break-word",
      })}
      {...props}
    />
  ),
  a: props => <Anchor as={Link} color="primary.500" textDecoration="underline" {...props} />,
};
