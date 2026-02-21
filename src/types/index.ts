/**
 * Tipos globales para SmartStock PRO
 * Platform: Enterprise Management System
 */

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

export type KpiMetric = {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  minStock: number;    // Punto de reorden
  targetStock: number; // Nivel óptimo
};

export type StockEventAction = "critical_reached" | "warning_reached" | "order_generated" | "ignored" | "archived";

export type StockEvent = {
  id: string;
  timestamp: number;
  productId: string;
  productName: string;
  stockLevel: number;
  action: StockEventAction;
  severity: "critical" | "warning" | "info";
  message: string;
  isArchived?: boolean;
};

export type BusinessProfile = {
  user_id: string;
  business_name: string;
  currency_symbol: string;
  critical_threshold: number;
  low_threshold: number;
  logo_initials: string;
};
