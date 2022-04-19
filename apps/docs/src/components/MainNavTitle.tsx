import { ElementType, Text, TextProps } from "@hope-ui/solid";

export default function MainNavTitle<C extends ElementType = "p">(props: TextProps<C>) {
  return <Text as="span" fontSize="$sm" fontWeight="$bold" textTransform="uppercase" {...props} />;
}
