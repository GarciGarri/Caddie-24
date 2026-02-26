"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Megaphone,
  Trophy,
  Settings,
  Bot,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  CloudSun,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Jugadores", href: "/players", icon: Users },
  { title: "Bandeja de Entrada", href: "/inbox", icon: MessageSquare },
  { title: "Campañas", href: "/campaigns", icon: Megaphone },
  { title: "Torneos", href: "/tournaments", icon: Trophy },
  { title: "Meteorología", href: "/weather", icon: CloudSun },
  { title: "Templates", href: "/templates", icon: FileText },
  { title: "IA Insights", href: "/ai", icon: Bot },
];

const bottomItems = [
  { title: "Guía del Sistema", href: "/guide", icon: BookOpen },
  { title: "Configuración", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLink = (item: (typeof navItems)[0], showLabel: boolean) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        title={!showLabel ? item.title : undefined}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {showLabel && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-xl">⛳</span>
              <span className="font-bold text-sidebar-primary text-lg">
                Caddie 24
              </span>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <span className="text-xl">⛳</span>
            </Link>
          )}
        </div>
        <div className="flex justify-end px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => navLink(item, !collapsed))}
        </nav>
        <div className="px-2 pb-4">
          <Separator className="mb-2" />
          {bottomItems.map((item) => navLink(item, !collapsed))}
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar border-r flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
            {/* Mobile header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <span className="text-xl">⛳</span>
                <span className="font-bold text-sidebar-primary text-lg">
                  Caddie 24
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onMobileClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 px-2 mt-2">
              {navItems.map((item) => navLink(item, true))}
            </nav>
            <div className="px-2 pb-4">
              <Separator className="mb-2" />
              {bottomItems.map((item) => navLink(item, true))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
