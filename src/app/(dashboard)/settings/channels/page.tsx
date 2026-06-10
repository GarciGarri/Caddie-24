"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  CheckCircle2,
  Instagram,
  Facebook,
  Mail,
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
import { toast } from "sonner";

export default function ChannelsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tgBusy, setTgBusy] = useState(false);
  const [tgStatus, setTgStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    telegramBotToken: "",
    metaPageAccessToken: "",
    metaWebhookVerifyToken: "",
    resendApiKey: "",
    emailFromAddress: "",
    emailFromName: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          telegramBotToken: data.telegramBotToken || "",
          metaPageAccessToken: data.metaPageAccessToken || "",
          metaWebhookVerifyToken: data.metaWebhookVerifyToken || "",
          resendApiKey: data.resendApiKey || "",
          emailFromAddress: data.emailFromAddress || "",
          emailFromName: data.emailFromName || "",
        });
      })
      .catch(() => toast.error("Error al cargar la configuración"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Error al guardar");
        return;
      }
      toast.success("Canales guardados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleTelegramSetup = async () => {
    setTgBusy(true);
    setTgStatus(null);
    try {
      // Save token first so the setup call can use it
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramBotToken: form.telegramBotToken }),
      });
      const res = await fetch("/api/settings/telegram-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Error al configurar el webhook");
        return;
      }
      setTgStatus(`Conectado como @${data.botUsername}. Webhook: ${data.webhookUrl}`);
      toast.success(`Bot @${data.botUsername} conectado`);
    } catch {
      toast.error("Error al configurar Telegram");
    } finally {
      setTgBusy(false);
    }
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
          <h1 className="text-2xl font-bold">Canales</h1>
          <p className="text-muted-foreground">
            Telegram, Instagram, Facebook Messenger y Email. WhatsApp se configura en
            su propia sección.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>

      {/* Telegram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-sky-500" />
            Telegram
          </CardTitle>
          <CardDescription>
            Crea un bot con @BotFather en Telegram (comando /newbot), pega aquí el
            token y pulsa &quot;Conectar bot&quot;. El webhook se configura solo. Ideal para
            probar el CRM sin depender de la aprobación de Meta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tgToken">Token del bot</Label>
            <Input
              id="tgToken"
              type="password"
              placeholder="123456789:AAH..."
              value={form.telegramBotToken}
              onChange={(e) =>
                setForm((p) => ({ ...p, telegramBotToken: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTelegramSetup}
              disabled={tgBusy || !form.telegramBotToken}
            >
              {tgBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Conectar bot (configura el webhook)
            </Button>
          </div>
          {tgStatus && (
            <div className="flex items-start gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              {tgStatus}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta: Instagram + Facebook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Instagram className="h-4 w-4 text-pink-500" />
            <Facebook className="h-4 w-4 text-blue-600" />
            Instagram y Facebook Messenger
          </CardTitle>
          <CardDescription>
            Requiere una app de Meta con los productos Messenger e Instagram. En el
            panel de Meta, configura el webhook apuntando a{" "}
            <code className="text-xs bg-muted px-1 rounded">
              /api/webhook/meta
            </code>{" "}
            con el verify token que definas abajo, y suscríbete al campo{" "}
            <code className="text-xs bg-muted px-1 rounded">messages</code> de la
            página y de la cuenta de Instagram.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaToken">Page Access Token</Label>
            <Input
              id="metaToken"
              type="password"
              placeholder="EAAG..."
              value={form.metaPageAccessToken}
              onChange={(e) =>
                setForm((p) => ({ ...p, metaPageAccessToken: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Token de página con permisos pages_messaging e
              instagram_manage_messages.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaVerify">Verify Token del webhook</Label>
            <Input
              id="metaVerify"
              placeholder="una-cadena-secreta-que-tu-elijas"
              value={form.metaWebhookVerifyToken}
              onChange={(e) =>
                setForm((p) => ({ ...p, metaWebhookVerifyToken: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-gray-500" />
            Email (salida)
          </CardTitle>
          <CardDescription>
            Envío de emails (campañas, recordatorios, journeys) mediante{" "}
            <a
              href="https://resend.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Resend
            </a>
            . Crea una cuenta gratuita, verifica tu dominio y pega la API key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resendKey">API key de Resend</Label>
            <Input
              id="resendKey"
              type="password"
              placeholder="re_..."
              value={form.resendApiKey}
              onChange={(e) =>
                setForm((p) => ({ ...p, resendApiKey: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailFrom">Email remitente</Label>
              <Input
                id="emailFrom"
                type="email"
                placeholder="club@tudominio.com"
                value={form.emailFromAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, emailFromAddress: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailName">Nombre remitente</Label>
              <Input
                id="emailName"
                placeholder="Club de Golf La Valmuza"
                value={form.emailFromName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, emailFromName: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
