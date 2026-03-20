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
    
    // Skip profile check if already on profile page or it's an API route
    const isProfilePage = pathname === "/profile";
    const isApiRoute = pathname.startsWith("/api/");
    
    // Check if user has completed their profile (if not on profile page already)
    if (!isProfilePage && !isApiRoute) {
      try {
        // Use our internal API route to check the profile
        const userId = decodeToken.id;
        const origin = request.nextUrl.origin;
        const profileCheckUrl = new URL(`/api/profile/profile`, origin);
        
        // Pass the session token in the Cookie header to authenticate the request
        const profileResponse = await fetch(profileCheckUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            // Include the session cookie to authenticate the request
            Cookie: `next-auth.session-token=${token.value}`
          },
          body: JSON.stringify({ id: userId }),
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // If full_name is null or empty, redirect to profile page with modal=open parameter
          if (!profileData.full_name) {
            return NextResponse.redirect(new URL("/profile?modal=open", request.url));
          }
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        // Continue with normal flow if profile check fails
      }
    }

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
