"use client";

import { LoginForm } from "@/components/login-form";
import { Sidebar } from "@/components/sidebar";
import { AppProvider, useAppContext } from "@/contexts/app-context";
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
  const { currentUser, setCurrentUser } = useAppContext();
  const pathname = usePathname();

  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />
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
