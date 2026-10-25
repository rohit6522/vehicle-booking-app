import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Behind Render's proxy, req.url's origin is the server's bind address
// (0.0.0.0:10000), so redirects built from it land on a dead URL. Build
// the public origin from the forwarded headers instead.
function publicUrl(req: Request, path: string) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const base = host ? `${proto}://${host}` : new URL(req.url).origin;
  return new URL(path, base);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected =
    pathname.startsWith("/rider") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/become-a-partner") ||
    pathname.startsWith("/video-kyc");

  if (!isProtected) return NextResponse.next();

  if (!session) {
    const url = publicUrl(req, "/");
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (session.user as any)?.role;

  if (pathname.startsWith("/driver") && role !== "driver") {
    return NextResponse.redirect(publicUrl(req, "/"));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(publicUrl(req, "/"));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/rider/:path*",
    "/driver/:path*",
    "/admin/:path*",
    "/bookings/:path*",
    "/become-a-partner/:path*",
    "/video-kyc/:path*",
  ],
};