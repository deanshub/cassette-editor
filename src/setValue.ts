import { set } from "object-path-immutable";

export function setValue<T>(obj: T, path: string, value: any): T {
  const updated = set(obj, path, value);
  return updated;
}
