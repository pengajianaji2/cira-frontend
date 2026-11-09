import { NextRequest, NextResponse } from "next/server";

function getApiOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").origin;
  } catch {
    return "'self'";
  }
}

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const apiOrigin = getApiOrigin();
  const csp = [
    "default-src 'self'",
    // Vercel production can strip Content-Security-Policy from forwarded request
    // headers before Next.js adds its framework bootstrap scripts. Keep executable
    // scripts same-origin; allow Next's inline hydration payloads and block inline
    // event-handler attributes separately.
    "script-src 'self' 'unsafe-inline'",
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-elem 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://res.cloudinary.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin} https://api.cloudinary.com`,
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest).*)",
    },
  ],
};
