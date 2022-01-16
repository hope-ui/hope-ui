import { Property } from "csstype";

import { ColorTokens } from "../tokens/colors";

export type BackgroundProps = Partial<{
  bg: Property.Background<ColorTokens>;
  background: Property.Background<ColorTokens>;
  bgColor: Property.BackgroundColor | ColorTokens;
  backgroundColor: Property.BackgroundColor | ColorTokens;
  bgGradient: Property.BackgroundImage;
  bgClip: Property.BackgroundClip;
  backgroundClip: Property.BackgroundClip;
  bgImage: Property.BackgroundImage;
  backgroundImage: Property.BackgroundImage;
  bgSize: Property.BackgroundSize;
  backgroundSize: Property.BackgroundSize;
  bgPosition: Property.BackgroundPosition;
  backgroundPosition: Property.BackgroundPosition;
  bgRepeat: Property.BackgroundRepeat;
  backgroundRepeat: Property.BackgroundRepeat;
  bgAttachment: Property.BackgroundAttachment;
  backgroundAttachment: Property.BackgroundAttachment;
}>;
