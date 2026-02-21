import { z } from "zod";

/**
 * Esquema de validación para la configuración del negocio.
 * Garantiza que los parámetros del motor y la identidad visual sean coherentes.
 */
export const BusinessSettingsSchema = z.object({
    business_name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre es demasiado largo"),
    currency_symbol: z.string()
        .min(1, "Símbolo requerido")
        .max(5, "Máximo 5 caracteres"),
    critical_threshold: z.number()
        .min(0.05, "El umbral crítico no puede ser menor al 5%")
        .max(0.5, "El umbral crítico no puede superar el 50%"),
    low_threshold: z.number()
        .min(0.5, "El umbral de alerta debe ser al menos el 50%")
        .max(2.0, "El umbral de alerta no puede superar el 200%"),
    logo_initials: z.string()
        .min(1, "Iniciales requeridas")
        .max(3, "Máximo 3 letras"),
});

export type BusinessSettingsType = z.infer<typeof BusinessSettingsSchema>;

/**
 * Esquema para productos individuales.
 */
export const InventoryItemSchema = z.object({
    name: z.string().min(2, "Nombre requerido"),
    category: z.string().min(1, "Categoría requerida"),
    stock: z.number().int().min(0, "El stock no puede ser negativo"),
    price: z.number().positive("El precio debe ser mayor a 0"),
    minStock: z.number().int().positive("El punto de reorden debe ser positivo"),
    targetStock: z.number().int().positive("El nivel óptimo debe ser positivo"),
});
