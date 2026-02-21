"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatSoles } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventoryStore } from "@/store/useInventoryStore";
import type { InventoryItem } from "@/types";
import { InventoryEngine } from "@/lib/inventory-engine";

type InventoryTableProps = {
  products?: InventoryItem[];
  showSearch?: boolean;
  onEdit?: (item: InventoryItem) => void;
  onRowClick?: (item: InventoryItem) => void;
  isManagementMode?: boolean;
};

export function InventoryTable({
  products: overrideProducts,
  showSearch = true,
  onEdit,
  onRowClick,
  isManagementMode = false,
}: InventoryTableProps) {
  const store = useInventoryStore();
  const products = overrideProducts || store.products;
  const { deleteProduct, businessConfig } = store;

  // Configuración de umbrales para el motor
  const engineConfig = {
    critical: businessConfig?.critical_threshold,
    low: businessConfig?.low_threshold
  };

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <div className="space-y-6">
      {showSearch && (
        <Input
          type="search"
          placeholder="Buscar producto por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5"
          aria-label="Buscar productos"
        />
      )}
      <div className="rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden">
        <Table role="grid" aria-label="Tabla de Inventario Maestro">
          <caption className="sr-only">Lista de productos con niveles de stock y sugerencias de reposición</caption>
          <TableHeader className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
            <TableRow>
              <TableHead className="font-bold py-4">Producto</TableHead>
              <TableHead className="font-bold">Categoría</TableHead>
              <TableHead className="text-right font-bold">Stock</TableHead>
              <TableHead className="text-right font-bold">Precio</TableHead>
              <TableHead className="font-bold">Estado</TableHead>
              {isManagementMode && <TableHead className="text-right font-bold">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManagementMode ? 6 : 5} className="h-40 text-center text-muted-foreground italic">
                  No se encontraron productos en el inventario.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const status = InventoryEngine.getStatusConfig(item, engineConfig);
                const isCritical = InventoryEngine.isCritical(item, engineConfig.critical);
                const isLow = InventoryEngine.isLowStock(item, engineConfig.low);

                return (
                  <TableRow
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "transition-colors",
                      onRowClick ? "cursor-pointer" : undefined,
                      isCritical && "bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/[0.02] dark:hover:bg-rose-500/[0.05]"
                    )}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                        {isCritical && (
                          <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse shadow-sm shadow-rose-900/20" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 font-medium">{item.category}</TableCell>
                    <TableCell className={cn(
                      "text-right font-mono font-bold",
                      isCritical ? "text-rose-600 dark:text-rose-500" : isLow ? "text-amber-600 dark:text-amber-500" : "text-zinc-700 dark:text-zinc-300"
                    )}>
                      {item.stock}
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-600 dark:text-zinc-400">
                      {formatSoles(item.price, businessConfig?.currency_symbol)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={status.variant}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          status.variant === "outline" ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/5" : undefined,
                          status.variant === "destructive" ? "bg-rose-600 text-white border-transparent" : undefined
                        )}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    {isManagementMode && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onEdit?.(item)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4 text-zinc-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct(item.id)}
                            className="h-8 w-8 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
