"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Loader2,
  Trash2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Users,
  FileEdit,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  templateName: string;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
  createdBy: { name: string };
  _count: { recipients: number };
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  DRAFT: { label: "Borrador", icon: FileEdit, color: "bg-gray-100 text-gray-700" },
  SCHEDULED: { label: "Programada", icon: Megaphone, color: "bg-blue-100 text-blue-700" },
  SENDING: { label: "Enviando", icon: Loader2, color: "bg-yellow-100 text-yellow-700" },
  SENT: { label: "Enviada", icon: Send, color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completada", icon: CheckCircle, color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelada", icon: XCircle, color: "bg-red-100 text-red-700" },
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/campaigns?limit=50");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la campaña "${name}"? Las campañas enviadas se cancelarán.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Campaña eliminada");
      } else {
        toast.error("Error al eliminar la campaña");
      }
      fetchCampaigns();
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al eliminar la campaña");
    } finally {
      setDeleting(null);
    }
  };

  const handleSendNow = async (id: string, name: string) => {
    if (!confirm(`Enviar campaña "${name}" ahora? (simulado)`)) return;
    setSendingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
      if (res.ok) {
        toast.success("Campaña enviada correctamente");
        router.push(`/campaigns/${id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al enviar la campaña");
        fetchCampaigns();
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSendingId(null);
    }
  };

  const deliveryRate = (c: Campaign) => {
    if (c.totalRecipients === 0) return 0;
    return Math.round((c.totalDelivered / c.totalRecipients) * 100);
  };

  const readRate = (c: Campaign) => {
    if (c.totalDelivered === 0) return 0;
    return Math.round((c.totalRead / c.totalDelivered) * 100);
  };

  const totalCampaigns = campaigns.length;
  const completedCampaigns = campaigns.filter((c) => c.status === "COMPLETED").length;
  const draftCampaigns = campaigns.filter((c) => c.status === "DRAFT").length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus campañas de WhatsApp segmentadas
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Campaña
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCampaigns}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCampaigns}</p>
              <p className="text-xs text-muted-foreground">Completadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-gray-100 p-2">
              <FileEdit className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{draftCampaigns}</p>
              <p className="text-xs text-muted-foreground">Borradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSent}</p>
              <p className="text-xs text-muted-foreground">Mensajes Enviados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground mb-4">
              No hay campañas aún. Crea la primera.
            </p>
            <Link href="/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Campaña
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Campaña</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">Template</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">Destinatarios</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Entrega</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden lg:table-cell">Lectura</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const sc = statusConfig[campaign.status] || statusConfig.DRAFT;
                const Icon = sc.icon;
                const isDraft = campaign.status === "DRAFT";
                return (
                  <tr key={campaign.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                        <p className="text-sm font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.createdBy.name} &middot;{" "}
                          {new Date(campaign.createdAt).toLocaleDateString("es-ES")}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.color}`}>
                        <Icon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {campaign.templateName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {campaign.totalRecipients || "\u2014"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">
                      {campaign.totalRecipients > 0 ? (
                        <div>
                          <span className="font-medium">{deliveryRate(campaign)}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${deliveryRate(campaign)}%` }} />
                          </div>
                        </div>
                      ) : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">
                      {campaign.totalDelivered > 0 ? (
                        <div>
                          <span className="font-medium">{readRate(campaign)}%</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${readRate(campaign)}%` }} />
                          </div>
                        </div>
                      ) : "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isDraft && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleSendNow(campaign.id, campaign.name)}
                            disabled={sendingId === campaign.id}
                            title="Enviar ahora"
                          >
                            {sendingId === campaign.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Rocket className="h-3 w-3" />
                            )}
                            Enviar
                          </Button>
                        )}
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(campaign.id, campaign.name)}
                          disabled={deleting === campaign.id}
                          title="Eliminar"
                        >
                          {deleting === campaign.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
