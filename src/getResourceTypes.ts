import type { Protocol } from "devtools-protocol";
import { File } from "./zip";

export function getResourceTypes(files: File[]): string[] {
  const resourceTypes = new Set(files.map((c) => c.data.request.resourceType));
  return Array.from(resourceTypes);
}

export function emojifyResourceType(
  resourceType: Protocol.Network.ResourceType
): string {
  switch (resourceType) {
    case "Document":
      return "📄";
    case "Stylesheet":
      return "🌺";
    case "Image":
      return "🖼️";
    case "Media":
      return "🎥";
    case "Font":
      return "🔤";
    case "Script":
      return "📜";
    case "TextTrack":
      return "📝";
    case "XHR":
      return "⚡";
    case "Fetch":
      return "🔦";
    case "EventSource":
      return "🎫";
    case "WebSocket":
      return "🔌";
    case "Manifest":
      return "✉️";
    case "SignedExchange":
      return "🔏";
    case "Ping":
      return "🏓";
    case "CSPViolationReport":
      return "🚨";
    case "Preflight":
      return "🛫";
    case "Other":
      return "👽";
    default:
      return resourceType;
  }
}
