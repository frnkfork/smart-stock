import type { InventoryItem } from "@/types";

/**
 * Catálogo de productos de demostración para SmartStock Pro.
 * Fuente única para tabla de inventario y Asistente de Gestión en modo demo.
 */

export const DEMO_INVENTORY_DATA: InventoryItem[] = [
  { id: "1", name: "Saco de Arroz Costeño (50 kg)", category: "Abarrotes", stock: 5, price: 135.0, minStock: 20, targetStock: 50 },
  { id: "2", name: "Aceite Primor Premium (Botella 1L)", category: "Aceites", stock: 48, price: 14.5, minStock: 30, targetStock: 100 },
  { id: "3", name: "Leche Gloria (Six Pack)", category: "Lácteos", stock: 22, price: 28.0, minStock: 15, targetStock: 60 },
  { id: "4", name: "Fideos Don Vittorio (Paquete 450g)", category: "Pastas", stock: 105, price: 2.8, minStock: 30, targetStock: 150 },
  { id: "5", name: "Azúcar Rubia Paramonga (Saco 50 kg)", category: "Abarrotes", stock: 8, price: 165.0, minStock: 15, targetStock: 40 },
  { id: "6", name: "Detergente Bolívar (Bolsa 1 kg)", category: "Limpieza", stock: 35, price: 9.9, minStock: 20, targetStock: 80 },
  { id: "7", name: "Atún Florida en Lata (170 g)", category: "Conservas", stock: 12, price: 5.2, minStock: 20, targetStock: 50 },
  { id: "8", name: "Ace Detergente (Bolsa 1 kg)", category: "Limpieza", stock: 42, price: 8.5, minStock: 20, targetStock: 100 },
  { id: "9", name: "Sardinas en Aceite (Lata 425 g)", category: "Conservas", stock: 6, price: 6.8, minStock: 15, targetStock: 40 },
  { id: "10", name: "Harina Blanca Flor (Bolsa 50 kg)", category: "Abarrotes", stock: 18, price: 95.0, minStock: 20, targetStock: 60 },
];
