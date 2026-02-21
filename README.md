# SmartStock Pro: Enterprise SaaS Cloud Logistics & AI Analytics

**Plataforma SaaS de grado industrial para la gestión logística avanzada, diseñada para optimizar la cadena de suministro mayorista mediante arquitectura cloud-native, resiliencia total y personalización de marca dinámica.**

---

## 🏛️ Business Vision (The SaaS Transformation)

SmartStock Pro ha evolucionado de una herramienta de gestión local a una plataforma **SaaS Multi-inquilino** completa.
- **Personalización Dinámica**: Cada empresa define su propia identidad (Nombre, Logo, Moneda) y reglas de negocio (Umbrales de stock personalizados).
- **Inteligencia Financiera**: Motor de análisis en tiempo real que proyecta la inversión necesaria basada en velocidades de consumo históricas.
- **Seguridad Enterprise**: Aislamiento total de datos mediante políticas de Row Level Security (RLS) en PostgreSQL/Supabase.

## 🚀 Innovaciones de Arquitectura Senior

### 🛡️ Resiliencia y Robusto Control de Errores
Hemos implementado un **Global Error Boundary** que blinda la aplicación contra fallos de red o errores de lógica. El sistema detecta desconexiones de Supabase y ofrece una interfaz de recuperación intuitiva, garantizando que el usuario nunca pierda el hilo operativo de su negocio.

### 🧠 Motor Logístico Desacoplado (InventoryEngine)
La inteligencia de negocio se ha extraído a una capa de servicios pura. 
- **Parametrización Dinámica**: Los algoritmos de Alerta Crítica y Reorden ya no son estáticos; responden a los multiplicadores definidos en el perfil de negocio SaaS.
- **Predictive Forecast**: Análisis de ventanas de consumo para predecir agotamientos con precisión matemática.

### 📋 Validación Industrial (Zod + React Hook Form)
Toda la entrada de datos, desde la edición rápida de stock hasta la configuración de identidad empresarial, está validada por esquemas de **Zod**. Esto garantiza una base de datos limpia y previene errores técnicos derivados de entradas humanas inválidas.

---

## 🛠️ Stack Tecnológico Justificado

- **Next.js 15 (App Router)**: Arquitectura de componentes Server/Client optimizada para SEO y rendimiento.
- **Supabase Cloud Stack**: Backend-as-a-Service para Auth, DB y RLS.
- **Zustand (Persistent SaaS State)**: Gestión de estado global con sincronización asíncrona y persistencia híbrida.
- **Slate & Zinc Aesthetics**: Diseño minimalista premium que prioriza la legibilidad de métricas financieras.

---

## 🏗️ Guía de Implementación Cloud

1. **Infraestructura SQL**: Ejecutar el script `smartstock_pro_master.sql` en el SQL Editor de Supabase. Este script unificado crea tablas, perfiles, políticas RLS y los disparadores de bienvenida para nuevos usuarios.
2. **Configuración de Entorno**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. **Despliegue Operativo**: 
   `npm install && npm run dev`

---

## 🏆 Decisiones de Diseño y Portafolio

### 1. Repository Pattern & Service Layer
Hemos encapsulado la persistencia en `storageService.ts`, permitiendo que la aplicación sea agnóstica a la base de datos subyacente y facilitando el testing de alto nivel.

### 2. UX SaaS Optimizada
Implementamos **Optimistic Updates** en la configuración del negocio. El usuario percibe una interfaz instantánea mientras la sincronización con la nube ocurre de forma resiliente en segundo plano.

### 3. Accesibilidad y Soporte Operativo
La integración de la **Web Speech API** permite a los operarios de almacén recibir alertas críticas manos libres, optimizando el tiempo de respuesta en entornos logísticos de alta presión.

---
**SmartStock Pro: El cerebro logístico diseñado para escalar, auditar y dominar la cadena de suministro moderna.**
