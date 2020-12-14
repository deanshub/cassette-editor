import JSZip, { JSZipObject } from "jszip";

interface Zip {
  name: string;
  files: JSZipObject[];
}
export type File = { type: string; fileName: string };

async function b64toBlob(
  b64Data: string,
  contentType: string = "application/octet-stream"
): Promise<Blob> {
  const res = await fetch(`data:${contentType};base64,${b64Data}`);
  return await res.blob();
}

export async function unzip(file: string): Promise<Zip> {
  const blob = await b64toBlob(file);
  return unzipBlob(blob);
}

export async function unzipBlob(file: Blob): Promise<Zip> {
  const zip = await JSZip.loadAsync(file);
  const entriesNames: JSZipObject[] = [];
  zip.forEach((relativePath, zipEntry) => {
    entriesNames.push(zipEntry);
  });
  return {
    name: zip.name,
    files: entriesNames,
  };
}

export async function bufferZipFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`File "${url}" not found`);
  }
  return Buffer.from(await response.arrayBuffer()).toString("base64");
}
