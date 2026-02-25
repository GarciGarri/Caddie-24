"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Send,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MailCheck,
  MailX,
  FileEdit,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  SCHEDULED: { label: "Programada", color: "bg-blue-100 text-blue-700" },
  SENDING: { label: "Enviando", color: "bg-yellow-100 text-yellow-700" },
  SENT: { label: "Enviada", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completada", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

const recipientStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "bg-gray-100 text-gray-700", icon: Clock },
  SENT: { label: "Enviado", color: "bg-blue-100 text-blue-700", icon: Send },
  DELIVERED: { label: "Entregado", color: "bg-green-100 text-green-700", icon: MailCheck },
  READ: { label: "Leído", color: "bg-purple-100 text-purple-700", icon: Eye },
  FAILED: { label: "Fallido", color: "bg-red-100 text-red-700", icon: MailX },
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (!res.ok) {
        setError("Campaña no encontrada");
        return;
      }
      const data = await res.json();
      setCampaign(data);
    } catch (err) {
      setError("Error al cargar campaña");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm("¿Enviar esta campaña ahora? (simulado)")) return;
    setSending(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
      if (res.ok) {
        fetchCampaign();
      } else {
        const data = await res.json();
        alert(data.error || "Error al enviar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/campaigns">
          <Button variant="outline">Volver a Campañas</Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[campaign.status] || statusConfig.DRAFT;
  const segment = campaign.segmentQuery || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign.name}
            </h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.color}`}>
              {sc.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Creada por {campaign.createdBy?.name} el{" "}
            {new Date(campaign.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {campaign.status === "DRAFT" && (
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Ahora
          </Button>
        )}
      </div>

      {/* Metrics cards */}
      {campaign.totalRecipients > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{campaign.totalRecipients}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Destinatarios
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{campaign.totalSent}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Send className="h-3 w-3" /> Enviados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{campaign.totalDelivered}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MailCheck className="h-3 w-3" /> Entregados
              </p>
              {campaign.totalRecipients > 0 && (
                <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.round(
                        (campaign.totalDelivered / campaign.totalRecipients) * 100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{campaign.totalRead}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" /> Leídos
              </p>
              {campaign.totalDelivered > 0 && (
                <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.round(
                        (campaign.totalRead / campaign.totalDelivered) * 100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{campaign.totalFailed}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MailX className="h-3 w-3" /> Fallidos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descripción</p>
                <p className="text-sm">{campaign.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Template</p>
                <Badge variant="secondary" className="font-mono">
                  {campaign.templateName}
                </Badge>
              </div>
              {campaign.sentAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Enviada</p>
                  <p className="text-sm">
                    {new Date(campaign.sentAt).toLocaleString("es-ES")}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Segmento</p>
              <div className="flex flex-wrap gap-2">
                {segment.engagementLevels?.length > 0 && (
                  <Badge variant="secondary">
                    Engagement: {segment.engagementLevels.join(", ")}
                  </Badge>
                )}
                {segment.languages?.length > 0 && (
                  <Badge variant="secondary">
                    Idiomas: {segment.languages.join(", ")}
                  </Badge>
                )}
                {(segment.handicapMin !== undefined || segment.handicapMax !== undefined) && (
                  <Badge variant="secondary">
                    Hándicap: {segment.handicapMin ?? 0}-{segment.handicapMax ?? 54}
                  </Badge>
                )}
                {!segment.engagementLevels?.length &&
                  !segment.languages?.length &&
                  segment.handicapMin === undefined &&
                  segment.handicapMax === undefined && (
                  <Badge variant="secondary">Todos los jugadores</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineItem
                icon={<FileEdit className="h-3 w-3" />}
                label="Creada"
                time={campaign.createdAt}
                active
              />
              {campaign.sentAt && (
                <TimelineItem
                  icon={<Send className="h-3 w-3" />}
                  label="Enviada"
                  time={campaign.sentAt}
                  active
                />
              )}
              {campaign.completedAt && (
                <TimelineItem
                  icon={<CheckCircle className="h-3 w-3" />}
                  label="Completada"
                  time={campaign.completedAt}
                  active
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Message Preview */}
      {campaign.template && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Vista previa del mensaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <WhatsAppPreview
                templateName={campaign.templateName}
                bodyText={
                  (campaign.template.components as any)?.body?.text || ""
                }
                sentAt={campaign.sentAt}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipients */}
      {campaign.recipients && campaign.recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Destinatarios ({campaign.recipients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Jugador</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Teléfono</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Enviado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Entregado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Leído</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.recipients.map((r: any) => {
                    const rsc = recipientStatusConfig[r.status] || recipientStatusConfig.PENDING;
                    const Icon = rsc.icon;
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                {r.player.firstName[0]}{r.player.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {r.player.firstName} {r.player.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-muted-foreground">
                          {r.player.phone}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${rsc.color}`}>
                            <Icon className="h-3 w-3" />
                            {rsc.label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {r.sentAt ? new Date(r.sentAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">
                          {r.readAt ? new Date(r.readAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WhatsAppPreview({
  templateName,
  bodyText,
  sentAt,
}: {
  templateName: string;
  bodyText: string;
  sentAt?: string;
}) {
  // Highlight {{1}}, {{2}} style placeholders
  const formattedText = bodyText.split(/(\\{\\{\\d+\\}\\}|\{\{\d+\}\})/).map((part, i) => {
    if (/\{\{\d+\}\}/.test(part)) {
      return (
        <span key={i} className="bg-white/30 rounded px-1 text-green-100 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });

  const time = sentAt
    ? new Date(sentAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="w-full max-w-sm">
      {/* Phone frame */}
      <div className="rounded-2xl border-2 border-gray-300 bg-[#e5ddd5] overflow-hidden shadow-lg">
        {/* WhatsApp header bar */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Caddie 24</p>
            <p className="text-[10px] text-green-200">Cuenta Business</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="p-3 min-h-[200px] flex flex-col justify-end gap-2"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5bfb3' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
          {/* Template label */}
          <div className="flex justify-center">
            <span className="bg-white/80 text-[10px] text-gray-500 rounded-full px-3 py-1">
              Template: {templateName}
            </span>
          </div>

          {/* Message bubble */}
          <div className="flex justify-end">
            <div className="relative max-w-[85%] bg-[#dcf8c6] rounded-lg rounded-tr-none px-3 py-2 shadow-sm">
              {/* Tail */}
              <div className="absolute -right-2 top-0 w-0 h-0 border-l-[8px] border-l-[#dcf8c6] border-t-[8px] border-t-transparent" />
              <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {formattedText}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-gray-500">{time}</span>
                <svg className="w-4 h-3 text-blue-500" viewBox="0 0 16 11" fill="currentColor">
                  <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146l-.311.31a.445.445 0 0 0-.14.337c0 .136.047.25.14.343l2.996 2.996a.724.724 0 0 0 .505.209.67.67 0 0 0 .539-.241l6.694-8.359a.497.497 0 0 0 .102-.38.504.504 0 0 0-.178-.312l-.338-.27z" />
                  <path d="M14.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.2-1.134-.612.704 1.533 1.532a.724.724 0 0 0 .505.209.67.67 0 0 0 .539-.241l6.694-8.359a.497.497 0 0 0 .102-.38.504.504 0 0 0-.178-.312l-.338-.27z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-[#f0f0f0] px-2 py-2 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-4 py-1.5">
            <p className="text-xs text-gray-400">Escribe un mensaje...</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#075e54] flex items-center justify-center">
            <Send className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  icon,
  label,
  time,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  time: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 rounded-full p-1.5 ${
          active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(time).toLocaleString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
