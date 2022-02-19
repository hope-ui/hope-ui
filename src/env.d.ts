import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      bodyScrollLock: any;
      focusTrap: any;
    }
  }
}
