export function getInitials(name: string) {
  return (
    name
      .match(/\b(\w)/g)
      ?.slice(0, 2)
      .join("") ?? ""
  );
}
