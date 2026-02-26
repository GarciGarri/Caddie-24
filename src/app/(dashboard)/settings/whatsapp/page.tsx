"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, MessageSquare, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) setSettings(await res.json());
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappPhoneNumberId: settings.whatsappPhoneNumberId,
          whatsappBusinessAccountId: settings.whatsappBusinessAccountId,
          whatsappAccessToken: settings.whatsappAccessToken,
          webhookVerifyToken: settings.webhookVerifyToken,
        }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch {} finally { setSaving(false); }
  };

  const isConnected = settings?.whatsappPhoneNumberId && settings?.whatsappAccessToken;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Configuración WhatsApp</h1>
          <p className="text-muted-foreground">Conexión con Meta Business Platform</p>
        </div>
      </div>

      {/* Status card */}
      <Card className={isConnected ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isConnected ? "bg-green-100" : "bg-yellow-100"}`}>
              <MessageSquare className={`h-5 w-5 ${isConnected ? "text-green-600" : "text-yellow-600"}`} />
            </div>
            <div>
              <p className="font-medium">{isConnected ? "WhatsApp conectado" : "WhatsApp no configurado"}</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? "La API de WhatsApp Business está activa" : "Configura los credenciales de Meta para activar WhatsApp"}
              </p>
            </div>
            <Badge className={isConnected ? "bg-green-100 text-green-800 ml-auto" : "bg-yellow-100 text-yellow-800 ml-auto"}>
              {isConnected ? "Activo" : "Pendiente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credenciales Meta Business</CardTitle>
          <CardDescription>
            Obtén estos datos en{" "}
            <span className="text-primary">developers.facebook.com → WhatsApp → API Setup</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Phone Number ID</Label>
            <Input value={settings?.whatsappPhoneNumberId || ""} onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })} placeholder="ej. 123456789012345" />
          </div>
          <div>
            <Label>Business Account ID</Label>
            <Input value={settings?.whatsappBusinessAccountId || ""} onChange={(e) => setSettings({ ...settings, whatsappBusinessAccountId: e.target.value })} placeholder="ej. 987654321098765" />
          </div>
          <div>
            <Label>Access Token</Label>
            <div className="relative">
              <Input type={showToken ? "text" : "password"} value={settings?.whatsappAccessToken || ""} onChange={(e) => setSettings({ ...settings, whatsappAccessToken: e.target.value })} placeholder="Token de acceso permanente" className="pr-10" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowToken(!showToken)}>
                {showToken ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Webhook Verify Token</Label>
            <Input value={settings?.webhookVerifyToken || ""} onChange={(e) => setSettings({ ...settings, webhookVerifyToken: e.target.value })} placeholder="Token personalizado para verificar webhooks" />
            <p className="text-xs text-muted-foreground mt-1">
              URL del webhook: <code className="bg-muted px-1 rounded">{typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/whatsapp</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className={saved ? "bg-green-600" : ""}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Guardado" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
