import { ThemeStyleObject } from "@/theme/types";

export type UtilityVariant<T extends string | number | symbol> = Record<T, ThemeStyleObject>;
