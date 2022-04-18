import { Heading, HTMLHopeProps } from "@hope-ui/design-system";

export default function PageTitle(props: HTMLHopeProps<"h1">) {
  return <Heading as="h1" size="3xl" fontWeight="$bold" mb="$6" {...props} />;
}
