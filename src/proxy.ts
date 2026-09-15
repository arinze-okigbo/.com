import { NextResponse, type NextRequest } from "next/server";

/** Fresh nonce per HTML response; feed fetches remain independently cached. */
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== "production";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://substackcdn.com https://substack-post-media.s3.amazonaws.com https://media.licdn.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws: http://localhost:* http://127.0.0.1:*" : ""}`,
    "frame-src https://www.linkedin.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2|ico|xml|txt)$).*)",
  ],
};
