import type { HopeNumberSize } from "./HopeSize";

type HopeStyleSystemValue = HopeNumberSize | (string & {});

export interface HopeStyleSystemProps {
  m?: HopeStyleSystemValue;
  my?: HopeStyleSystemValue;
  mx?: HopeStyleSystemValue;
  mt?: HopeStyleSystemValue;
  mb?: HopeStyleSystemValue;
  ml?: HopeStyleSystemValue;
  mr?: HopeStyleSystemValue;

  p?: HopeStyleSystemValue;
  py?: HopeStyleSystemValue;
  px?: HopeStyleSystemValue;
  pt?: HopeStyleSystemValue;
  pb?: HopeStyleSystemValue;
  pl?: HopeStyleSystemValue;
  pr?: HopeStyleSystemValue;
}

export type HopeStyleSystemSize = keyof HopeStyleSystemProps;
