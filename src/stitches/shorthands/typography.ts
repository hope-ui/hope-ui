import { TypographyProps } from "../props/typographyProps";

export const typography: Pick<Record<keyof TypographyProps, any>, "lineClamp"> = {
  lineClamp: (value: number) => ({
    overflow: "hidden",
    display: "-webkit-box",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": value,
  }),
};
