import { useMemo, useEffect } from "react";
import { Lightbulb, Zap, ShoppingCart, Clock, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInventoryStore } from "@/store/useInventoryStore";
import { notificarAlerta } from "@/lib/voice-alerts";
import { InventoryEngine } from "@/lib/inventory-engine";
import { useAuth } from "@/components/providers/AuthProvider";
import type { InventoryItem } from "@/types";

type AlertSeverity = "critical" | "preventive" | "excess";

type ManagementAlert = {
  id: string;
  severity: AlertSeverity;
  productId: string;
  productName: string;
  stock: number;
  message: string;
  actionRequired: number;
};

export function ManagementAssistant({ products }: { products: InventoryItem[] }) {
  const { ignoredAlerts, ignoreAlert, addStock, readAlertIds } = useInventoryStore();
  const { user } = useAuth();

  const companyName = user?.user_metadata?.company_name || "SmartStock Pro";

  const alerts = useMemo(() => {
    const now = Date.now();
    const result: ManagementAlert[] = [];

    for (const p of products) {
      if (ignoredAlerts[p.id] && now < ignoredAlerts[p.id]) continue;
      if (readAlertIds.includes(p.id)) continue;

      if (InventoryEngine.isCritical(p)) {
        result.push({
          id: `critica-${p.id}`,
          severity: "critical",
          productId: p.id,
          productName: p.name,
          stock: p.stock,
          message: `Reposición Inmediata: Nivel crítico en ${p.name}`,
          actionRequired: InventoryEngine.getRestockSuggestion(p),
        });
      }
      else if (InventoryEngine.isLowStock(p)) {
        result.push({
          id: `preventiva-${p.id}`,
          severity: "preventive",
          productId: p.id,
          productName: p.name,
          stock: p.stock,
          message: `${p.name} requiere atención operativa`,
          actionRequired: InventoryEngine.getRestockSuggestion(p),
        });
      }
      else if (InventoryEngine.isExcess(p)) {
        result.push({
          id: `exceso-${p.id}`,
          severity: "excess",
          productId: p.id,
          productName: p.name,
          stock: p.stock,
          message: `Excedente detectado: Baja rotación en ${p.name}`,
          actionRequired: 0,
        });
      }
    }
    return result;
  }, [products, ignoredAlerts, readAlertIds]);

  // Baseline de sesión: Al cargar, guardamos los que YA están críticos para no leerlos como "nuevos"
  const voicedAlerts = useMemo(() => {
    const initialCriticals = products
      .filter(p => InventoryEngine.isCritical(p))
      .map(p => p.id);
    return new Set<string>(initialCriticals);
  }, []); // Solo se ejecuta una vez al montar el componente

  useEffect(() => {
    const critical = alerts.find(a => a.severity === "critical");

    if (critical && !voicedAlerts.has(critical.id)) {
      notificarAlerta(`Incidencia en tiempo real: Nivel crítico detectado en ${critical.productName}. Se requiere atención inmediata.`);
      voicedAlerts.add(critical.id);
    }

    // Permitir que vuelvan a sonar si dejan de ser críticos y luego recaen
    const currentCriticalIds = new Set(alerts.filter(a => a.severity === "critical").map(a => a.id));
    voicedAlerts.forEach(id => {
      if (!currentCriticalIds.has(id)) {
        voicedAlerts.delete(id);
      }
    });
  }, [alerts, companyName, voicedAlerts]);

  return (
    <Card className="overflow-hidden border border-zinc-200 dark:border-white/5 shadow-sm bg-card">
      <CardHeader className="bg-zinc-50/50 pb-3 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-emerald-600 dark:text-emerald-500" />
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Motor de Análisis</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-emerald-600/10 text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-2 py-0.5 dark:bg-emerald-500/10 dark:text-emerald-500 border-none">
            SmartStock PRO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Sin acciones pendientes
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex flex-col gap-3 rounded-lg border p-4 text-sm transition-all ${alert.severity === "critical"
                ? "border-rose-200 bg-rose-50/30 dark:border-rose-900/20 dark:bg-rose-900/10"
                : alert.severity === "preventive"
                  ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/20 dark:bg-amber-900/10"
                  : "border-zinc-200 bg-zinc-50/30 dark:border-white/5 dark:bg-zinc-900/20"
                }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${alert.severity === "critical" ? "text-rose-600" : "text-amber-500"
                  }`}>
                  {alert.severity === "critical" ? <Zap className="size-4" /> : <Lightbulb className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={alert.severity === "critical" ? "destructive" : "secondary"}
                      className={`text-[9px] uppercase font-bold tracking-tight px-1.5 py-0 ${alert.severity === "critical" ? "bg-rose-600" : "bg-zinc-200 dark:bg-white/10"}`}
                    >
                      {alert.severity === "critical" ? "Prioridad Alta" : alert.severity === "preventive" ? "Preventivo" : "Estadístico"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Stock Actual: {alert.stock}</span>
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">{alert.message}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {alert.actionRequired > 0 && (
                  <Button
                    size="sm"
                    className="h-7 bg-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 px-3"
                    onClick={() => addStock(alert.productId, alert.actionRequired, true)}
                  >
                    <ShoppingCart className="mr-2 size-3" />
                    Generar Pedido (+{alert.actionRequired})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] font-bold uppercase tracking-wider border-zinc-200 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5 px-3"
                  onClick={() => ignoreAlert(alert.productId)}
                >
                  <Clock className="mr-2 size-3" />
                  Pausar 24h
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
