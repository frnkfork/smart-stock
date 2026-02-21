-- ==========================================
-- SMARTSTOCK PRO: ESQUEMA MAESTRO SAAS (v1.0)
-- ==========================================

-- 1. EXTENSIONES (Para generar UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PROFILES (Sincronización de Usuario)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA: BUSINESS_PROFILE (Configuración SaaS Dinámica)
CREATE TABLE IF NOT EXISTS public.business_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT NOT NULL DEFAULT 'Nuevo Negocio',
    currency_symbol TEXT NOT NULL DEFAULT 'S/',
    email TEXT, -- Correo para identificación rápida en BD
    critical_threshold FLOAT NOT NULL DEFAULT 0.4, -- 40% del stock mínimo
    low_threshold FLOAT NOT NULL DEFAULT 1.0,      -- 100% del stock mínimo
    logo_initials TEXT DEFAULT 'SP',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA: PRODUCTS (Inventario Maestro)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL,
  min_stock INTEGER NOT NULL DEFAULT 20,
  target_stock INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (id, user_id)
);

-- 5. TABLA: AUDIT_LOG (Motor Predictivo e Historial)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info', 'order_generated', 'ignored')),
  message TEXT NOT NULL,
  stock_level INTEGER,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. SEGURIDAD: RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS: AISLAMIENTO MULTI-USUARIO
-- Profiles
CREATE POLICY "Users browse their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Business Profile
CREATE POLICY "Users browse business profile" ON public.business_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update business profile" ON public.business_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert business profile" ON public.business_profile FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products
CREATE POLICY "Users browse their products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete their products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Audit Log
CREATE POLICY "Users browse their logs" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their logs" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. AUTOMATIZACIÓN: HANDLE NEW USER (La Magia SaaS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- A. Crear perfil de usuario base
  INSERT INTO public.profiles (id, full_name, company_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'company_name', NEW.email);

  -- B. Crear perfil de negocio SaaS dinámico
  INSERT INTO public.business_profile (user_id, business_name, currency_symbol, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mi Distribuidora'), 'S/', NEW.email);
  
  -- C. Insertar Producto Semilla (Wow Factor)
  INSERT INTO public.products (id, user_id, name, category, stock, price, min_stock, target_stock)
  VALUES ('demo-prod-001', NEW.id, 'Producto de Bienvenida (Demo)', 'General', 12, 120.50, 20, 100);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador Maestro
DROP TRIGGER IF EXISTS on_auth_user_created_master ON auth.users;
CREATE TRIGGER on_auth_user_created_master
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. UTILIDAD: UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_business_updated_at ON public.business_profile;
CREATE TRIGGER tr_update_business_updated_at BEFORE UPDATE ON public.business_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FIN DEL SCRIPT MAESTRO
-- ==========================================
