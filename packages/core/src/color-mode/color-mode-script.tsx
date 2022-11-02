/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/132a98958be64e46619b1e280ca6405d0a833cb0/packages/components/color-mode/src/color-mode-script.tsx
 */

import { createMemo } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { ColorModeScriptProps } from "./types";

const VALID_VALUES = new Set(["dark", "light", "system"]);

/**
 * runtime safe-guard against invalid color mode values
 */
function normalize(initialColorMode: "light" | "dark" | "system") {
  let value = initialColorMode;
  if (!VALID_VALUES.has(value)) value = "light";
  return value;
}

export function ColorModeScript(props: ColorModeScriptProps) {
  props = mergeDefaultProps(
    {
      initialColorMode: "light",
      storageType: "localStorage",
      storageKey: "hope-ui-color-mode",
    },
    props
  );

  const scriptSrc = createMemo(() => {
    // runtime safe-guard against invalid color mode values
    const init = normalize(props.initialColorMode!);

    const isCookie = props.storageType === "cookie";

    const cookieScript = `(function(){try{var a=function(o){var l="(prefers-color-scheme: dark)",v=window.matchMedia(l).matches?"dark":"light",e=o==="system"?v:o,d=document.documentElement,m=document.body,i="hope-theme-light",n="hope-theme-dark",s=e==="dark";return m.classList.add(s?n:i),m.classList.remove(s?i:n),d.style.colorScheme=e,d.dataset.hopeTheme=e,e},u=a,h="${init}",r="${props.storageKey}",t=document.cookie.match(new RegExp("(^| )".concat(r,"=([^;]+)"))),c=t?t[2]:null;c?a(c):document.cookie="".concat(r,"=").concat(a(h),"; max-age=31536000; path=/")}catch(a){}})();
  `;

    const localStorageScript = `(function(){try{var a=function(c){var v="(prefers-color-scheme: dark)",h=window.matchMedia(v).matches?"dark":"light",r=c==="system"?h:c,o=document.documentElement,s=document.body,l="hope-theme-light",d="hope-theme-dark",i=r==="dark";return s.classList.add(i?d:l),s.classList.remove(i?l:d),o.style.colorScheme=r,o.dataset.hopeTheme=r,r},n=a,m="${init}",e="${props.storageKey}",t=localStorage.getItem(e);t?a(t):localStorage.setItem(e,a(m))}catch(a){}})();
  `;

    const fn = isCookie ? cookieScript : localStorageScript;

    return `!${fn}`.trim();
  });

  // eslint-disable-next-line solid/no-innerhtml
  return <script id="hope-ui-color-mode-script" nonce={props.nonce} innerHTML={scriptSrc()} />;
}
