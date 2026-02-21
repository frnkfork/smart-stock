-- =============================================
-- FIX: REPARACIÓN DE REGISTRO SMARTSTOCK PRO
-- =============================================

-- 1. Limpieza de disparadores obsoletos (Pueden estar causando conflictos)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_master ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. Función de creación de usuario reforzada (Resiliente a fallos)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- A. Crear perfil de usuario base
  BEGIN
    INSERT INTO public.profiles (id, full_name, company_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'company_name', NEW.email);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creando perfil base: %', SQLERRM;
  END;

  -- B. Crear perfil de negocio SaaS
  BEGIN
    INSERT INTO public.business_profile (user_id, business_name, currency_symbol, email)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Nuevo Negocio'), 'S/', NEW.email);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creando perfil de negocio: %', SQLERRM;
  END;
  
  -- C. Insertar Producto Semilla
  BEGIN
    INSERT INTO public.products (id, user_id, name, category, stock, price, min_stock, target_stock)
    VALUES ('demo-prod-001', NEW.id, 'Producto de Bienvenida (Demo)', 'General', 12, 120.50, 20, 100);
  EXCEPTION WHEN OTHERS THEN
    -- Si falla insertar el producto demo, no bloqueamos el registro
    RAISE NOTICE 'Error creando producto demo: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el disparador maestro definitivo
CREATE TRIGGER on_auth_user_created_master
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Verificación de permisos
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
