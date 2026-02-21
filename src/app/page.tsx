"use client";

import { useState, useMemo } from "react";
import { KpiCard } from "@/components/molecules";
import { ManagementAssistant } from "@/components/ManagementAssistant";
import { InventoryTable } from "@/components/InventoryTable";
import { EditStockDialog } from "@/components/EditStockDialog";
import { formatSoles } from "@/lib/format";
import { useInventoryStore } from "@/store/useInventoryStore";
import { InventoryEngine } from "@/lib/inventory-engine";
import { useAuth } from "@/components/providers/AuthProvider";
import { useInventoryMetrics } from "@/hooks/useInventoryMetrics";
import type { InventoryItem } from "@/types";

const iconStock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

const iconAlert = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export default function DashboardPage() {
  const {
    products,
    updateProduct,
    clearNotifications,
    resetSystem,
    readAlertIds,
    ignoredAlerts,
    businessConfig
  } = useInventoryStore();

  const { user } = useAuth();
  const [editProduct, setEditProduct] = useState<InventoryItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "critical">("all");

  // Auditoría técnica: Abstracción de métricas para mantener el Dashboard 'lean'
  const {
    totalStock,
    formattedValue,
    activeAlertsCount
  } = useInventoryMetrics(products, businessConfig, ignoredAlerts, readAlertIds);

  const kpiCollection = [
    {
      id: "stock",
      title: "Stock Operativo",
      value: totalStock.toLocaleString("es-PE"),
      subtitle: "Unidades totales",
      trend: "up" as const,
      trendValue: "Capacidad estable",
      icon: iconStock,
    },
    {
      id: "valor",
      title: "Valor Activo",
      value: formattedValue,
      subtitle: "Balance total",
      trend: "neutral" as const,
      trendValue: "Capital en almacén",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: "alertas",
      title: "Alertas Activas",
      value: String(activeAlertsCount),
      subtitle: "Requerimientos de reorden",
      trend: activeAlertsCount > 0 ? ("up" as const) : ("neutral" as const),
      trendValue: activeAlertsCount > 0 ? `${activeAlertsCount} críticas` : "Sistema al día",
      icon: iconAlert,
    },
  ];

  const handleRowClick = (inventorySnapshot: InventoryItem) => {
    setEditProduct(inventorySnapshot);
    setDialogOpen(true);
  };

  const handleSaveStock = (productId: string, newStockLevel: number) => {
    updateProduct(productId, { stock: newStockLevel });
  };

  const dashboardInventory = useMemo(() => {
    if (filterMode === "critical") {
      return products.filter(p => InventoryEngine.isLowStock(p, businessConfig?.low_threshold));
    }
    return products;
  }, [products, filterMode, businessConfig]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            Plataforma de Control Operativo
          </h2>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {businessConfig?.business_name || user?.user_metadata?.company_name || "SmartStock Pro"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (confirm("¿Confirmar limpieza de notificaciones visuales?")) {
                clearNotifications();
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-all hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
          >
            Sincronizar Panel
          </button>
          <button
            onClick={() => {
              if (confirm("¿RESET MAESTRO? Se borrarán todos los datos operativos.")) {
                resetSystem();
              }
            }}
            title="Reset maestro del sistema"
            className="rounded-lg bg-rose-500/10 p-2 text-rose-600 transition-all hover:bg-rose-500/20 dark:bg-rose-500/10 dark:text-rose-500"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCollection.map((kpi) => (
          <div
            key={kpi.id}
            onClick={kpi.id === "alertas" ? () => setFilterMode(prev => prev === "critical" ? "all" : "critical") : undefined}
            className={kpi.id === "alertas" ? "group cursor-pointer" : ""}
          >
            <KpiCard
              {...kpi}
              className={`${kpi.id === "alertas" && filterMode === "critical" ? "ring-2 ring-emerald-600/50" : ""} transition-all duration-300`}
            />
          </div>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Resumen de Inventario {filterMode === "critical" && <span className="text-emerald-600 dark:text-emerald-500 normal-case ml-2">(Filtro de Alertas Activo)</span>}
              </h2>
              {filterMode !== "all" && (
                <button
                  onClick={() => setFilterMode("all")}
                  className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  Restaurar Vista Principal
                </button>
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-card p-0 overflow-hidden shadow-sm">
              <InventoryTable
                products={dashboardInventory}
                onRowClick={handleRowClick}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section>
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
              Asistente Operativo
            </h2>
            <ManagementAssistant products={products} />
          </section>
        </aside>
      </div>

      <EditStockDialog
        product={editProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveStock}
      />
    </div>
  );
}
