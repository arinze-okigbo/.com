import type { ParsedClientData } from "./types";

/**
 * `clientDataJSON` — the browser's own account of the ceremony.
 *
 * The browser builds it, not the authenticator, and the authenticator signs a
 * SHA-256 hash of these exact bytes. A server must hash the bytes it received
 * rather than re-serialising the parsed JSON: key order and whitespace are not
 * guaranteed to round-trip.
 */

/** Raised when `clientDataJSON` is not the object the spec requires. */
export class ClientDataError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ClientDataError";
  }
}

const TEXT_DECODER = new TextDecoder("utf-8", { fatal: false });

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  if (typeof value !== "string") {
    throw new ClientDataError(`clientDataJSON has no string "${key}"`);
  }
  return value;
}

/**
 * Decodes and validates `clientDataJSON`.
 *
 * @throws {ClientDataError} on invalid UTF-8 JSON, a non-object, or a missing
 * `type` / `challenge` / `origin`.
 */
export function parseClientData(clientDataJSON: Uint8Array): ParsedClientData {
  const text = TEXT_DECODER.decode(clientDataJSON);

  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch (cause) {
    throw new ClientDataError("clientDataJSON is not valid JSON", { cause });
  }

  if (typeof decoded !== "object" || decoded === null || Array.isArray(decoded)) {
    throw new ClientDataError("clientDataJSON is not a JSON object");
  }

  const source = decoded as Record<string, unknown>;
  const crossOrigin = source.crossOrigin;

  return {
    text,
    type: readString(source, "type"),
    challenge: readString(source, "challenge"),
    origin: readString(source, "origin"),
    crossOrigin: typeof crossOrigin === "boolean" ? crossOrigin : null,
  };
}
