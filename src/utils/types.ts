/**
 * Allows for extending a set of props (`SourceProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type RightJoinProps<SourceProps = {}, OverrideProps = {}> = Omit<
  SourceProps,
  keyof OverrideProps
> &
  OverrideProps;
