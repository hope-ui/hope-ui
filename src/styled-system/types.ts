import { SystemStyleObject } from "@/theme/types";

export type UtilityVariant<T extends string | number | symbol> = Record<T, SystemStyleObject>;
