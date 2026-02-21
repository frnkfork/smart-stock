"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  History,
  Filter,
  Trash2,
  Archive,
  ArrowRightLeft,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useInventoryStore } from "@/store/useInventoryStore";
import { notificarAlerta } from "@/lib/voice-alerts";
import { InventoryEngine } from "@/lib/inventory-engine";
import { cn } from "@/lib/utils";
import type { StockEvent } from "@/types";

export default function AlertasPage() {
  const { events, products, archiveHistory, clearHistory } = useInventoryStore();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  useEffect(() => {
    const pendingCount = events.filter((e: StockEvent) => e.severity === "critical" && !e.isArchived).length;
    if (pendingCount > 0) {
      notificarAlerta(`Reporte de auditoría: Se han detectado ${pendingCount} incidentes críticos pendientes de revisión.`);
    } else {
      notificarAlerta("Registro de auditoría actualizado. Sin incidencias críticas pendientes.");
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, { name: string, count: number }> = {};
    let resolved = 0;
    let ignored = 0;

    events.forEach(e => {
      if (!e.isArchived) {
        counts[e.productId] = {
          name: e.productName,
          count: (counts[e.productId]?.count || 0) + 1
        };
        if (e.action === "order_generated") resolved++;
        if (e.action === "ignored") ignored++;
      }
    });

    const mostProblematic = Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)[0];

    const totalActions = resolved + ignored;
    const resolutionRate = totalActions > 0 ? (resolved / totalActions) * 100 : 0;

    return {
      mostProblematic: mostProblematic ? mostProblematic[1] : null,
      resolutionRate,
      resolved,
      ignored
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.productName.toLowerCase().includes(search.toLowerCase()) ||
        e.message.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "all" || e.severity === severityFilter;
      const matchesArchived = showArchived ? true : !e.isArchived;

      const product = products.find(p => p.id === e.productId);
      const matchesCategory = categoryFilter === "all" || (product && product.category === categoryFilter);

      return matchesSearch && matchesSeverity && matchesArchived && matchesCategory;
    });
  }, [events, search, severityFilter, showArchived, categoryFilter, products]);

  const handleArchive = () => {
    if (confirm("¿Confirmar archivado de registros operativos?")) {
      archiveHistory();
      notificarAlerta("Registros archivados correctamente.");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-rose-600 text-white border-none font-bold uppercase text-[9px] px-2 py-0">Crítico</Badge>;
      case "preventive": return <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-500 font-bold uppercase text-[9px] px-2 py-0">Preventivo</Badge>;
      default: return <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/5 text-zinc-500 font-bold uppercase text-[9px] px-2 py-0">Informativo</Badge>;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            Registro y Auditoría
          </h2>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Auditoría Operativa</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)} className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider border-zinc-200 dark:border-white/10 dark:bg-white/5">
            {showArchived ? "Ocultar Archivados" : "Ver Archivados"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleArchive} className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 gap-2">
            <Archive className="size-3" />
            Archivar registros
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("¿Confirmar eliminación permanente del historial?")) clearHistory(); }} className="h-9 w-9 p-0 text-rose-600 hover:bg-rose-500/10">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-zinc-200 dark:border-white/5 shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Incidencia Recurrente</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats.mostProblematic ? (
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2.5">
                  <AlertTriangle className="size-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{stats.mostProblematic.name}</p>
                  <p className="text-[10px] items-center gap-1 flex font-bold uppercase text-rose-600/80">
                    <span className="inline-block p-1 bg-rose-500/10 rounded mr-1">
                      {stats.mostProblematic.count} reportes
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">Sin incidencias registradas</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-white/5 shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Tasa de Resolución</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50">{stats.resolutionRate.toFixed(1)}%</p>
                <div className="flex gap-2">
                  <div className="bg-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-600 uppercase">{stats.resolved} resueltos</div>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/5">
                <div
                  className="h-full bg-emerald-600 transition-all duration-1000 shadow-[0_0_8px_rgba(5,150,105,0.4)]"
                  style={{ width: `${stats.resolutionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 dark:border-white/5 shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-2 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Criticalidad Activa</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-amber-500/10 p-2.5">
                <Bell className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">{filteredEvents.filter(e => e.severity === "critical").length}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60">Incidentes pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-zinc-200 dark:border-white/5 shadow-sm bg-card">
        <CardHeader className="bg-zinc-50/5 pb-6 border-b border-zinc-100 dark:border-white/5">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-zinc-900 dark:bg-white/10 flex items-center justify-center text-white">
                <History className="size-4" />
              </div>
              <div>
                <CardTitle className="text-zinc-900 dark:text-zinc-50 tracking-tight">Log Operativo</CardTitle>
                <CardDescription className="text-xs font-medium dark:text-zinc-400">Trazabilidad completa de acciones del Motor de Análisis PRO.</CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 size-4 text-muted-foreground/50" />
                <Input
                  placeholder="Buscar producto..."
                  className="h-9 w-[220px] pl-9 text-[11px] bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/5 focus:border-emerald-600 transition-all font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-bold text-zinc-600 outline-none hover:bg-zinc-100 dark:border-white/5 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
              >
                <option value="all">Categorías</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-bold text-zinc-600 outline-none hover:bg-zinc-100 dark:border-white/5 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-all"
              >
                <option value="all">Prioridad</option>
                <option value="critical">Crítico</option>
                <option value="preventive">Preventivo</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 border-b border-zinc-100 dark:border-white/5">
                  <TableHead className="w-[140px] px-6 text-[10px] font-bold uppercase tracking-widest py-4">Sincronización</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Producto</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Procedimiento</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Nivel Stock</TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest">Estado</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest px-6">Detalles del Reporte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-zinc-400 text-xs italic">
                      Registro de auditoría vacío.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className={cn(
                      "group border-b border-zinc-100 dark:border-white/5 transition-colors",
                      event.isArchived ? "opacity-30 grayscale" : "hover:bg-zinc-50/30 dark:hover:bg-white/[0.02]"
                    )}>
                      <TableCell className="px-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-bold text-zinc-900 dark:text-zinc-50">
                            {(() => {
                              const d = new Date(event.timestamp);
                              return isNaN(d.getTime())
                                ? "--:--"
                                : d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            })()}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {(() => {
                              const d = new Date(event.timestamp);
                              return isNaN(d.getTime())
                                ? "---"
                                : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).toUpperCase();
                            })()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-zinc-900 dark:text-white text-xs tracking-tight">
                        {event.productName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                            <ArrowRightLeft className="size-2.5 text-zinc-400" />
                          </div>
                          <span className="text-[9px] font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider">
                            {event.action.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-mono font-black text-xs",
                          event.severity === "critical" ? "text-rose-600" : "text-zinc-700 dark:text-zinc-300"
                        )}>
                          {event.stockLevel}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getSeverityBadge(event.severity)}
                      </TableCell>
                      <TableCell className="px-6">
                        <p className="max-w-[200px] truncate text-[11px] font-medium text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {event.message}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
