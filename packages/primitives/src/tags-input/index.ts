// The `tags-input/` barrel: the `createTagsInput` hook family, exported as the single subpath
// `@hope-ui/primitives/tags-input`. Type-first — no namespace object (that's the component layer).
export {
  type CreateTagsInputItemProps,
  type CreateTagsInputItemReturn,
  createTagsInputItem,
  resolveTagsInputItem,
  type TagsInputItemHandle,
} from "./tags-input-item";
export {
  type CreateTagsInputItemDeleteProps,
  type CreateTagsInputItemDeleteReturn,
  createTagsInputItemDelete,
} from "./tags-input-item-delete";
export {
  type CreateTagsInputItemTextProps,
  type CreateTagsInputItemTextReturn,
  createTagsInputItemText,
} from "./tags-input-item-text";
export {
  type CreateTagsInputListReturn,
  createTagsInputList,
} from "./tags-input-list";
export {
  type CreateTagsInputBaseOptions,
  type CreateTagsInputOptions,
  type CreateTagsInputReturn,
  createTagsInput,
  type TagsInputAddResult,
  type TagsInputParseOption,
  type TagsInputRejection,
  type TagsInputRejectReason,
} from "./tags-input-root";
