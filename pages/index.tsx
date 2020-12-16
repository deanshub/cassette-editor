import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRef, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { unzipBlob, File, zipFiles } from "../src/zip";
import { validateUrl } from "../src/validateUrl";
import type { Protocol } from "devtools-protocol";
// import PencilIcon from "heroicons/react/solid/Pencil";
// import PencilIconOutline from "heroicons/react/outline/Pencil";
import { CassetteForm } from "../src/components/CassetteForm";
import { getResourceTypes, emojifyResourceType } from "../src/getResourceTypes";
import { setValue } from "../src/setValue";

type Props =
  | {
      state: "errorReading";
      message: string;
      archiveUrl: string;
    }
  | {
      state: "listFiles";
      archiveUrl: string;
    }
  | {
      state: "home";
    };

type PageState =
  | {
      state: "errorReading";
      message: string;
      archiveUrl: string;
    }
  | {
      state: "listFiles";
      archiveUrl: string;
      files?: File[];
      origin: "Server" | "Client";
    }
  | {
      state: "home";
    };

function defualtFiles(props: Props): PageState {
  if (props.state === "listFiles") {
    return {
      ...props,
      files: undefined,
      origin: "Server",
    };
  }
  return props;
}

export default function Home(props: Props) {
  const textInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>(defualtFiles(props));
  const [selectedFile, setSelectedFile] = useState<File>();
  const [resourceTypes, setResourceTypes] = useState<
    Record<Protocol.Network.ResourceType, { value: boolean; count: number }>
  >({} as any);

  useEffect(() => {
    if (props.state === "listFiles") {
      fetch(props.archiveUrl)
        .then((res) => res.blob())
        .then(unzipBlob)
        .then((zip) => {
          setPageState({
            origin: "Server",
            state: "listFiles",
            archiveUrl: props.archiveUrl,
            files: zip.files,
          });
          setResourceTypes(getResourceTypes(zip.files));
        })
        .catch((err) => {
          setPageState({
            state: "errorReading",
            archiveUrl: props.archiveUrl,
            message: err.message,
          });
        });
    }
  }, [props]);

  const userSelectedFile = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files?.[0]) {
        throw new Error("File not selected");
      }
      const blob = e.target.files[0];
      const zip = await unzipBlob(blob);

      setPageState({
        origin: "Client",
        state: "listFiles",
        archiveUrl: blob.name,
        files: zip.files,
      });
      setResourceTypes(getResourceTypes(zip.files));
    } catch (err) {
      setPageState({
        state: "errorReading",
        archiveUrl: e.target.files?.[0]?.name ?? "unknown",
        message: err.message,
      });
    }
  };

  const download = () => {
    if (pageState.state === "listFiles") {
      zipFiles({ name: pageState.archiveUrl, files: pageState.files });
    }
  };

  return (
    <>
      <Head>
        <title>Cassette Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen min-w-screen bg-blue-200 md:font-mono">
        <form
          className="p-4 grid grid-cols-9 gap-4"
          action="/"
          onSubmit={(e) => {
            e.preventDefault();
            if (!textInputRef.current) return;
            const archive = encodeURIComponent(
              textInputRef.current.value.trim()
            );
            router.push(`/?archive=${archive}`);
          }}
        >
          <h1 className="pb-4 font-bold tracking-wider uppercase col-span-9">
            Cassette Editor
          </h1>
          <input
            className="min-w-full p-4 rounded col-span-8"
            name="webArchive"
            ref={textInputRef}
            type="url"
            defaultValue={
              pageState.state === "listFiles" ? pageState.archiveUrl : ""
            }
            placeholder="https://example.com/file.zip"
          />
          <label
            htmlFor="clientArchive"
            className="flex justify-center items-center col-span-1"
          >
            Browse...
          </label>
          <input
            className="hidden"
            type="file"
            id="clientArchive"
            name="clientArchive"
            onChange={userSelectedFile}
          />
        </form>

        <div className="p-4">
          {pageState.state === "errorReading" && (
            <div className="bg-red-300 p-4 rounded">
              <h3 className="text-xl font-thin">An error occured</h3>
              <p>{pageState.message}</p>
            </div>
          )}
          {pageState.state === "listFiles" && (
            <>
              <h3 className="text-l font-thin flex">
                <code className="pl-4 text-xl w-5/6">
                  {pageState.archiveUrl}
                </code>
                <button
                  className="pl-4 bg-green-100 text-center shadow rounded w-1/6"
                  onClick={download}
                >
                  Download
                </button>
              </h3>
              <div className="mt-4 mb-4 flex flex-wrap">
                {Object.entries(resourceTypes).map(
                  ([resourceType, { count, value }]: [
                    Protocol.Network.ResourceType,
                    { value: boolean; count: number }
                  ]) => (
                    <label
                      key={resourceType}
                      className="m-2 p-2 bg-white rounded-xl shadow-md"
                    >
                      <input
                        type="checkbox"
                        className="form-tick w-6 border border-gray-300 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none"
                        checked={value}
                        onChange={() =>
                          setResourceTypes({
                            ...resourceTypes,
                            [resourceType]: {
                              ...resourceTypes[resourceType],
                              value: !resourceTypes[resourceType].value,
                            },
                          })
                        }
                      />
                      {`${resourceType}(${count}) ${emojifyResourceType(
                        resourceType
                      )}`}
                    </label>
                  )
                )}
              </div>
              <div className="flex">
                <ul className="pt-4 w-1/3">
                  {(pageState.files ?? [])
                    .filter(
                      (file) =>
                        resourceTypes[file.data.request.resourceType]?.value ??
                        true
                    )
                    .map((file) => {
                      return (
                        <li
                          key={file.name}
                          className={
                            file === selectedFile
                              ? "shadow bg-blue-300 rounded"
                              : undefined
                          }
                        >
                          <a
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFile(file);
                            }}
                            className="flex items-center p-2 group"
                            href=""
                          >
                            <code className="flex-1 pl-1 break-all text-sm">
                              {file.prettyName}
                            </code>
                          </a>
                        </li>
                      );
                    })}
                </ul>
                {selectedFile && (
                  <section className="bg-white shadow-inner rounded p-4 w-2/3">
                    <CassetteForm
                      cassette={selectedFile.data}
                      onChange={(key, value) => {
                        const index = pageState.files.findIndex(
                          (f) => f === selectedFile
                        );
                        const files = setValue(
                          pageState.files,
                          `${index}.data.${key}`,
                          value
                        );
                        const newFile = files[index];
                        setPageState({
                          ...pageState,
                          files,
                        });
                        setSelectedFile(newFile);
                      }}
                    />
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <footer></footer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { archive } = ctx.query;

  if (archive) {
    if (typeof archive !== "string") {
      throw new Error("archive must be a string");
    }

    validateUrl(archive);
    try {
      // const zipfile = await bufferZipFile(archive);
      ctx.res.setHeader(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate"
      );

      return {
        props: {
          state: "listFiles",
          archiveUrl: archive,
        },
      };
    } catch (e) {
      return {
        props: {
          state: "errorReading",
          archiveUrl: archive,
          message: e.message,
        },
      };
    }
  }

  return {
    props: {
      state: "home",
    },
  };
};
