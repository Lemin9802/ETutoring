import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

const allowedRolesWithPaths = {
  student: ["/students"],
  admin: ["/admin"],
  moderator: ["/moderators"],
  tutor: ["/tutors"],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token");

  if (!token?.value) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // ✅ Decrypt the NextAuth session token
    const decodeToken = await decode({
      token: token.value,
      secret: process.env.NEXTAUTH_SECRET ?? "",
    });

    if (!decodeToken) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const role =
      decodeToken.role.toLowerCase() as keyof typeof allowedRolesWithPaths;
    const pathname = request.nextUrl.pathname;

    // ✅ Check if the user's role has access to the requested path
    const allowedPaths = allowedRolesWithPaths[role] || [];

    if (allowedPaths.length === 0) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

    if (!hasAccess) {
      // Redirect to the default path for the user's role
      const defaultPath = allowedPaths[0] || "/";
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }

    return NextResponse.next(); // Allow access if authorized
  } catch (error) {
    console.error("JWT Decryption Error:", error);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

// Apply this middleware to the specific routes
export const config = {
  matcher: [
    "/",
    "/students/:path*",
    "/admin/:path*",
    "/moderators/:path*",
    "/teacher/:path*",
  ],
};