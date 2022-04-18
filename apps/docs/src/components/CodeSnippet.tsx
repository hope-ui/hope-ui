import { Box, HTMLHopeProps } from "@hope-ui/design-system";
import { mergeProps, splitProps } from "solid-js";

export interface CodeSnippetProps extends HTMLHopeProps<"div"> {
  snippet?: string;
  lang?: "bash" | "js" | "tsx" | "html" | "css";
}

export default function CodeSnippet(props: CodeSnippetProps) {
  const propsWithDefault = mergeProps({ lang: "tsx" }, props);
  const [local, others] = splitProps(propsWithDefault, ["snippet", "lang"]);

  return (
    <Box
      borderRadius="$lg"
      overflow="hidden"
      position="relative"
      fontSize="$sm"
      w="$full"
      {...others}
    >
      <pre class="line-numbers">
        <code class={`language-${local.lang}`}>{local.snippet}</code>
      </pre>
    </Box>
  );
}
