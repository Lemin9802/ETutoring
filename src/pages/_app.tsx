import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ReactNode, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const noLayoutRoutes = ["/auth/signin", "/auth/signup", "/_error"];

  const showBar = !noLayoutRoutes.includes(router.pathname);

  return (
    <SessionProvider>
      <AuthWrapper>
        <div className="flex">
          {/* Sidebar */}
          {showBar && (
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          )}

          {/* Main Content Area */}
          <div className="relative flex flex-1 flex-col lg:ml-72.5">
            {/* Header */}
            {showBar && (
              <Header
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            )}
            {/* Page Content */}
            <main className="px-4">
              <Component {...pageProps} />
            </main>
          </div>
        </div>
      </AuthWrapper>
    </SessionProvider>
  );
}

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    // You can add a loading spinner here if you want
    return <div>Loading...</div>;
  }

  if (!session && router.pathname !== "/auth/signin") {
    router.push("/auth/signin");
    return null; // Prevent rendering the protected page before redirect
  }

  return <>{children}</>;
};
