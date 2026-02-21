"use client";

import { useMemo } from "react";
import { InventoryEngine } from "@/lib/inventory-engine";
import { formatSoles } from "@/lib/format";
import type { InventoryItem, BusinessProfile } from "@/types";

/**
 * useInventoryMetrics
 * 
 * Abstrae la lógica de agregación y cálculo de KPIs para el Dashboard.
 * Sigue el principio de separación de preocupaciones al delegar el cómputo 
 * pesado de métricas a un hook reactivo.
 */
export function useInventoryMetrics(
    products: InventoryItem[],
    businessConfig: BusinessProfile | null,
    ignoredAlerts: Record<string, number>,
    readAlertIds: string[]
) {
    const totalStock = useMemo(() =>
        InventoryEngine.calculateTotalStock(products),
        [products]);

    const totalInventoryValue = useMemo(() =>
        InventoryEngine.calculateTotalValue(products),
        [products]);

    const activeAlertsCount = useMemo(() => {
        const now = Date.now();
        return products.filter(p => {
            const isLow = InventoryEngine.isLowStock(p, businessConfig?.low_threshold);
            const isIgnored = ignoredAlerts[p.id] && now < ignoredAlerts[p.id];
            const isRead = readAlertIds.includes(p.id);
            return isLow && !isIgnored && !isRead;
        }).length;
    }, [products, ignoredAlerts, readAlertIds, businessConfig]);

    const formattedValue = useMemo(() =>
        formatSoles(totalInventoryValue, businessConfig?.currency_symbol),
        [totalInventoryValue, businessConfig?.currency_symbol]);

    return {
        totalStock,
        totalInventoryValue,
        formattedValue,
        activeAlertsCount,
    };
}
