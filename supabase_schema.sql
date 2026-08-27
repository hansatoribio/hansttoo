-- ==============================================================================
-- HANS TATTOO (@hansttoo) - ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE
-- ==============================================================================
-- Copia y pega este script en: Supabase Dashboard > SQL Editor > Run
-- Este script crea todas las tablas requeridas, activa la seguridad RLS,
-- crea las políticas de acceso y almacena la clave de administración en Supabase.
-- ==============================================================================

-- 1. TABLA DE CONSULTAS Y COTIZACIONES (INQUIRIES)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    instagram TEXT,
    preferred_contact_method TEXT DEFAULT 'whatsapp',
    style TEXT,
    color_type TEXT DEFAULT 'black_and_grey',
    placement TEXT,
    placement_photo TEXT,
    size_cm NUMERIC,
    description TEXT,
    reference_images TEXT[],
    reference_image TEXT,
    status TEXT DEFAULT 'pending',
    artist_notes TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE CONFIGURACIÓN Y CLAVE DE ADMINISTRADOR (ADMIN_SETTINGS)
-- Aquí se guarda la clave del panel de administración (NO hardcodeada en el código)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    admin_passcode TEXT NOT NULL DEFAULT 'hans2026',
    recovery_email TEXT DEFAULT 'tattoobyhans@gmail.com',
    seo_title TEXT DEFAULT 'Hans Tattoo | Fine Line & Microrealism Artist New York',
    seo_description TEXT DEFAULT 'Fine line tattoo artist and anime craft specialist based in New York. Book bespoke custom consultations.',
    seo_keywords TEXT DEFAULT 'fine line tattoo, anime tattoo, microrealism, new york tattoo artist, bespoke tattoo design',
    meta_pixel_id TEXT DEFAULT '',
    google_analytics_id TEXT DEFAULT '',
    instagram_username TEXT DEFAULT 'hansttoo',
    instagram_widget_url TEXT DEFAULT '',
    map_open_hour NUMERIC DEFAULT 11,
    map_close_hour NUMERIC DEFAULT 20,
    map_schedule_text TEXT DEFAULT 'Tue - Sat: 11:00 AM - 8:00 PM (By Appointment Only)',
    map_address_line1 TEXT DEFAULT 'Midtown Atelier Studio, 5th Ave',
    map_address_line2 TEXT DEFAULT 'New York, NY 10018',
    map_google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Midtown+Manhattan+New+York',
    custom_translations JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO public.admin_settings (id, admin_passcode, recovery_email)
VALUES ('main', 'hans2026', 'tattoobyhans@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- 3. TABLA DE SUSCRIPTORES / LISTA DE ESPERA (SUBSCRIBERS)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PIEZAS DEL PORTAFOLIO (PORTFOLIO_ITEMS)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id TEXT PRIMARY KEY,
    title_en TEXT,
    title_es TEXT,
    style TEXT DEFAULT 'fineline',
    image_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    size TEXT,
    duration TEXT,
    recovery_days NUMERIC DEFAULT 10,
    story_en TEXT,
    story_es TEXT,
    featured BOOLEAN DEFAULT true,
    sort_order NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE PREGUNTAS FRECUENTES (FAQS)
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY,
    question_en TEXT NOT NULL,
    question_es TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_es TEXT NOT NULL,
    category TEXT DEFAULT 'booking',
    sort_order NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- HABILITAR SEGURIDAD POR FILA (ROW LEVEL SECURITY - RLS) EN TODAS LAS TABLAS
-- ==============================================================================
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA INQUIRIES
DROP POLICY IF EXISTS "inquiries_select_all" ON public.inquiries;
CREATE POLICY "inquiries_select_all" ON public.inquiries FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "inquiries_insert_all" ON public.inquiries;
CREATE POLICY "inquiries_insert_all" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inquiries_update_all" ON public.inquiries;
CREATE POLICY "inquiries_update_all" ON public.inquiries FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "inquiries_delete_all" ON public.inquiries;
CREATE POLICY "inquiries_delete_all" ON public.inquiries FOR DELETE TO anon, authenticated USING (true);

-- POLÍTICAS PARA ADMIN_SETTINGS
DROP POLICY IF EXISTS "admin_settings_select_all" ON public.admin_settings;
CREATE POLICY "admin_settings_select_all" ON public.admin_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_settings_update_all" ON public.admin_settings;
CREATE POLICY "admin_settings_update_all" ON public.admin_settings FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_settings_insert_all" ON public.admin_settings;
CREATE POLICY "admin_settings_insert_all" ON public.admin_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- POLÍTICAS PARA SUBSCRIBERS
DROP POLICY IF EXISTS "subscribers_select_all" ON public.subscribers;
CREATE POLICY "subscribers_select_all" ON public.subscribers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "subscribers_insert_all" ON public.subscribers;
CREATE POLICY "subscribers_insert_all" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "subscribers_delete_all" ON public.subscribers;
CREATE POLICY "subscribers_delete_all" ON public.subscribers FOR DELETE TO anon, authenticated USING (true);

-- POLÍTICAS PARA PORTFOLIO_ITEMS
DROP POLICY IF EXISTS "portfolio_select_all" ON public.portfolio_items;
CREATE POLICY "portfolio_select_all" ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "portfolio_insert_all" ON public.portfolio_items;
CREATE POLICY "portfolio_insert_all" ON public.portfolio_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "portfolio_update_all" ON public.portfolio_items;
CREATE POLICY "portfolio_update_all" ON public.portfolio_items FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "portfolio_delete_all" ON public.portfolio_items;
CREATE POLICY "portfolio_delete_all" ON public.portfolio_items FOR DELETE TO anon, authenticated USING (true);

-- POLÍTICAS PARA FAQS
DROP POLICY IF EXISTS "faqs_select_all" ON public.faqs;
CREATE POLICY "faqs_select_all" ON public.faqs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faqs_insert_all" ON public.faqs;
CREATE POLICY "faqs_insert_all" ON public.faqs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "faqs_update_all" ON public.faqs;
CREATE POLICY "faqs_update_all" ON public.faqs FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faqs_delete_all" ON public.faqs;
CREATE POLICY "faqs_delete_all" ON public.faqs FOR DELETE TO anon, authenticated USING (true);

-- ==============================================================================
-- BUCKET DE ALMACENAMIENTO (STORAGE BUCKET: inquiry-images)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('inquiry-images', 'inquiry-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_upload_public" ON storage.objects;
CREATE POLICY "storage_upload_public" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'inquiry-images');

DROP POLICY IF EXISTS "storage_select_public" ON storage.objects;
CREATE POLICY "storage_select_public" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'inquiry-images');
