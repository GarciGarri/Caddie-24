import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus plantillas aprobadas por Meta
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">bienvenida_nuevo</CardTitle>
              <Badge variant="success">Aprobado</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Categoría: MARKETING</p>
            <div className="mt-2 p-2 rounded bg-muted text-xs">
              ¡Hola {"{{1}}"}! Bienvenido a {"{{2}}"}. Estamos encantados de tenerte...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">confirmacion_reserva</CardTitle>
              <Badge variant="success">Aprobado</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Categoría: UTILITY</p>
            <div className="mt-2 p-2 rounded bg-muted text-xs">
              Tu reserva para el {"{{1}}"} a las {"{{2}}"} está confirmada...
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed flex items-center justify-center min-h-[140px]">
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Crea un nuevo template</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
