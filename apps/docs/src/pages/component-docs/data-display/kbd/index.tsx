import { Kbd, ListItem, Text, UnorderedList } from "@hope-ui/design-system";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function KbdDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/data-display/image",
    label: "Image",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/data-display/list",
    label: "List",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#guideline", label: "Guideline" },
    { href: "#modifier", label: "Modifier" },
  ];

  onMount(() => {
    Prism.highlightAll();
  });

  return (
    <PageLayout
      previousLink={previousLink}
      nextLink={nextLink}
      contextualNavLinks={contextualNavLinks}
    >
      <PageTitle>Kbd</PageTitle>
      <Text mb="$5">
        The keyboard key component exists to show which key or combination of keys performs a given
        action. The action itself should be further explained in accompanying content. It renders a{" "}
        <Code>kbd</Code> element.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <Preview snippet={snippets.basicUsage} mb="$12">
        <span>
          <Kbd>shift</Kbd> + <Kbd>H</Kbd>
        </span>
      </Preview>
      <SectionTitle id="guideline">Guideline</SectionTitle>
      <Text mb="$3">
        All shortcuts should do their best to match what appears on the user’s keyboard.
      </Text>
      <UnorderedList spacing="$2" mb="$12">
        <ListItem>All single letters A-Z are uppercase.</ListItem>
        <ListItem>For non-letter keys such as enter, esc and shift, stick to lowercase.</ListItem>
        <ListItem>Use the arrow symbol as opposed to spelling things out.</ListItem>
      </UnorderedList>
      <SectionTitle id="modifier">Modifier</SectionTitle>
      <Text mb="$5">
        The only punctuation you should need is the <strong>+</strong> to indicate that a
        combination of keys will activate the shortcut.
      </Text>
      <Preview snippet={snippets.modifierPlus} mb="$10">
        <span>
          <Kbd>shift</Kbd> + <Kbd>H</Kbd>
        </span>
      </Preview>
      <Text mb="$5">
        For a sequence of keys where one must follow the other, write <em>"then"</em> in between.
        Stick to lowercase to match the non-letter keys.
      </Text>
      <Preview snippet={snippets.modifierThen} mb="$10">
        <span>
          <Kbd>shift</Kbd> then <Kbd>H</Kbd>
        </span>
      </Preview>
      <Text mb="$5">
        If two different keys can execute the same action or the shortcut itself may look different
        on the user’s keyboard, write <em>"or"</em> in between.
      </Text>
      <Preview snippet={snippets.modifierOr}>
        <span>
          <Kbd>alt</Kbd> or <Kbd>option</Kbd>
        </span>
      </Preview>
    </PageLayout>
  );
}
