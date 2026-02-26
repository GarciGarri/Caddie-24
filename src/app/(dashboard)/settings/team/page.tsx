"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Users, Shield, Crown, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ADMIN: { label: "Administrador", color: "bg-purple-100 text-purple-800", icon: Crown },
  MANAGER: { label: "Manager", color: "bg-blue-100 text-blue-800", icon: Shield },
  AGENT: { label: "Agente", color: "bg-gray-100 text-gray-800", icon: UserCog },
};

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we show the current users from the auth system
    // In a full implementation, this would have its own API
    setLoading(false);
    setUsers([
      {
        id: "1",
        name: "Admin",
        email: "admin@caddie24.com",
        role: "ADMIN",
        isActive: true,
      },
    ]);
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Equipo</h1>
          <p className="text-muted-foreground">Miembros del equipo, roles y permisos</p>
        </div>
      </div>

      {/* Role overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(ROLE_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const count = users.filter((u) => u.role === key).length;
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Miembros</CardTitle>
              <CardDescription>Gestiona los miembros del equipo CRM</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => {
              const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.AGENT;
              return (
                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge className={roleConf.color}>{roleConf.label}</Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              La gestión completa de usuarios (crear, editar roles, desactivar) estará disponible próximamente.
            </p>
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
