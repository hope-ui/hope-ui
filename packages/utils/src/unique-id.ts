let lastId = 0;

/** Create a unique id to use outside of SolidJS context. */
export function uniqueId() {
  const prefix = "uid-";
  lastId++;
  return `${prefix}${lastId}`;
}
