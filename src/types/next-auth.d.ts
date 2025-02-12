import "next-auth";
import "next-auth/jwt";

// Extend the default session and JWT interfaces
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      image: string;
      roles: string;
    };
  }

  interface User {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    role: string;
  }
}
