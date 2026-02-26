import Link from "next/link";
import {
  Building2,
  MessageSquare,
  Bot,
  Clock,
  Shield,
  Users,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const settingsSections = [
  {
    title: "General",
    description: "Nombre del club, zona horaria, idioma por defecto",
    icon: Building2,
    href: "/settings/general",
  },
  {
    title: "Campo y Meteorología",
    description: "Coordenadas GPS, capacidad, tarifas, umbrales de cierre, festivos",
    icon: MapPin,
    href: "/settings/field",
  },
  {
    title: "WhatsApp",
    description: "Conexión con Meta, número de teléfono, templates",
    icon: MessageSquare,
    href: "/settings/whatsapp",
  },
  {
    title: "Perfil de Voz IA",
    description: "Tono, valores y estilo de comunicación del club",
    icon: Bot,
    href: "/settings/voice-profile",
  },
  {
    title: "Horarios y Programación",
    description: "Horas de silencio, reglas de prioridad",
    icon: Clock,
    href: "/settings/scheduling",
  },
  {
    title: "Automatización",
    description: "Niveles de automatización, umbrales de escalado",
    icon: Shield,
    href: "/settings/automation",
  },
  {
    title: "Equipo",
    description: "Miembros del equipo, roles y permisos",
    icon: Users,
    href: "/settings/team",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la configuración de tu CRM
        </p>
      </div>

      <div className="grid gap-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
