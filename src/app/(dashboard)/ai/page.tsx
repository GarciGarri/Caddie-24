import { Bot, Brain, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IA Insights</h1>
        <p className="text-muted-foreground mt-1">
          Análisis de conversaciones y rendimiento de la IA
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-8 text-center">
        <Bot className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Aún no hay datos de IA</p>
        <p className="text-xs text-muted-foreground mt-1">
          Las métricas se mostrarán cuando Caddie AI procese conversaciones, genere templates o analice sentimiento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mensajes IA Hoy</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Respuestas automáticas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sentimiento Medio</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Sin datos aún</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Escalados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Hoy a humano</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa Resolución</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">% resueltos por IA</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registro de Actividad IA</CardTitle>
          <CardDescription>Últimas acciones de la inteligencia artificial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">No hay actividad IA registrada aún</p>
            <p className="text-xs mt-1">Conecta WhatsApp y la IA empezará a trabajar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
