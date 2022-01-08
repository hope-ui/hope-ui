import { Component, JSX } from "solid-js";

export type ElementType = keyof JSX.IntrinsicElements | Component<any>;
