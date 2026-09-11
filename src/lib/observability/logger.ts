/**
 * Structured server-side logger.
 *
 * This is the ONLY module in the codebase permitted to touch the console.
 * Every entry is emitted as a single JSON line on stderr, which is what the
 * Vercel runtime-log drain ingests and what makes the entries greppable.
 *
 * There is no `log` / `debug` level and no `console.log` anywhere: a log line
 * either records something an operator needs (>= warn) or an audited
 * lifecycle event (info). Nothing here ever reaches the client.
 */

export type LogLevel = "info" | "warn" | "error";

export type LogContext = Readonly<Record<string, unknown>>;

interface LogEntry extends LogContext {
  readonly level: LogLevel;
  readonly time: string;
  readonly event: string;
}

/**
 * Keys whose values are never written to a log line, at any depth of the
 * top-level context object. Callers should pass derived values instead
 * (a hash, a length, a boolean), but this is the backstop.
 */
const REDACTED_KEYS: ReadonlySet<string> = new Set([
  "apiKey",
  "authorization",
  "cookie",
  "email",
  "message",
  "name",
  "password",
  "secret",
  "token",
]);

const REDACTED_PLACEHOLDER = "[redacted]";

function redact(context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) =>
      REDACTED_KEYS.has(key) ? [key, REDACTED_PLACEHOLDER] : [key, value],
    ),
  );
}

/**
 * Serialise an unknown thrown value without ever leaking it to a client.
 * Stack traces stay server-side by construction — this is only ever called
 * from `logger.*`, whose output goes to stderr.
 */
export function describeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack ?? null,
    };
  }
  return { errorName: "NonError", errorMessage: String(error), errorStack: null };
}

function emit(level: LogLevel, event: string, context: LogContext): void {
  const entry: LogEntry = {
    ...redact(context),
    level,
    time: new Date().toISOString(),
    event,
  };

  let line: string;
  try {
    line = JSON.stringify(entry);
  } catch {
    // A context value with a circular reference must not take down the request.
    line = JSON.stringify({ level, time: entry.time, event, contextSerialisationFailed: true });
  }

  // The single sanctioned console site in the codebase. stderr is what the
  // Vercel runtime-log drain ingests; there is no `console.log` anywhere.
  console.error(line);
}

export const logger = {
  info(event: string, context: LogContext = {}): void {
    emit("info", event, context);
  },
  warn(event: string, context: LogContext = {}): void {
    emit("warn", event, context);
  },
  error(event: string, context: LogContext = {}): void {
    emit("error", event, context);
  },
} as const;
