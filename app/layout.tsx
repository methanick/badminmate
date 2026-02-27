"use client";

import { LoginForm } from "@/components/login-form";
import { Sidebar } from "@/components/sidebar";
import { AppProvider, useAppContext } from "@/contexts/app-context";
import { signOut } from "@/lib/api/auth";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthLoading } = useAppContext();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const isPublicRoute = pathname?.startsWith("/match/");

  const handleLogout = async () => {
    try {
      await signOut();
      // Auth state will be updated by onAuthStateChange
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // For public routes, render without auth check and sidebar
  if (isPublicRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  const username =
    currentUser.user_metadata?.username ||
    currentUser.email?.split("@")[0] ||
    "ผู้ใช้";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentUser={username} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
