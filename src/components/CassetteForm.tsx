import { Cassette } from "../Cassette";
import { format } from "prettier";
import babelParser from "prettier/parser-babel";
import htmlParser from "prettier/parser-html";

interface Props {
  cassette: Cassette;
  onChange(key: string, value: any): void;
}

function prettifyBody(cassette: Cassette): string {
  const content = cassette.response.body;
  try {
    if (cassette.request.resourceType === "Script") {
      return format(content, { parser: "babel", plugins: [babelParser] });
    } else if (cassette.request.resourceType === "Document") {
      return format(content, { parser: "html", plugins: [htmlParser] });
    } else if (cassette.request.url.endsWith(".json")) {
      return JSON.stringify(JSON.parse(content), null, 2);
    }
  } catch (e) {
    console.warn(e);
  }

  return content;
}

function Headers(props: {
  headers: Record<string, string>;
  type: "Response" | "Request";
  onChange: Props["onChange"];
}) {
  const entries = Object.entries(props.headers ?? {});
  if (entries.length) {
    return (
      <section className="bg-grey">
        <h2>{props.type} Headers:</h2>
        {entries.map(([key, value]) => (
          <h3 key={key}>
            {key}:{" "}
            <input
              value={value}
              onChange={(e) => {
                props.onChange(key, e.target.value);
              }}
            />
          </h3>
        ))}
      </section>
    );
  }
  return null;
}

export function CassetteForm({ cassette, onChange }: Props) {
  return (
    <div className="break-all">
      <Headers
        headers={cassette.request.headers}
        type="Request"
        onChange={(key, value) => {
          onChange(`request.headers.${key}`, value);
        }}
      />
      <label>
        Status Code:{" "}
        <input
          value={cassette.response.status}
          onChange={(e) => {
            onChange("response.status", e.target.value);
          }}
        />
      </label>
      <Headers
        headers={cassette.response.headers}
        type="Response"
        onChange={(key, value) => {
          onChange(`response.headers.${key}`, value);
        }}
      />
      <textarea
        className="w-full"
        style={{
          height: "-webkit-fill-available",
        }}
        onChange={(e) => {
          onChange(`response.body`, e.target.value);
        }}
        value={prettifyBody(cassette)}
      />
    </div>
  );
}
