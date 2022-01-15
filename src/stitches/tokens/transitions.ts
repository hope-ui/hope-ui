import { AddStitchesTokenPrefix } from "../stitches.config";

export const transitions = {};

export type TransitionTokens = AddStitchesTokenPrefix<keyof typeof transitions>;
