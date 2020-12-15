import { File } from "./zip";

export function getResourceTypes(files: File[]): string[] {
  const resourceTypes = new Set(files.map((c) => c.data.request.resourceType));
  return Array.from(resourceTypes);
}
