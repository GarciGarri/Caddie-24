"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  MessageSquare,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface WhatsAppSettings {
  whatsappPhoneNumberId: string;
  whatsappBusinessAccountId: string;
  whatsappAccessToken: string;
  webhookVerifyToken: string;
}

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    displayName?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          setSettings(await res.json());
        } else {
          setError("Error al cargar los ajustes de WhatsApp");
        }
      } catch (err) {
        console.error("Error loading WhatsApp settings:", err);
        setError("Error al cargar los ajustes de WhatsApp");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappPhoneNumberId: settings?.whatsappPhoneNumberId,
          whatsappBusinessAccountId: settings?.whatsappBusinessAccountId,
          whatsappAccessToken: settings?.whatsappAccessToken,
          webhookVerifyToken: settings?.webhookVerifyToken,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTestResult(null);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Error al guardar los ajustes de WhatsApp");
      }
    } catch (err) {
      console.error("Error saving WhatsApp settings:", err);
      setError("Error al guardar los ajustes de WhatsApp");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/whatsapp-test", {
        method: "POST",
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error("Error testing WhatsApp connection:", err);
      setTestResult({ success: false, error: "Error de conexión" });
    } finally {
      setTesting(false);
    }
  };

  const isConnected =
    settings?.whatsappPhoneNumberId && settings?.whatsappAccessToken;

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
        <div>
          <h1 className="text-2xl font-bold">Configuración WhatsApp</h1>
          <p className="text-muted-foreground">
            Conexión con Meta Business Platform
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status card */}
      <Card
        className={
          isConnected
            ? "border-green-200 bg-green-50/50"
            : "border-yellow-200 bg-yellow-50/50"
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isConnected ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              <MessageSquare
                className={`h-5 w-5 ${
                  isConnected ? "text-green-600" : "text-yellow-600"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {isConnected
                  ? "WhatsApp conectado"
                  : "WhatsApp no configurado"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? "La API de WhatsApp Business está activa"
                  : "Configura los credenciales de Meta para activar WhatsApp"}
              </p>
            </div>
            <Badge
              className={
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {isConnected ? "Activo" : "Pendiente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciales Meta Business</CardTitle>
          <CardDescription>
            Obtén estos datos en{" "}
            <span className="text-primary">
              developers.facebook.com → WhatsApp → API Setup
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Phone Number ID</Label>
            <Input
              value={settings?.whatsappPhoneNumberId || ""}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  whatsappPhoneNumberId: e.target.value,
                })
              }
              placeholder="ej. 123456789012345"
            />
          </div>
          <div>
            <Label>Business Account ID</Label>
            <Input
              value={settings?.whatsappBusinessAccountId || ""}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  whatsappBusinessAccountId: e.target.value,
                })
              }
              placeholder="ej. 987654321098765"
            />
          </div>
          <div>
            <Label>Access Token</Label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                value={settings?.whatsappAccessToken || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings!,
                    whatsappAccessToken: e.target.value,
                  })
                }
                placeholder="Token de acceso permanente"
                className="pr-10"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Label>Webhook Verify Token</Label>
            <Input
              value={settings?.webhookVerifyToken || ""}
              onChange={(e) =>
                setSettings({
                  ...settings!,
                  webhookVerifyToken: e.target.value,
                })
              }
              placeholder="Token personalizado para verificar webhooks"
            />
          </div>
        </CardContent>
      </Card>

      {/* Webhook info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración del Webhook</CardTitle>
          <CardDescription>
            Configura esta URL en Meta Developers → WhatsApp → Configuration →
            Webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Callback URL
            </Label>
            <code className="block bg-muted px-3 py-2 rounded text-sm mt-1 select-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
              /api/webhook/whatsapp
            </code>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Verify Token
            </Label>
            <code className="block bg-muted px-3 py-2 rounded text-sm mt-1">
              {settings?.webhookVerifyToken || "(configura arriba)"}
            </code>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              <span className="font-medium">Importante:</span> Asegúrate de usar tu dominio de producción en la Callback URL (ej: https://tu-app.vercel.app). La URL mostrada arriba usa el dominio actual del navegador, que puede no ser accesible desde Internet.
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">
              Suscripciones necesarias en el webhook:
            </p>
            <p>messages, message_deliveries, message_reads</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Número de prueba</p>
              <p>
                Si usas un número de test de Meta, solo puedes enviar mensajes a
                los números añadidos como destinatarios de prueba en Meta
                Developers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test result */}
      {testResult && (
        <Card
          className={
            testResult.success
              ? "border-green-200 bg-green-50/50"
              : "border-red-200 bg-red-50/50"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {testResult.success ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">
                  {testResult.success
                    ? `Conexión exitosa: ${testResult.displayName}`
                    : "Error de conexión"}
                </p>
                {testResult.error && (
                  <p className="text-sm text-red-600">{testResult.error}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={!isConnected || testing}
        >
          {testing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4 mr-2" />
          )}
          Probar Conexión
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className={saved ? "bg-green-600" : ""}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? "Guardado" : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
