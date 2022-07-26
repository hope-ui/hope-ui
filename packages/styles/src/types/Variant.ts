import { HopeColor } from "./HopeColor";

export interface VariantInput {
  variant: "solid" | "soft" | "outlined" | "plain"; //  'filled' | 'light' | 'outline' | 'default' | 'gradient' | 'white' | 'subtle'
  color?: HopeColor;
  primaryFallback?: boolean;
}

export interface VariantOutput {
  border: string;
  background: string;
  color: string;
  hover: string;
}
