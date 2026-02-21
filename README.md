# SmartStock Pro 📦
### Cloud Logistics & Predictive Analysis SaaS

> Optimizando la cadena de suministro mayorista mediante inteligencia predictiva y arquitectura cloud-native.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

SmartStock Pro es un ecosistema diseñado para resolver el problema del **capital inmovilizado** en distribuidoras mayoristas (como el caso real de 'Carmencita'). La plataforma no solo gestiona el inventario, sino que utiliza análisis de autonomía de stock para transformar datos en decisiones operativas, ayudando a liberar flujo de caja y prevenir quiebres de stock.

---

## 🧠 Core & Business Logic

### Inventory Engine (Predictive Analysis)
A diferencia de un CRUD estándar, el núcleo de la aplicación reside en un `InventoryEngine` desacoplado. He implementado lógica funcional pura para calcular la salud del inventario en tiempo real:

*   **Detección de Quiebre Inminente**: El sistema identifica productos cuyo stock cae por debajo del 40% del punto de reorden definido.
*   **Gestión de Excedentes**: Identificación dinámica de sobre-stock (150% del nivel óptimo), alertando sobre productos que están drenando liquidez de forma innecesaria.
*   **Reposición Óptima**: Algoritmo que sugiere cantidades exactas de pedido basadas en el *Target Stock* pactado, evitando excesos de almacenamiento.

### Asistente Operativo con Feedback por Voz
Utilizando la **Web Speech API**, el sistema proporciona notificaciones auditivas automáticas para incidencias críticas. Esto permite que el personal de almacén reciba alertas de reabastecimiento inmediato sin necesidad de interactuar físicamente con la plataforma en momentos de alta operatividad.

---

## 🏗️ Arquitectura y Persistencia

### Patrón Repository en `StorageService`
Para manejar los datos, implementé una capa de acceso a datos (`StorageService`) que abstrae la complejidad de la red. Esto permite:
*   **Persistencia Híbrida**: El sistema prioriza la sincronización con **Supabase**, pero implementa un *local fallback* automático para mantener la app operativa en entornos con conectividad inestable.
*   **Escalabilidad SaaS**: Uso de **Row Level Security (RLS)** en el backend para garantizar que la data de cada cliente mayorista esté aislada y segura.

### Lógica 'Stateless'
Toda la computación logística se ha movido fuera de los componentes de React hacia el motor interno. Esto garantiza que el código sea predecible, fácil de testear (`Unit Testing`) y extremadamente rápido, dejando a la UI solo la responsabilidad de presentación.

---

## 🛠️ Tech Stack

*   **Next.js 15 (App Router)**: Elegido por su velocidad en el renderizado distribuido y manejo de rutas.
*   **TypeScript**: Clave para evitar errores de tipo en cálculos matemáticos de stock sensible.
*   **Zustand**: Gestión de estado global atómica para un Dashboard interactivo sin la sobrecarga de Redux.
*   **Tailwind CSS**: Diseño atómico y responsivo enfocado en la usabilidad industrial.
*   **Supabase / PostgreSQL**: Engine robusto para el manejo de auditoría y multitenancy.

---

## 🚀 Setup

1.  Instala las dependencias: `npm install`
2.  Configura tu `.env.local` con las claves de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
    ```
3.  Corre el servidor de desarrollo: `npm run dev`

---

*Desarrollado con enfoque en resultados operativos y escalabilidad técnica.*
