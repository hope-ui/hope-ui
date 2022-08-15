import { css } from "@stitches/core";
import { Component, createSignal, onCleanup, Show } from "solid-js";

import { toType } from "./helpers/util";
import Clippy from "./icons/clippy";
import { copyIcon, copyToClipboard } from "./themes";

interface ClipboardProps {
  rowHovered: boolean;
  hidden: boolean;
  src: any;
  clickCallback: (e?: any) => any;
  namespace: Array<string | number>;
}

const CopyToClipboard: Component<ClipboardProps> = props => {
  const [copied, setCopied] = createSignal(false);

  let copiedTimer: NodeJS.Timeout;

  onCleanup(() => {
    if (copiedTimer) {
      clearTimeout(copiedTimer);
    }
  });

  const clipboardValue = (value: any) => {
    const type = toType(value);
    switch (type) {
      case "function":
      case "regexp":
        return value.toString();
      default:
        return value;
    }
  };

  const handleCopy = () => {
    const { clickCallback, src, namespace } = props;

    const copiedValue = JSON.stringify(clipboardValue(src), null, "  ");
    navigator.clipboard.writeText(copiedValue);
    copiedTimer = setTimeout(() => {
      setCopied(false);
    }, 5000);

    setCopied(() => {
      if (typeof clickCallback !== "function") {
        return true;
      }
      clickCallback({
        src: src,
        namespace: namespace,
        name: namespace[namespace.length - 1],
      });
      return true;
    });
  };

  const getClippyIcon = () => {
    return (
      <Show when={copied()} fallback={<Clippy class={`copy-icon ${copyIcon()}`} />}>
        <span>
          <Clippy class={`copy-icon ${copyIcon()}`} />
          <span class={copyIcon({ state: "copied" })}>✔</span>
        </span>
      </Show>
    );
  };

  return (
    <span
      class={`copy-to-clipboard-container ${css({
        verticalAlign: "middle",
        display: props.rowHovered ? "inline-block" : "none",
      })()}`}
      title="Copy to clipboard"
    >
      <Show when={!props.hidden}>
        <span
          class={copyToClipboard()}
          onClick={handleCopy}
          onKeyPress={e => {
            if (e.key === "space") handleCopy;
          }}
          role="button"
          tabindex="0"
        >
          {getClippyIcon()}
        </span>
      </Show>
    </span>
  );
};

export default CopyToClipboard;
