import type { Protocol } from "devtools-protocol";

export interface SerializedRequest {
  url: string;
  method: string;
  resourceType: Protocol.Network.ResourceType;
  headers: { [key: string]: string };
}

export interface SerializedResponse {
  headers: { [key: string]: string };
  status: number;
  body: string;
  postData: string | undefined;
  transferSize: number;
}

export interface Cassette {
  index: number;
  /** originalRequest */
  request: SerializedRequest;
  rewrittenRequest: SerializedRequest;
  response: SerializedResponse;
}
