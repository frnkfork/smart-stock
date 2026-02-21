import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InventoryItem, StockEvent, StockEventAction, BusinessProfile } from "@/types";
import { DEMO_INVENTORY_DATA } from "@/lib/demo-inventory-data";
import { storageService } from "@/services/storageService";

interface InventoryState {
    products: InventoryItem[];
    ignoredAlerts: Record<string, number>;
    readAlertIds: string[];
    events: StockEvent[];
    userId: string | null;
    businessConfig: BusinessProfile | null;

    // Acciones de Usuario y Sesión
    setSession: (userId: string | null) => void;
    syncFromCloud: () => Promise<void>;
    updateBusinessConfig: (updates: Partial<BusinessProfile>) => Promise<void>;

    addProduct: (product: Omit<InventoryItem, "id">) => Promise<void>;
    updateProduct: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    // Acciones de Alertas y Operaciones
    addStock: (id: string, amount: number, isOrder?: boolean) => Promise<void>;
    ignoreAlert: (id: string) => void;
    markAlertAsRead: (id: string) => void;
    clearNotifications: () => void;

    // Auditoría SaaS
    logEvent: (productId: string, action: StockEventAction, message: string, stockLevel?: number) => Promise<void>;
    archiveHistory: () => void;
    clearHistory: () => void;

    // Sistema
    resetSystem: () => void;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            products: DEMO_INVENTORY_DATA,
            ignoredAlerts: {},
            readAlertIds: [],
            events: [],
            userId: null,
            businessConfig: {
                user_id: "",
                business_name: "SmartStock Pro",
                currency_symbol: "S/",
                critical_threshold: 0.4,
                low_threshold: 1.0,
                logo_initials: "SP"
            },

            setSession: (userId) => set({ userId }),

            syncFromCloud: async () => {
                const { userId } = get();
                if (!userId) return;

                // Cargar productos, eventos y perfil de negocio en paralelo
                const [cloudProducts, cloudEvents, cloudConfig] = await Promise.all([
                    storageService.getInventory(userId),
                    storageService.getEvents(userId),
                    storageService.getBusinessProfile(userId)
                ]);

                if (cloudProducts.length > 0) {
                    set({ products: cloudProducts });
                }

                if (cloudEvents.length > 0) {
                    set({ events: cloudEvents });
                }

                if (cloudConfig) {
                    set({ businessConfig: cloudConfig });
                }
            },

            updateBusinessConfig: async (updates) => {
                const { userId, businessConfig } = get();
                if (!userId || !businessConfig) return;

                // Optimistic Update: Reflejo inmediato en UI
                const newConfig = { ...businessConfig, ...updates };
                set({ businessConfig: newConfig });

                try {
                    await storageService.saveBusinessProfile(userId, newConfig);
                } catch (error) {
                    // Rollback en caso de error
                    set({ businessConfig });
                    throw error;
                }
            },

            logEvent: async (productId, action, message, stockLevel) => {
                const product = get().products.find(p => p.id === productId);
                if (!product) return;

                const newEvent: StockEvent = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    productId,
                    productName: product.name,
                    stockLevel: stockLevel ?? product.stock,
                    action,
                    severity: action === "critical_reached" ? "critical" : action === "warning_reached" ? "warning" : "info",
                    message,
                };

                const updatedEvents = [newEvent, ...get().events].slice(0, 100);
                set({ events: updatedEvents });

                // Persistencia en Supabase
                await storageService.saveEvent(get().userId || undefined, newEvent);
            },

            archiveHistory: () => {
                const updatedEvents = get().events.map(e => ({ ...e, isArchived: true }));
                set({ events: updatedEvents });
            },

            clearHistory: () => {
                set({ events: [] });
                storageService.clearAll();
            },

            addProduct: async (product) => {
                const id = Math.random().toString(36).substr(2, 9);
                const newItem = { ...product, id } as InventoryItem;

                set((state) => ({
                    products: [...state.products, newItem],
                }));

                await storageService.saveProduct(get().userId || undefined, newItem);
            },

            updateProduct: async (id, updates) => {
                const prevProduct = get().products.find(p => p.id === id);
                if (!prevProduct) return;

                const updatedProduct = { ...prevProduct, ...updates };

                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === id ? updatedProduct : p
                    ),
                }));

                // Auditoría y Sincronización Cloud
                if (updates.stock !== undefined) {
                    const diff = updates.stock - prevProduct.stock;
                    if (diff !== 0) {
                        const minStock = prevProduct.minStock || 20;
                        if (updates.stock < minStock * 0.4 && prevProduct.stock >= minStock * 0.4) {
                            await get().logEvent(id, "critical_reached", `¡CRÍTICO! Stock bajó a ${updates.stock}`, updates.stock);
                        } else if (updates.stock <= minStock && prevProduct.stock > minStock) {
                            await get().logEvent(id, "warning_reached", `Punto de reorden alcanzado: ${updates.stock}`, updates.stock);
                        } else {
                            await get().logEvent(id, "info" as any, `Ajuste de stock: ${diff > 0 ? '+' : ''}${diff}. Nivel: ${updates.stock}`, updates.stock);
                        }
                    }
                }

                await storageService.saveProduct(get().userId || undefined, updatedProduct);
            },

            deleteProduct: async (id) => {
                set((state) => ({
                    products: state.products.filter((p) => p.id !== id),
                    readAlertIds: state.readAlertIds.filter(aid => aid !== id),
                    events: state.events.filter(e => e.productId !== id)
                }));
                await storageService.deleteProduct(get().userId || undefined, id);
            },

            addStock: async (id, amount, isOrder = false) => {
                const product = get().products.find(p => p.id === id);
                if (!product) return;

                const newStock = product.stock + amount;
                const updatedProduct = { ...product, stock: newStock };

                set((state) => ({
                    products: state.products.map(p =>
                        p.id === id ? updatedProduct : p
                    ),
                    ignoredAlerts: { ...state.ignoredAlerts, [id]: 0 }
                }));

                if (isOrder) {
                    await get().logEvent(id, "order_generated", `Pedido completado: +${amount} unidades. Stock total: ${newStock}`, newStock);
                } else {
                    await get().logEvent(id, "info" as any, `Ingreso de stock: +${amount}. Total: ${newStock}`, newStock);
                }

                await storageService.saveProduct(get().userId || undefined, updatedProduct);
            },

            ignoreAlert: (id) => {
                const expiration = Date.now() + 24 * 60 * 60 * 1000;
                set((state) => ({
                    ignoredAlerts: { ...state.ignoredAlerts, [id]: expiration }
                }));
                get().logEvent(id, "ignored", "Alerta ignorada temporalmente");
            },

            markAlertAsRead: (id) => {
                set((state) => ({
                    readAlertIds: Array.from(new Set([...state.readAlertIds, id]))
                }));
            },

            clearNotifications: () => {
                set({ readAlertIds: get().products.map(p => p.id) });
            },

            resetSystem: () => {
                set({
                    products: DEMO_INVENTORY_DATA,
                    ignoredAlerts: {},
                    readAlertIds: [],
                    events: [],
                    userId: null
                });
                storageService.clearAll();
                window.location.reload();
            },
        }),
        {
            name: "smartstock-inventory",
            partialize: (state) => ({
                products: state.products,
                ignoredAlerts: state.ignoredAlerts,
                events: state.events,
            }),
        }
    )
);
