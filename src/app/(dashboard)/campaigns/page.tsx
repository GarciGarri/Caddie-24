import { Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus campañas de WhatsApp segmentadas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Promo Fin de Semana</CardTitle>
              <Badge variant="success">Enviada</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Oferta especial para jugadores de fin de semana</p>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>📤 156 enviados</span>
              <span>👀 89% abiertos</span>
              <span>💬 34% respondieron</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Torneo Primavera</CardTitle>
              <Badge variant="warning">Programada</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Invitación al torneo de primavera 2026</p>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>📋 82 destinatarios</span>
              <span>📅 1 Mar 2026</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed flex items-center justify-center min-h-[120px]">
          <div className="text-center text-muted-foreground">
            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Crea tu primera campaña</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
