import "./styles/base.scss";
import "./styles/button.scss";
import "./styles/container.scss";
import "./styles/icon-button.scss";
import "./styles/paper.scss";
import "./styles/tag.scss";
import "./styles/tag-close-button.scss";

import { render } from "solid-js/web";

import { Tag, TagCloseButton } from "@/components";
import { HopeProvider } from "@/contexts";

function App() {
  return (
    <HopeProvider>
      <Tag rightSection={<TagCloseButton aria-label="Close" />}>Close</Tag>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
