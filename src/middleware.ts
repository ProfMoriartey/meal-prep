// // middleware.ts - TEMPORARILY DISABLED FOR TESTING
// import { NextRequest, NextResponse } from "next/server";

// export default async function middleware(request: NextRequest) {
//   // Temporarily disable all middleware logic
//   console.log("Middleware bypassed for:", request.nextUrl.pathname);
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";

const publicPaths = ["/"];

export default async function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);
  
  try {
    const session = await auth();
    console.log("Session result:", session ? "Found session" : "No session");
    
    const pathname = request.nextUrl.pathname;

    if (!session && !publicPaths.includes(pathname)) {
      console.log("Redirecting to sign-in");
      const url = new URL("/api/auth/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error, redirect to sign-in
    const url = new URL("/api/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};