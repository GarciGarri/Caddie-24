"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Save, Loader2, Plus, X, DollarSign, Wind, Droplets, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

export default function FieldSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fieldName: "La Valmuza Golf Club",
    fieldLatitude: 40.9651,
    fieldLongitude: -5.664,
    fieldCapacity: 80,
    fieldOpenTime: "07:00",
    fieldCloseTime: "21:00",
    rateWeekday: 45,
    rateWeekend: 65,
    rateHoliday: 75,
    rainClosureThreshold: 10,
    windClosureThreshold: 50,
  });
  const [holidays, setHolidays] = useState<Array<{ date: string; name: string }>>([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
  const [seasonHigh, setSeasonHigh] = useState(["04","05","06","07","08","09","10"]);
  const [seasonMedium, setSeasonMedium] = useState(["03","11"]);
  const [multipliers, setMultipliers] = useState({ high: 1.2, medium: 1.0, low: 0.7 });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setForm({
          fieldName: data.fieldName || "La Valmuza Golf Club",
          fieldLatitude: data.fieldLatitude ?? 40.9651,
          fieldLongitude: data.fieldLongitude ?? -5.664,
          fieldCapacity: data.fieldCapacity ?? 80,
          fieldOpenTime: data.fieldOpenTime || "07:00",
          fieldCloseTime: data.fieldCloseTime || "21:00",
          rateWeekday: data.rateWeekday ?? 45,
          rateWeekend: data.rateWeekend ?? 65,
          rateHoliday: data.rateHoliday ?? 75,
          rainClosureThreshold: data.rainClosureThreshold ?? 10,
          windClosureThreshold: data.windClosureThreshold ?? 50,
        });
        if (data.customHolidays) setHolidays(data.customHolidays);
        if (data.seasonConfig) {
          setSeasonHigh(data.seasonConfig.high || []);
          setSeasonMedium(data.seasonConfig.medium || []);
        }
        if (data.seasonMultipliers) setMultipliers(data.seasonMultipliers);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
      setError("Error al cargar la configuración del campo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (form.fieldOpenTime && form.fieldCloseTime && form.fieldOpenTime >= form.fieldCloseTime) {
      toast.error("La hora de apertura debe ser anterior a la hora de cierre");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const allMonths = ["01","02","03","04","05","06","07","08","09","10","11","12"];
      const low = allMonths.filter((m) => !seasonHigh.includes(m) && !seasonMedium.includes(m));

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customHolidays: holidays,
          seasonConfig: { high: seasonHigh, medium: seasonMedium, low },
          seasonMultipliers: multipliers,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError("Error al guardar la configuración del campo");
      }
    } catch (e) {
      console.error("Error saving:", e);
      setError("Error al guardar la configuración del campo");
    } finally {
      setSaving(false);
    }
  };

  const toggleMonth = (month: string, list: string[], setList: (v: string[]) => void, otherList: string[], setOtherList: (v: string[]) => void) => {
    if (list.includes(month)) {
      setList(list.filter((m) => m !== month));
    } else {
      setOtherList(otherList.filter((m) => m !== month));
      setList([...list, month]);
    }
  };

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, { ...newHoliday }]);
      setNewHoliday({ date: "", name: "" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configuración del Campo</h1>
            <p className="text-muted-foreground text-sm">GPS, capacidad, tarifas, umbrales y festivos</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className={saved ? "bg-green-600" : ""}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Guardado" : "Guardar"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Location & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Ubicación y Datos Básicos</CardTitle>
          <CardDescription>Coordenadas GPS para la API meteorológica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nombre del campo</Label>
              <Input value={form.fieldName} onChange={(e) => setForm({ ...form, fieldName: e.target.value })} />
            </div>
            <div>
              <Label>Capacidad (salidas/día)</Label>
              <Input type="number" value={form.fieldCapacity} onChange={(e) => setForm({ ...form, fieldCapacity: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Latitud</Label>
              <Input type="number" step="0.0001" value={form.fieldLatitude} onChange={(e) => setForm({ ...form, fieldLatitude: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Longitud</Label>
              <Input type="number" step="0.0001" value={form.fieldLongitude} onChange={(e) => setForm({ ...form, fieldLongitude: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Hora apertura</Label>
              <Input type="time" value={form.fieldOpenTime} onChange={(e) => setForm({ ...form, fieldOpenTime: e.target.value })} />
            </div>
            <div>
              <Label>Hora cierre</Label>
              <Input type="time" value={form.fieldCloseTime} onChange={(e) => setForm({ ...form, fieldCloseTime: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Tarifas Medias</CardTitle>
          <CardDescription>Para calcular revenue estimado en predicciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Laboral (EUR)</Label>
              <Input type="number" value={form.rateWeekday} onChange={(e) => setForm({ ...form, rateWeekday: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Fin de semana (EUR)</Label>
              <Input type="number" value={form.rateWeekend} onChange={(e) => setForm({ ...form, rateWeekend: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Festivo (EUR)</Label>
              <Input type="number" value={form.rateHoliday} onChange={(e) => setForm({ ...form, rateHoliday: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Closure Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5" /> Umbrales de Cierre</CardTitle>
          <CardDescription>Condiciones que activan recomendación de cierre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1"><Droplets className="h-3 w-3" /> Lluvia (mm/h)</Label>
              <Input type="number" value={form.rainClosureThreshold} onChange={(e) => setForm({ ...form, rainClosureThreshold: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Wind className="h-3 w-3" /> Viento (km/h)</Label>
              <Input type="number" value={form.windClosureThreshold} onChange={(e) => setForm({ ...form, windClosureThreshold: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seasons */}
      <Card>
        <CardHeader>
          <CardTitle>Temporadas</CardTitle>
          <CardDescription>Selecciona los meses de cada temporada. Los no seleccionados serán temporada baja.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-green-600 font-medium">Temporada Alta</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(MONTH_LABELS).map(([m, label]) => (
                <button key={`high-${m}`} onClick={() => toggleMonth(m, seasonHigh, setSeasonHigh, seasonMedium, setSeasonMedium)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${seasonHigh.includes(m) ? "bg-green-100 border-green-400 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-yellow-600 font-medium">Temporada Media</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(MONTH_LABELS).map(([m, label]) => (
                <button key={`med-${m}`} onClick={() => toggleMonth(m, seasonMedium, setSeasonMedium, seasonHigh, setSeasonHigh)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${seasonMedium.includes(m) ? "bg-yellow-100 border-yellow-400 text-yellow-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Multiplicador Alta</Label>
              <Input type="number" step="0.1" value={multipliers.high} onChange={(e) => setMultipliers({ ...multipliers, high: parseFloat(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>Multiplicador Media</Label>
              <Input type="number" step="0.1" value={multipliers.medium} onChange={(e) => setMultipliers({ ...multipliers, medium: parseFloat(e.target.value) || 1 })} />
            </div>
            <div>
              <Label>Multiplicador Baja</Label>
              <Input type="number" step="0.1" value={multipliers.low} onChange={(e) => setMultipliers({ ...multipliers, low: parseFloat(e.target.value) || 1 })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Holidays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Festivos Personalizados</CardTitle>
          <CardDescription>Festivos locales o regionales adicionales a los nacionales (ya incluidos)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} className="sm:w-44" />
            <Input placeholder="Nombre del festivo" value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} />
            <Button variant="outline" size="icon" onClick={addHoliday} disabled={!newHoliday.date || !newHoliday.name}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {holidays.length > 0 && (
            <div className="space-y-2">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <span className="text-sm font-medium">{h.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{h.date}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHolidays(holidays.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {holidays.length === 0 && (
            <p className="text-sm text-muted-foreground">Los festivos nacionales de España y Castilla y León ya están incluidos por defecto.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
