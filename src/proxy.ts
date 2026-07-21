import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected =
    pathname.startsWith("/rider") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/admin");

  if (!isProtected) return NextResponse.next();

 if (!session) {
    const homeUrl = new URL("/", req.url);
    homeUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(homeUrl);
  }

  const role = (session.user as any)?.role;

  if (pathname.startsWith("/driver") && role !== "driver") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/rider/:path*", "/driver/:path*", "/admin/:path*"],
};
