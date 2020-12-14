import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRef, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { unzipBlob, File } from "../src/zip";
import { validateUrl } from "../src/validateUrl";
// import PencilIcon from "heroicons/react/solid/Pencil";
// import PencilIconOutline from "heroicons/react/outline/Pencil";
import { CassetteForm } from "../src/components/CassetteForm";

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
    } catch (err) {
      setPageState({
        state: "errorReading",
        archiveUrl: e.target.files?.[0]?.name ?? "unknown",
        message: err.message,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Cassette Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen min-w-screen bg-blue-400 md:font-mono">
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
              <h3 className="text-xl font-thin">
                Files in{" "}
                <code className="inline-block p-1 text-sm leading-normal align-middle bg-blue-100 rounded">
                  {pageState.archiveUrl}
                </code>
              </h3>
              <div className="flex">
                <ul className="pt-4 w-1/3">
                  {pageState.files.map((file) => {
                    return (
                      <li key={file.name}>
                        <a
                          onClick={() => setSelectedFile(file)}
                          className="flex items-center p-2 group"
                        >
                          <code className="flex-1 pl-1 break-all">
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
                      onChange={(key, value) =>
                        console.log(selectedFile.name, key, value)
                      }
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
  const { archiveUrl } = ctx.query;

  if (archiveUrl) {
    if (typeof archiveUrl !== "string") {
      throw new Error("archive must be a string");
    }

    validateUrl(archiveUrl);
    try {
      // const zipfile = await bufferZipFile(archive);
      ctx.res.setHeader(
        "Cache-Control",
        "s-maxage=3600, stale-while-revalidate"
      );

      return {
        props: {
          state: "listFiles",
          archiveUrl,
        },
      };
    } catch (e) {
      return {
        props: {
          state: "errorReading",
          archiveUrl,
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
