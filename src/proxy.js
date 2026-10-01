import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Anyone can browse the landing page and the job listings
const publicRoutes = ["/", "/jobs", "/auth/login", "/auth/register"];

const authRoutes = ["/auth/login", "/auth/register"];

const isJobDetailRoute = (pathname) => /^\/jobs\/\d+$/.test(pathname);

export function proxy(request) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    publicRoutes.includes(pathname) || isJobDetailRoute(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  const user = token ? verifyToken(token) : null;
  const isLoggedIn = !!user?.id;

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isAuthRoute) {
    const redirectUrl =
      user.role === "SEEKER"
        ? new URL("/jobs", request.url)
        : new URL("/dashboard", request.url);

    return NextResponse.redirect(redirectUrl);
  }

  if (
    isLoggedIn &&
    user.role === "SEEKER" &&
    pathname.startsWith("/dashboard")
  ) {
    const jobUrl = new URL("/jobs", request.url);
    return NextResponse.redirect(jobUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // "images/" = static files in public/images, which must load without a login
    "/((?!api|_next/static|_next/image|images/|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
