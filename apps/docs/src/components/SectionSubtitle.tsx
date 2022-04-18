import { Heading, HTMLHopeProps } from "@hope-ui/design-system";

export default function SectionSubtitle(props: HTMLHopeProps<"h2">) {
  return <Heading as="h3" size="lg" mb="$3" {...props} />;
}
