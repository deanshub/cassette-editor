import JSZip, { JSZipObject } from "jszip";
import { Cassette } from "./Cassette";
import { prettifyFileName } from "./prettifyFileName";
import { saveAs } from "file-saver";

interface Zip {
  name: string;
  files: File[];
}
export interface File {
  prettyName: string;
  data: Cassette;
  name: string;
}

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
  const entriesNames: Promise<File>[] = [];
  zip.forEach((_: string, zipEntry: JSZipObject) => {
    if (!zipEntry.dir) {
      entriesNames.push(
        (async () => {
          const data = await zipEntry.async("string");
          const cassette: Cassette = JSON.parse(data);
          const prettyName = prettifyFileName(cassette);
          return {
            name: zipEntry.name,
            data: {
              ...cassette,
              response: {
                ...cassette.response,
                body: atob(cassette.response.body),
              },
            },
            prettyName,
          };
        })()
      );
    }
  });

  const files = await Promise.all(entriesNames);
  return {
    name: zip.name,
    files,
  };
}

export async function bufferZipFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`File "${url}" not found`);
  }
  return Buffer.from(await response.arrayBuffer()).toString("base64");
}

export async function zipFiles(zip: Zip) {
  const zipFile = new JSZip();
  for (const file of zip.files) {
    zipFile.file(
      file.name,
      JSON.stringify({
        ...file.data,
        response: {
          ...file.data.response,
          body: btoa(unescape(file.data.response.body)),
        },
      })
    );
  }
  const blob = await zipFile.generateAsync({ type: "blob" });
  saveAs(blob, zip.name);
}
