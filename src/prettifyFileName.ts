import { Cassette } from "./Cassette";
type Method = "GET" | "POST" | "PUT" | "DELETE" | "HEAD";

export function prettifyFileName(cassette: Cassette): string {
  const index = cassette.index;
  return `${emojifyMethod(cassette.request.method as Method)} ${
    cassette.request.url
  } ${index === 1 || !index ? "" : index + 1}`;
}

function emojifyMethod(method: Method): string {
  switch (method) {
    case "GET":
      return "🌐";
    case "POST":
      return "🆕";
    case "PUT":
      return "🅿️";
    case "DELETE":
      return "➖";
    case "HEAD":
      return "🚼";
    default:
      return method;
  }
}
