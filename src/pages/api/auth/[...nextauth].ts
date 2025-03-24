import { APIResponse } from "@/types/APIResponse";
import { jwtDecode } from "jwt-decode";
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing email or password");
        }

        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          return {
            id: result.data.sub,
            email: credentials.email,
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/sync-google-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: "google",
          }),
        });

        const result: APIResponse = await response.json();

        if (!response.ok || !result.success) {
          console.error("Failed to sync user with the backend.");
          return false;
        }

        // Lưu access_token vào user object
        user.accessToken = result.data.access_token;
        user.refreshToken = result.data.refresh_token;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        try {
          const decodedToken = jwtDecode<JWT>(user.accessToken);
          token.role = decodedToken.role || "student";
          token.id = decodedToken.sub!;
        } catch (error) {
          console.error("Failed to decode access token:", error);
          token.role = "student";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: token.accessToken ?? "",
        refreshToken: token.refreshToken ?? "",
        roles: token.role ?? "student",
        id: token.id ?? "",
      };
    
      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/students`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
