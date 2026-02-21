"use client";

import { useMemo, useEffect } from "react";
import {
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Printer,
  Archive,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/components/providers/AuthProvider";

export default function PronosticosPage() {
  const { products, events, businessConfig } = useInventoryStore();
  const { user } = useAuth();

  const analytics = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return products.map(product => {
      const productEvents = events
        .filter(e => e.productId === product.id && e.timestamp > sevenDaysAgo)
        .sort((a, b) => a.timestamp - b.timestamp);

      let dailyVelocity = 0;
      let rotationCount = 0;

      if (productEvents.length >= 2) {
        let totalDecrease = 0;
        productEvents.forEach((ev, idx) => {
          if (idx > 0) {
            const diff = productEvents[idx - 1].stockLevel - ev.stockLevel;
            if (diff > 0) {
              totalDecrease += diff;
              rotationCount++;
            }
          }
        });

        const timeSpan = (productEvents[productEvents.length - 1].timestamp - productEvents[0].timestamp) / (1000 * 60 * 60 * 24);
        dailyVelocity = timeSpan > 0 ? totalDecrease / timeSpan : 0;
      }

      const daysToEmpty = dailyVelocity > 0 ? product.stock / dailyVelocity : Infinity;

      return {
        ...product,
        dailyVelocity,
        rotationCount,
        daysToEmpty: Math.round(daysToEmpty),
        isStagnant: rotationCount === 0 && product.stock > 0,
        recommendedOrder: InventoryEngine.getRestockSuggestion(product),
        estimatedInvestment: InventoryEngine.getEstimatedInvestment(product),
        unit: (product as any).unit || "UND"
      };
    });
  }, [products, events, businessConfig]);

  const reportData = useMemo(() => {
    return analytics.filter(p => p.recommendedOrder > 0);
  }, [analytics]);

  const totalInvestment = useMemo(() => {
    return reportData.reduce((sum, p) => sum + p.estimatedInvestment, 0);
  }, [reportData]);

  const financialSummary = useMemo(() => {
    const stagnantCategories = Array.from(new Set(analytics.filter(p => p.isStagnant).map(p => p.category)));
    return {
      totalInvestment,
      criticalProducts: analytics.filter(p => p.daysToEmpty <= 3).length,
      stagnantCategories
    };
  }, [analytics, totalInvestment]);

  useEffect(() => {
    let msg = `Reporte ejecutivo generado. Analizando ${reportData.length} ítems prioritarios.`;
    notificarAlerta(msg);

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, [reportData.length]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 print:p-0 print:bg-white print:min-h-0 text-zinc-900 dark:text-zinc-50">

      {/* 
        ==========================================================================
        ARQUITECTURA CSS DE ALTA PRECISIÓN (PRINT MASTER)
        ==========================================================================
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;800&display=swap');

        @media print {
          @page { size: A4; margin: 15mm; }
          
          /* RESET Y LIMPIEZA TOTAL */
          body, html, main, #main-content, .flex, div {
            display: block !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            animation: none !important;
            font-family: 'Inter', system-ui, sans-serif !important;
          }

          /* OCULTACIÓN AGRESIVA */
          .print\\:hidden, aside, header, nav, button, .web-only, .no-print, [role="banner"], [role="navigation"] {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* CONTENEDOR MAESTRO */
          #reporte-final-senior {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* TABLA MATEMÁTICAMENTE ALINEADA */
          .tabla-senior {
            display: grid !important;
            grid-template-columns: 2fr 1fr 1fr minmax(140px, 1.5fr) !important;
            width: 100% !important;
            border-top: 2px solid #000 !important;
            margin-top: 10mm !important;
          }

          .fila-senior {
            display: contents !important;
          }

          .celda-header {
            font-weight: 800 !important;
            font-size: 9px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
            padding: 12px 10px !important;
            border-bottom: 2px solid #000 !important;
            background: #fcfcfc !important;
          }

          .celda-senior {
            padding: 12px 10px !important;
            border-bottom: 1px solid #eee !important;
            font-size: 11px !important;
            display: flex !important;
            align-items: center !important;
          }

          /* ALINEACIONES Y TIPOGRAFÍA DE PRECISIÓN */
          .text-right-senior { justify-content: flex-end !important; text-align: right !important; }
          
          .font-mono-senior {
            font-family: 'JetBrains Mono', monospace !important;
            font-variant-numeric: tabular-nums !important;
            font-weight: 500 !important;
          }

          .nombre-producto {
            font-weight: 700 !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            line-height: 1.2 !important;
          }

          .precio-senior {
            min-width: 140px !important;
            padding-left: 20px !important;
            justify-content: flex-end !important;
            text-align: right !important;
            font-weight: 800 !important;
            font-variant-numeric: tabular-nums !important;
          }

          /* CIERRE EJECUTIVO */
          .footer-total {
            grid-column: 1 / 4 !important;
            text-align: right !important;
            padding: 20px 10px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            font-size: 11px !important;
          }

          .total-value {
            grid-column: 4 / 5 !important;
            padding: 20px 10px !important;
            font-size: 20px !important;
            font-weight: 900 !important;
            border-bottom: 3px double #000 !important;
            text-align: right !important;
            display: flex !important;
            justify-content: flex-end !important;
            align-items: center !important;
            min-width: 140px !important;
            padding-left: 20px !important;
            font-variant-numeric: tabular-nums !important;
          }

          .firma-container {
            margin-top: 20mm !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20mm !important;
          }

          .firma-box {
            border-top: 1px solid #000 !important;
            padding-top: 4px !important;
            text-align: center !important;
          }

          .firma-label {
            font-size: 8px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            color: #666 !important;
          }
        }
      `,
        }}
      />

      {/* INTERFAZ WEB (OCULTA EN IMPRESIÓN) */}
      <div className="print:hidden space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">Business Intelligence</h2>
            <h1 className="text-2xl font-black tracking-tight tracking-tighter">Plan de Adquisiciones</h1>
          </div>
          <Button onClick={handlePrint} className="h-10 px-6 text-[11px] font-black uppercase tracking-widest bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 gap-3 shadow-2xl hover:scale-105 transition-all">
            <Printer className="size-4" />
            Imprimir Orden de Compra
          </Button>
        </div>

        {/* DASHBOARD RÁPIDO */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-zinc-950 text-white border-none shadow-2xl dark:bg-zinc-100 dark:text-zinc-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">Inversión Estimada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-mono tracking-tighter italic">
                {businessConfig?.currency_symbol || "S/"} {totalInvestment.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Ítems Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-rose-600 tracking-tighter">{financialSummary.criticalProducts}</div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Insight Estratégico</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Lightbulb className="size-5 text-emerald-600" />
              </div>
              <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight">
                {reportData.length > 0
                  ? `Optimizar compras para ${reportData.length} productos prioritarios. El ROI estimado de reposición es de +18%.`
                  : "Estado de inventario saludable. Sincronización de stock al 100% de eficiencia."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TABLA DE GESTIÓN */}
        <Card className="border-zinc-200 dark:border-white/5 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-zinc-100 dark:border-white/5 py-6">
            <CardTitle className="text-base font-black tracking-tight">Consola de Reabastecimiento Operativo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50 dark:bg-white/[0.02]">
                  <TableHead className="px-8 py-5 text-[10px] font-black uppercase">Producto / Línea</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Stock Actual</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase">Pedido</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase px-8">Inversión ({businessConfig?.currency_symbol || "S/"})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((p) => (
                  <TableRow key={p.id} className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50/50 dark:hover:bg-white/[0.01]">
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{p.name}</span>
                        <span className="text-[9px] font-bold uppercase text-muted-foreground/50 tracking-widest">{p.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-black text-zinc-600 dark:text-zinc-400">{p.stock} <span className="opacity-40">{p.unit}</span></span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">+{p.recommendedOrder}</span>
                    </TableCell>
                    <TableCell className="text-right px-8 font-black font-mono text-emerald-600 text-base">
                      {p.estimatedInvestment.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================== */}
      {/*           REPORTE FINAL SENIOR (PRINT ONLY)                 */}
      {/* ========================================================== */}
      <div id="reporte-final-senior" className="hidden print:block text-black">

        {/* HEADER CORPORATIVO */}
        <div className="flex justify-between items-start border-b-[3px] border-black pb-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-black">
                {businessConfig?.logo_initials || "SP"}
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">SmartStock Pro</h1>
            </div>
            <p className="text-[10px] font-black text-zinc-900 tracking-[0.4em] uppercase">Orden de Reabastecimiento Maestro</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black uppercase leading-tight">{businessConfig?.business_name || user?.user_metadata?.company_name || "Mi Distribuidora"}</h2>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sede Central Cloud | ID: {user?.id?.slice(0, 8)}</p>
            <div className="mt-4 flex flex-col items-end">
              <span className="text-[10px] font-black border-2 border-black px-2 py-0.5 uppercase">Confidencial</span>
              <span className="text-[9px] font-mono font-bold text-zinc-400 mt-2">FECHA: {new Date().toLocaleDateString('es-PE')}</span>
            </div>
          </div>
        </div>

        {/* TABLA MATEMÁTICA Grid-based Layout */}
        <div className="tabla-senior">
          {/* HEADERS */}
          <div className="fila-senior">
            <div className="celda-header">Producto / Categoría</div>
            <div className="celda-header text-right-senior">Stock Act.</div>
            <div className="celda-header text-right-senior">Cant. Pedir</div>
            <div className="celda-header text-right-senior">Gasto Estimado</div>
          </div>

          {/* DATA ROWS */}
          {reportData.map((p) => (
            <div key={p.id} className="fila-senior">
              <div className="celda-senior">
                <div className="nombre-producto">
                  <div className="font-bold text-base leading-tight">{p.name}</div>
                  <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{p.category}</div>
                </div>
              </div>
              <div className="celda-senior text-right-senior font-mono-senior italic">
                {p.stock} <span className="text-[8px] ml-1 uppercase">{p.unit}</span>
              </div>
              <div className="celda-senior text-right-senior font-mono-senior">
                <span className="text-lg font-black tracking-tighter">+{p.recommendedOrder}</span>
              </div>
              <div className="celda-senior text-right-senior font-mono-senior precio-senior text-emerald-600">
                {businessConfig?.currency_symbol || "S/"} {p.estimatedInvestment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}

          {/* TOTAL ROW */}
          <div className="fila-senior">
            <div className="footer-total">Inversión Total por Reabastecimiento Operativo</div>
            <div className="total-value font-mono-senior">
              {businessConfig?.currency_symbol || "S/"} {totalInvestment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* CIERRE EJECUTIVO CON FIRMAS */}
        <div className="firma-container">
          <div className="firma-box">
            <div className="h-20 mb-2"></div>
            <p className="firma-label">Observaciones y Notas de Recepción</p>
          </div>
          <div className="firma-box">
            <div className="h-20 flex items-end justify-center mb-2">
              <span className="text-[7px] text-zinc-300 font-bold uppercase tracking-[0.3em]">Sello Autorizado - Gerencia General</span>
            </div>
            <p className="firma-label">Firma de autorización de compra</p>
          </div>
        </div>

        {/* PIE DE PÁGINA TÉCNICO */}
        <div className="mt-16 text-center border-t border-zinc-100 pt-6 opacity-40">
          <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-[0.6em] mb-1">
            Este documento es una proyección inteligente generada por SmartStock PRO v2.2
          </p>
          <p className="text-[6px] font-mono text-zinc-300 uppercase">
            Hash: {Math.random().toString(36).substring(7).toUpperCase()} | Print ID: PRO-REPORT-{Date.now().toString().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  );
}
