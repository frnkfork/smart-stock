import { InventoryItem, StockEvent } from "@/types";

/**
 * Engine Operativo de Logística (Singleton)
 * 
 * Centraliza la inteligencia distribuida para garantizar la coherencia en la toma 
 * de decisiones en todos los niveles de la plataforma.
 * 
 * @design_logic Se implementa como un objeto de funciones puras para garantizar 
 * la predictibilidad del cómputo y facilitar el 'unit testing' de las alertas.
 */
export const InventoryEngine = {

    /**
     * Identificamos productos en estado de quiebre inminente.
     * @param threshold Porcentaje del stock mínimo (default 0.4 / 40%)
     */
    isCritical: (product: InventoryItem, threshold: number = 0.4): boolean => {
        const minStock = product.minStock || 20;
        return product.stock < minStock * threshold;
    },

    /**
     * Regla estándar de reabastecimiento.
     * @param threshold Multiplicador del stock mínimo (default 1.0 / 100%)
     */
    isLowStock: (product: InventoryItem, threshold: number = 1.0): boolean => {
        const minStock = product.minStock || 20;
        return product.stock <= minStock * threshold;
    },

    /**
     * Valuación de Activos Inmovilizados.
     */
    calculateTotalValue: (products: InventoryItem[]): number => {
        return products.reduce((acc, p) => acc + (p.stock * p.price), 0);
    },

    /**
     * Métrica de Volumen Operativo.
     */
    calculateTotalStock: (products: InventoryItem[]): number => {
        return products.reduce((acc, p) => acc + p.stock, 0);
    },

    /**
     * Algoritmo de Reposición Óptima.
     * @business_logic El objetivo es alcanzar el 'Target Stock' sin exceder 
     * la capacidad de almacenamiento pactada.
     */
    getRestockSuggestion: (product: InventoryItem): number => {
        return Math.max(0, product.targetStock - product.stock);
    },

    /**
     * Proyección de Inversión.
     * @business_logic Proporciona una estimación de flujo de caja necesaria 
     * para la ejecución de la Orden de Compra.
     */
    getEstimatedInvestment: (product: InventoryItem): number => {
        const suggestion = InventoryEngine.getRestockSuggestion(product);
        return suggestion * product.price;
    },

    /**
     * Detección de Capital Inmovilizado.
     * @business_logic El exceso del 150% indica un sobre-stock que drena 
     * liquidez. Se activa la advertencia de 'Exceso'.
     */
    isExcess: (product: InventoryItem): boolean => {
        const targetStock = product.targetStock || 100;
        return product.stock > targetStock * 1.5;
    },

    /**
     * Mapeo de Estados para UI.
     */
    getStatusConfig: (product: InventoryItem, config?: { critical?: number; low?: number }) => {
        if (InventoryEngine.isCritical(product, config?.critical)) {
            return { variant: "destructive" as const, label: "Crítico" };
        }
        if (InventoryEngine.isLowStock(product, config?.low)) {
            return { variant: "outline" as const, label: "Reordenar" };
        }
        return { variant: "secondary" as const, label: "Normal" };
    }
};
