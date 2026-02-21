# SmartStock – Progreso del proyecto

## Descripción

Dashboard frontend para que **PYMES peruanas** gestionen su inventario con ayuda de IA. El proyecto está diseñado para el mercado peruano: moneda en **Soles (S/)** y productos/contexto orientados a pequeños negocios locales.

**Esta versión es una implementación personalizada para Distribuidora Carmencita**, un negocio mayorista de abarrotes en Lima. Incluye identidad de marca (Sidebar), catálogo de productos tipo distribuidora y un **Asistente de Gestión** con reglas de negocio dinámicas.

**Principio de diseño: "Smart but Subtle" (Inteligente pero sutil).** La UI prioriza la utilidad de negocio sobre la exposición de la tecnología: lenguaje directo ("Prioridad: Reponer...", "Nota: Exceso de..."), sin frases tipo "La IA sugiere", e iconografía sutil (lucide-react: Lightbulb) para que la aplicación se perciba como un sistema de gestión experto, no como un experimento de IA.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**
- Estructura bajo `src/` con alias `@/*`

## Estructura de carpetas (diseño atómico)

```
src/
├── app/                    # App Router
│   ├── layout.tsx          # Root layout + DashboardLayout
│   ├── page.tsx            # Dashboard principal (KPIs)
│   ├── inventario/page.tsx
│   ├── alertas/page.tsx
│   └── pronosticos/page.tsx
├── components/
│   ├── atoms/              # Card
│   ├── molecules/          # KpiCard
│   ├── organisms/         # Sidebar, Header, DashboardLayout
│   ├── ui/                 # Shadcn: Card, Button, Badge, Table, Input
│   ├── ManagementAssistant.tsx  # Asistente de Gestión (reglas reposición/exceso)
│   ├── WeeklyTrendChart.tsx     # Gráfica de tendencia semanal (Recharts, tema esmeralda)
│   ├── EditStockDialog.tsx      # Modal edición de stock (Dialog Shadcn)
│   └── InventoryTable.tsx       # Tabla de inventario con búsqueda y status
├── hooks/                  # Hooks personalizados (placeholder)
├── lib/                    # utils, format (formatSoles), carmencita-products, weekly-sales-data
└── types/                  # KpiMetric, NavItem, InventoryItem
```

## Completado

- [x] Estructura de carpetas atómica (`components`, `hooks`, `lib`, `types`)
- [x] DashboardLayout moderno con Sidebar + Header
- [x] Página principal con KPIs: **Stock total**, **Alertas de reorden**, **Pronóstico de ventas**
- [x] **Base visual con Shadcn/UI establecida**: Card, Button, Badge; tema oscuro forzado en todo el sitio
- [x] Rutas: `/`, `/inventario`, `/alertas`, `/pronosticos`
- [x] **Fase de datos (inicio)**: tabla de inventario en Vista Rápida con búsqueda y status por stock

## Fase estética (cerrada)

- **Dark Mode**: forzado en todo el sitio (clase `dark` en `<html>`), sin depender del sistema operativo
- **Sidebar**: enlaces de navegación como `Button` (variant `ghost`) con Shadcn
- **Tarjetas KPI**: icono de acción como `Button` (ghost, icon); tendencias (ej. +3,2%, 2 menos que ayer) como `Badge` de Shadcn con variantes por tipo (subida/bajada/neutral)

## Fase de datos (en curso)

- **InventoryTable** (`src/components/InventoryTable.tsx`): componente con Table e Input de Shadcn
  - Columnas: Nombre, Categoría, Stock, Precio, Status (Badge)
  - Lógica de Status por stock: **&lt; 10** → Badge Destructive (Crítico), **10–30** → Badge Warning/outline (Reordenar), **&gt; 30** → Badge Secondary (Normal)
  - Barra de búsqueda (Input) que filtra por nombre en tiempo real
- Integrada en la sección **Vista Rápida** de la página principal (datos mock por defecto; preparada para recibir `products` por props)
- **Localización Perú**: nombre oficial **SmartStock** (Sidebar + `<title>`); moneda **Soles (S/)** con formato `S/ 0.00` en KPIs y tabla (`lib/format.ts`: `formatSoles`).
- **Implementación Distribuidora Carmencita** (identidad de portafolio):
  - **Sidebar**: logo SmartStock con subtítulo "Distribuidora Carmencita".
  - **Datos centralizados**: `lib/carmencita-products.ts` exporta el catálogo único (Arroz Costeño, Aceite Primor, Leche Gloria, Fideos Don Vittorio, Azúcar Paramonga, Detergente Bolívar, Atún Florida, Ace, Sardinas, Harina Blanca Flor). La tabla y el Asistente de Gestión consumen el mismo array; si los datos cambian, las alertas se actualizan en tiempo real.
  - **Asistente de Gestión** (`src/components/ManagementAssistant.tsx`): sección "Asistente de Gestión" con icono Lightbulb (lucide-react). Analiza en tiempo real el array de productos de Carmencita. **Regla Reposición**: stock &lt; 10 → alerta Badge destructive: "Prioridad: Reponer [Nombre] (Stock Crítico: [Cantidad])". **Regla Exceso**: stock &gt; 100 → alerta Badge default: "Nota: Exceso de inventario en [Nombre]. Considerar rotación o promoción." Lenguaje directo de negocio, sin referencias a "IA". Integrado en la página principal; recibe `products` como prop para reflejar cambios del inventario.

## Fase 4: Visualización (cerrada)

- **Tendencia Semanal** (`src/components/WeeklyTrendChart.tsx`): sección "Tendencia Semanal" en el dashboard con gráfica de **área** (Recharts) para ventas de los últimos 7 días. Datos mock en `lib/weekly-sales-data.ts` (Distribuidora Carmencita). Colores del tema: **esmeralda** para la línea y relleno (dark mode), alineados con el resto del dashboard.

## Próximos pasos sugeridos

- Integración con API/backend para datos reales de inventario y ventas
- CRUD de productos (alta/edición desde la tabla)
