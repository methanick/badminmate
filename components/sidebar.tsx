"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  History,
  LayoutGrid,
  ListOrdered,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  currentUser: string;
  onLogout: () => void;
}

const menuItems = [
  {
    href: "/members",
    label: "สมาชิก",
    icon: Users,
  },
  {
    href: "/courts",
    label: "จัดการสนาม",
    icon: LayoutGrid,
  },
  {
    href: "/queue",
    label: "จัดการคิว",
    icon: ListOrdered,
  },
  {
    href: "/history",
    label: "ประวัติ",
    icon: History,
  },
];

export function Sidebar({ currentUser, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load collapsed state from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem("badminton-sidebar-collapsed");
    setIsCollapsed(saved === "true");
    setIsMounted(true);
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("badminton-sidebar-collapsed", String(newState));
  };

  // Prevent hydration mismatch by using consistent initial width
  const sidebarWidth = isMounted && isCollapsed ? "w-20" : "w-64";

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300",
        sidebarWidth,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!(isMounted && isCollapsed) && (
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              BadminMate
            </h1>
            <p className="text-sm text-gray-500 mt-1 truncate">
              ยินดีต้อนรับ {currentUser}
            </p>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0",
            isMounted && isCollapsed && "mx-auto",
          )}
          title={isMounted && isCollapsed ? "ขยาย" : "ย่อ"}
        >
          {isMounted && isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100",
                isMounted && isCollapsed && "justify-center",
              )}
              title={isMounted && isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!(isMounted && isCollapsed) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors w-full",
            isMounted && isCollapsed && "justify-center",
          )}
          title={isMounted && isCollapsed ? "ออกจากระบบ" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!(isMounted && isCollapsed) && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
}
