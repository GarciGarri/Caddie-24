"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, Search, Presentation, LogOut, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/layout/notification-bell";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Manager",
  AGENT: "Agente",
};

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load current session user
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/players?search=${encodeURIComponent(q)}`);
    setSearch("");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "··";

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b px-4 sm:px-6 bg-background shrink-0 overflow-visible relative z-30">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar jugadores..."
            className="w-64 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/presentacion" target="_blank">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Modo Presentación">
            <Presentation className="h-4 w-4" />
          </Button>
        </Link>
        <NotificationBell />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title={user?.name || "Cuenta"}
          >
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-md border bg-background shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium truncate">{user?.name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {user?.role && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ROLE_LABELS[user.role] || user.role}
                  </p>
                )}
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Configuración
              </Link>
              <Link
                href="/settings/team"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                Equipo
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors border-t"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
