import type { PropertyValue } from "@stitches/core";

export const background = {
  bg: (value: PropertyValue<"background">) => ({ background: value }),
  bgColor: (value: PropertyValue<"backgroundColor">) => ({ backgroundColor: value }),
  bgGradient: (value: PropertyValue<"backgroundImage">) => ({ backgroundImage: value }),
  bgClip: (value: PropertyValue<"backgroundClip">) => ({ backgroundClip: value }),
  bgImage: (value: PropertyValue<"backgroundImage">) => ({ backgroundImage: value }),
  bgSize: (value: PropertyValue<"backgroundSize">) => ({ backgroundSize: value }),
  bgPosition: (value: PropertyValue<"backgroundPosition">) => ({ backgroundPosition: value }),
  bgRepeat: (value: PropertyValue<"backgroundRepeat">) => ({ backgroundRepeat: value }),
  bgAttachment: (value: PropertyValue<"backgroundAttachment">) => ({ backgroundAttachment: value }),
};
