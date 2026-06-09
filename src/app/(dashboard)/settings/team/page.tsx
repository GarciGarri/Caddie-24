"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Users,
  Shield,
  Crown,
  UserCog,
  Plus,
  KeyRound,
  Power,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ADMIN: { label: "Administrador", color: "bg-purple-100 text-purple-800", icon: Crown },
  MANAGER: { label: "Manager", color: "bg-blue-100 text-blue-800", icon: Shield },
  AGENT: { label: "Agente", color: "bg-gray-100 text-gray-800", icon: UserCog },
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "AGENT" };

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
      setCurrentUserId(data.currentUserId || null);
    } catch {
      toast.error("Error al cargar el equipo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al crear el usuario");
        return;
      }
      toast.success(`Usuario ${data.name} creado`);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      fetchTeam();
    } catch {
      toast.error("Error al crear el usuario");
    } finally {
      setSaving(false);
    }
  };

  const patchUser = async (id: string, patch: Record<string, unknown>, okMsg: string) => {
    setBusyUserId(id);
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al actualizar");
        return;
      }
      toast.success(okMsg);
      fetchTeam();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRoleChange = (user: TeamUser, role: string) => {
    if (role === user.role) return;
    patchUser(user.id, { role }, `Rol de ${user.name} actualizado`);
  };

  const handleToggleActive = (user: TeamUser) => {
    const action = user.isActive ? "desactivar" : "reactivar";
    if (!confirm(`¿Seguro que quieres ${action} a ${user.name}?`)) return;
    patchUser(
      user.id,
      { isActive: !user.isActive },
      user.isActive ? `${user.name} desactivado` : `${user.name} reactivado`
    );
  };

  const handleResetPassword = (user: TeamUser) => {
    const password = prompt(
      `Nueva contraseña para ${user.name} (mínimo 8 caracteres):`
    );
    if (!password) return;
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    patchUser(user.id, { password }, `Contraseña de ${user.name} actualizada`);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-muted-foreground">Miembros del equipo, roles y permisos</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? (
            <X className="h-4 w-4 mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {showCreate ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {/* Create user form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear nuevo usuario</CardTitle>
            <CardDescription>
              El usuario podrá iniciar sesión con el email y contraseña que definas aquí.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ana Martínez"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="ana@tuclub.com"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    disabled={saving}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="AGENT">Agente</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear usuario
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Role overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const count = users.filter((u) => u.role === key && u.isActive).length;
          return (
            <Card key={key}>
              <CardContent className="pt-6 text-center">
                <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.label}s</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros
          </CardTitle>
          <CardDescription>
            Gestiona los miembros del equipo: rol, acceso y contraseña. Solo los
            administradores pueden hacer cambios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => {
              const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.AGENT;
              const busy = busyUserId === user.id;
              const isSelf = user.id === currentUserId;
              return (
                <div
                  key={user.id}
                  className={`flex flex-wrap items-center gap-3 p-3 border rounded-lg ${
                    !user.isActive ? "opacity-60" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium text-sm">
                      {user.name}
                      {isSelf && (
                        <span className="text-xs text-muted-foreground ml-1">(tú)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={busy}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none"
                    title="Cambiar rol"
                  >
                    <option value="AGENT">Agente</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  <Badge className={roleConf.color}>{roleConf.label}</Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleResetPassword(user)}
                      disabled={busy}
                      title="Cambiar contraseña"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        user.isActive ? "text-destructive hover:text-destructive" : "text-green-600"
                      }`}
                      onClick={() => handleToggleActive(user)}
                      disabled={busy || isSelf}
                      title={
                        isSelf
                          ? "No puedes desactivar tu propia cuenta"
                          : user.isActive
                            ? "Desactivar acceso"
                            : "Reactivar acceso"
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay usuarios todavía.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permisos por rol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: "Administrador", perms: "Acceso completo. Gestión de equipo, configuración y facturación." },
              { role: "Manager", perms: "Gestión de jugadores, campañas, torneos. Sin acceso a configuración avanzada." },
              { role: "Agente", perms: "Responder mensajes, ver jugadores. Sin crear campañas ni torneos." },
            ].map((item) => (
              <div key={item.role} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.role}</p>
                  <p className="text-xs text-muted-foreground">{item.perms}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
