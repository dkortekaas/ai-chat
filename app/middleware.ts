import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith("/(auth)");
  //const isLocalhost = request.headers.get("host")?.includes("localhost:3000");

  // // If trying to access auth pages and not on localhost, redirect to login
  // if (isAuthPage && !isLocalhost) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // If trying to access protected pages without being logged in, redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
