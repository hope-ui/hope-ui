import { Anchor, AspectRatio, hope, Image, Text } from "@hope-ui/design-system";
import Prism from "prismjs";
import { onMount } from "solid-js";

import Code from "@/components/Code";
import CodeSnippet from "@/components/CodeSnippet";
import { ContextualNavLink } from "@/components/ContextualNav";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import { Preview } from "@/components/Preview";
import { PropsTable, PropsTableItem } from "@/components/PropsTable";
import SectionSubtitle from "@/components/SectionSubtitle";
import SectionTitle from "@/components/SectionTitle";

import { snippets } from "./snippets";

export default function AspectRatioDoc() {
  const previousLink: ContextualNavLink = {
    href: "/docs/general/icon-button",
    label: "IconButton",
  };

  const nextLink: ContextualNavLink = {
    href: "/docs/layout/box",
    label: "Box",
  };

  const contextualNavLinks: ContextualNavLink[] = [
    { href: "#import", label: "Import" },
    { href: "#usage", label: "Usage" },
    { href: "#embed-video", label: "Embed video", indent: true },
    { href: "#embed-image", label: "Embed image", indent: true },
    { href: "#embed-map", label: "Embed a map", indent: true },
    { href: "#props", label: "Props" },
  ];

  const propItems: PropsTableItem[] = [
    {
      name: "ratio",
      description: "The aspect ratio of the Box (ex: 16/9, 4/3, etc).",
      type: "ResponsiveValue<number>",
      defaultValue: "4/3",
    },
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
      <PageTitle>AspectRatio</PageTitle>
      <Text mb="$5">
        AspectRatio component is used to embed responsive videos and maps, etc. It uses a very
        common{" "}
        <Anchor
          href="https://css-tricks.com/aspect-ratio-boxes/"
          external
          color="$primary11"
          fontWeight="$semibold"
        >
          padding hack
        </Anchor>{" "}
        to achieve this.
      </Text>
      <SectionTitle id="import">Import</SectionTitle>
      <CodeSnippet snippet={snippets.importComponent} mb="$12" />
      <SectionTitle id="usage">Usage</SectionTitle>
      <SectionSubtitle id="embed-video">Embed video</SectionSubtitle>
      <Text mb="$5">
        To embed a video with a specific aspect ratio, use an iframe with <Code>src</Code> pointing
        to the link of the video.
      </Text>
      <Text mb="$5">
        Pass the <Code>maxWidth</Code> prop to <Code>AspectRatio</Code> to control the width of the
        content.
      </Text>
      <Preview snippet={snippets.embedVideo} mb="$10">
        <AspectRatio maxW="560px" ratio={1}>
          <iframe
            title="one piece opening 1"
            src="https://www.youtube.com/embed/HRaoYuRKBaA"
            allowfullscreen
          />
        </AspectRatio>
      </Preview>
      <SectionSubtitle id="embed-image">Embed image</SectionSubtitle>
      <Text mb="$5">Here's how to embed an image that has a 4 by 3 aspect ratio.</Text>
      <Preview snippet={snippets.embedImage} mb="$10">
        <AspectRatio maxW="400px" ratio={4 / 3}>
          <Image src="https://bit.ly/3pq0AcS" alt="Monkey D. Luffy" objectFit="cover" />
        </AspectRatio>
      </Preview>
      <SectionSubtitle id="embed-map">Embed a map</SectionSubtitle>
      <Text mb="$5">
        Here's how to embed a responsive Google map using <Code>AspectRatio</Code>. To make the map
        take up the entire width, we can ignore the <Code>maxWidth</Code> prop.
      </Text>
      <Preview snippet={snippets.embedMap} mb="$12">
        <AspectRatio ratio={16 / 9}>
          <iframe
            title="reunion island"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10240.720471033459!2d55.27333136315537!3d-21.009371764170627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x218288b199fec3e9%3A0xcd75253c6f21188d!2sSt%20Paul%2097460%2C%20La%20R%C3%A9union!5e0!3m2!1sfr!2sfr!4v1646123686380!5m2!1sfr!2sfr"
          />
        </AspectRatio>
      </Preview>
      <SectionTitle id="props">Props</SectionTitle>
      <PropsTable items={propItems} />
    </PageLayout>
  );
}
