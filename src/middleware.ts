import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RoleName } from "@/types";

const TOKEN_KEY = "raho_token";

const PUBLIC_ROUTES  = ["/login"];
const ROLE_PREFIXES: Record<RoleName, string> = {
  SUPER_ADMIN:  "/superadmin",
  MASTER_ADMIN: "/masteradmin",
  ADMIN:        "/admin",
  DOCTOR:       "/doctor",
  NURSE:        "/nurse",
  PATIENT:      "/patient",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
