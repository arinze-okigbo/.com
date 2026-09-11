/**
 * The API response envelope, per the repository's API-response convention:
 * a success indicator, a nullable data payload, and a nullable error message.
 *
 * Every route handler under `src/app/api/**` returns exactly this shape, on
 * every path, including failures. `error` is always a message written for a
 * human visitor — never an internal identifier, never a validation detail,
 * never a stack trace.
 */

export interface ApiEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData | null;
  readonly error: string | null;
}

export function successEnvelope<TData>(data: TData): ApiEnvelope<TData> {
  return { success: true, data, error: null };
}

export function errorEnvelope(message: string): ApiEnvelope<never> {
  return { success: false, data: null, error: message };
}

/** Headers applied to every API response, before per-response overrides. */
const BASE_HEADERS: Readonly<Record<string, string>> = {
  "content-type": "application/json; charset=utf-8",
  // API responses are per-request and must never be cached by a proxy or the browser.
  "cache-control": "no-store, max-age=0",
  // Defence in depth: a JSON body must never be sniffed into an executable type.
  "x-content-type-options": "nosniff",
  // This endpoint is not a page; never let it be framed.
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export interface JsonResponseOptions {
  readonly status: number;
  readonly headers?: Readonly<Record<string, string>>;
}

export function jsonResponse<TData>(
  envelope: ApiEnvelope<TData>,
  options: JsonResponseOptions,
): Response {
  const headers = new Headers(BASE_HEADERS);

  for (const [key, value] of Object.entries(options.headers ?? {})) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(envelope), { status: options.status, headers });
}
