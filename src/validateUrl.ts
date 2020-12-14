export function validateUrl(urlString: string): void {
  const url = new URL(urlString);
  if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
    throw new Error(`Can't access localhost.`);
  }
}
