const importComponent = `import { AspectRatio } from "@hope-ui/solid"`;

const embedVideo = `// This video will have equal sides
<AspectRatio maxW="560px" ratio={1}>
  <iframe
    title="one piece opening 1"
    src="https://www.youtube.com/embed/HRaoYuRKBaA"
    allowfullscreen
  />
</AspectRatio>`;

const embedImage = `<AspectRatio maxW="400px" ratio={4 / 3}>
  <Image src="https://bit.ly/3pq0AcS" alt="Monkey D. Luffy" objectFit="cover" />
</AspectRatio>`;

const embedMap = `<AspectRatio ratio={16 / 9}>
  <iframe
    title="reunion island"
    src="https://www.google.com/maps/embed?
pb=!1m18!1m12!1m3!1d10240.720471033459!2d55.27333136315537!3d-21.009371764170627!2m3!1
f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x218288b199fec3e9%3A0xcd75253c6f21188d!2
sSt%20Paul%2097460%2C%20La%20R%C3%A9union!5e0!3m2!1sfr!2sfr!4v1646123686380!5m2!1sfr!2sfr"
  />
</AspectRatio>`;

export const snippets = {
  importComponent,
  embedVideo,
  embedImage,
  embedMap,
};
