import { supabase } from "../lib/supabaseClient";
import type { InventoryItem, StockEvent, BusinessProfile } from "@/types";

const STORAGE_KEYS = {
    INVENTORY: "carmencita-inventory",
    HISTORIAL_EVENTOS: "smartstock_historial_eventos",
};

/**
 * Data Access Layer (SaaS Architecture)
 * 
 * Esta capa implementa una estrategia de persistencia híbrida (Cloud + Local Fallback).
 * La abstracción permite que la UI consuma datos sin preocuparse por la latencia 
 * o el estado de la conexión con Supabase.
 * 
 * @design_decision Se utiliza un patrón similar a Repository para desacoplar 
 * el motor de base de datos de la lógica de componentes, facilitando futuras 
 * migraciones o integraciones con otros backends.
 */
export const storageService = {

    /**
     * Recupera el dataset de inventario.
     * Prioriza Supabase para asegurar la integridad multi-usuario (SaaS mode).
     */
    getInventory: async (userId?: string): Promise<InventoryItem[]> => {
        if (userId) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('user_id', userId)
                    .order('name', { ascending: true });

                if (error) throw error;
                return (data || []) as InventoryItem[];
            } catch (error) {
                // El error se captura silenciosamente para el usuario, 
                // permitiendo que el fallback local mantenga la app operativa.
                console.error("[StorageService] Cloud Fetch Failure:", error);
            }
        }

        if (typeof window === "undefined") return [];
        const localData = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        return localData ? JSON.parse(localData) : [];
    },

    /**
     * Persiste cambios en un producto.
     * Implementa escritura dual para garantizar disponibilidad offline inmediata.
     */
    saveProduct: async (userId: string | undefined, product: InventoryItem) => {
        if (userId) {
            try {
                const { error } = await supabase
                    .from('products')
                    .upsert({ ...product, user_id: userId });
                if (error) throw error;
            } catch (error) {
                console.error("[StorageService] Cloud Sync Failure:", error);
                // @debt: Considerar una cola de sincronización (background sync) 
                // para reintentar operaciones fallidas cuando vuelva la conexión.
            }
        }

        const current = await storageService.getSyncInventory();
        const updated = current.map(p => p.id === product.id ? product : p);
        if (!current.find(p => p.id === product.id)) updated.push(product);
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updated));
    },

    /**
     * Elimina registros respetando la seguridad de fila (RLS).
     */
    deleteProduct: async (userId: string | undefined, productId: string) => {
        if (userId) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', productId)
                    .eq('user_id', userId);
                if (error) throw error;
            } catch (error) {
                console.error("[StorageService] Cloud Delete Failure:", error);
            }
        }
        const current = await storageService.getSyncInventory();
        const filtered = current.filter(p => p.id !== productId);
        localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(filtered));
    },

    /**
     * Audit Log Persistence.
     * Los eventos se limitan a 100 registros en local por performance del storage.
     */
    saveEvent: async (userId: string | undefined, event: StockEvent) => {
        if (userId) {
            try {
                const { error } = await supabase
                    .from('audit_log')
                    .insert({
                        user_id: userId,
                        product_id: event.productId,
                        product_name: event.productName,
                        action: event.action,
                        severity: event.severity,
                        message: event.message,
                        stock_level: event.stockLevel,
                        is_archived: event.isArchived ?? false
                    });
                if (error) throw error;
            } catch (error) {
                console.error("[StorageService] Event Audit Sync Failure:", error);
            }
        }

        const localEvents = storageService.getSyncEvents();
        const updated = [event, ...localEvents].slice(0, 100);
        localStorage.setItem(STORAGE_KEYS.HISTORIAL_EVENTOS, JSON.stringify(updated));
    },

    /**
     * Recupera el historial de auditoría Cloud.
     */
    getEvents: async (userId: string): Promise<StockEvent[]> => {
        try {
            const { data, error } = await supabase
                .from('audit_log')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            return (data || []).map(row => ({
                id: row.id,
                timestamp: new Date(row.created_at).getTime(),
                productId: row.product_id,
                productName: row.product_name,
                stockLevel: row.stock_level,
                action: row.action,
                severity: row.severity,
                message: row.message,
                isArchived: row.is_archived
            }));
        } catch (error) {
            console.error("[StorageService] Event Recovery Failure:", error);
            return [];
        }
    },

    // Métodos síncronos para acceso inmediato durante el arranque o en fallbacks.
    getSyncInventory: (): InventoryItem[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        return data ? JSON.parse(data) : [];
    },

    getSyncEvents: (): StockEvent[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEYS.HISTORIAL_EVENTOS);
        return data ? JSON.parse(data) : [];
    },

    clearAll: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEYS.INVENTORY);
        localStorage.removeItem(STORAGE_KEYS.HISTORIAL_EVENTOS);
    },

    // --- MÉTODOS DE PERFIL DE NEGOCIO ---

    /**
     * Obtiene la configuración de la empresa desde Supabase.
     */
    getBusinessProfile: async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('business_profile')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No hay filas
            return data as BusinessProfile | null;
        } catch (error) {
            console.error("[StorageService] Business Profile Load Failure:", error);
            return null;
        }
    },

    /**
     * Guarda o actualiza la configuración de la empresa.
     */
    saveBusinessProfile: async (userId: string, profile: Partial<BusinessProfile>) => {
        try {
            const { error } = await supabase
                .from('business_profile')
                .upsert({ ...profile, user_id: userId });
            if (error) throw error;
        } catch (error) {
            console.error("[StorageService] Business Profile Sync Failure:", error);
            throw error;
        }
    }
};
