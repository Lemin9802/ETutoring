import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }: AppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const noLayoutRoutes = ["/auth/signin", "/auth/signup", "/_error"];

  const showBar = !noLayoutRoutes.includes(router.pathname);

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {showBar && (
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}

        {/* Main Content Area */}
        <div className="relative flex flex-1 flex-col lg:ml-72.5">
          {/* Header */}
          {showBar && (
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          )}
          {/* Page Content */}
          <main className="px-4">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </SessionProvider>
  );
}
