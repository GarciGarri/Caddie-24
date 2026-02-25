"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Demo data — will be replaced with real API calls
const demoPlayers = [
  {
    id: "1",
    firstName: "Carlos",
    lastName: "García",
    phone: "+34 612 345 678",
    email: "carlos@email.com",
    handicap: 12.4,
    engagementLevel: "HIGH",
    preferredLanguage: "ES",
    tags: ["madrugador", "torneo"],
    lastVisit: "2026-02-20",
  },
  {
    id: "2",
    firstName: "James",
    lastName: "Smith",
    phone: "+44 7911 123456",
    email: "james@email.com",
    handicap: 8.2,
    engagementLevel: "VIP",
    preferredLanguage: "EN",
    tags: ["alto_valor", "fin_de_semana"],
    lastVisit: "2026-02-22",
  },
  {
    id: "3",
    firstName: "Hans",
    lastName: "Müller",
    phone: "+49 171 1234567",
    email: "hans@email.com",
    handicap: 18.6,
    engagementLevel: "MEDIUM",
    preferredLanguage: "DE",
    tags: ["sensible_precio", "turista"],
    lastVisit: "2026-02-15",
  },
  {
    id: "4",
    firstName: "María",
    lastName: "López",
    phone: "+34 698 765 432",
    email: "maria@email.com",
    handicap: 22.1,
    engagementLevel: "NEW",
    preferredLanguage: "ES",
    tags: ["principiante"],
    lastVisit: "2026-02-24",
  },
];

const engagementColors: Record<string, string> = {
  VIP: "bg-purple-100 text-purple-800",
  HIGH: "bg-green-100 text-green-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  LOW: "bg-yellow-100 text-yellow-800",
  NEW: "bg-gray-100 text-gray-800",
};

const engagementLabels: Record<string, string> = {
  VIP: "VIP",
  HIGH: "Alto",
  MEDIUM: "Medio",
  LOW: "Bajo",
  NEW: "Nuevo",
};

export default function PlayersPage() {
  const [search, setSearch] = useState("");

  const filtered = demoPlayers.filter(
    (p) =>
      p.firstName.toLowerCase().includes(search.toLowerCase()) ||
      p.lastName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los perfiles de tus jugadores
          </p>
        </div>
        <Link href="/players/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Jugador
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{demoPlayers.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Trophy className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {demoPlayers.filter((p) => p.engagementLevel === "VIP").length}
              </p>
              <p className="text-xs text-muted-foreground">VIP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {demoPlayers.filter((p) => p.engagementLevel === "HIGH").length}
              </p>
              <p className="text-xs text-muted-foreground">Alto Engagement</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {demoPlayers.filter((p) => p.engagementLevel === "NEW").length}
              </p>
              <p className="text-xs text-muted-foreground">Nuevos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar jugadores..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Players table */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Jugador
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Hándicap
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Etiquetas
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Última Visita
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr
                  key={player.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${player.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {player.firstName[0]}
                          {player.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {player.preferredLanguage}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {player.phone}
                      </div>
                      {player.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {player.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {player.handicap}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        engagementColors[player.engagementLevel]
                      }`}
                    >
                      {engagementLabels[player.engagementLevel]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {player.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {player.lastVisit}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
