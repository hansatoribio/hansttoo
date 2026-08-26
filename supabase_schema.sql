-- ==============================================================================
-- HANS TATTOO (@hansttoo) - SUPABASE DATABASE & STORAGE INITIALIZATION SCRIPT
-- ==============================================================================
-- Ejecuta este script en Supabase > SQL Editor para crear la tabla y el almacenamiento.

-- 1. CREAR TABLA DE CONSULTAS / CITAS (INQUIRIES)
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

-- 2. HABILITAR SEGURIDAD POR FILA (ROW LEVEL SECURITY)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Permitir a los visitantes de la web enviar consultas (INSERT)
CREATE POLICY "Permitir envíos públicos de consultas"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir consultar las citas (SELECT)
CREATE POLICY "Permitir lectura de consultas"
ON public.inquiries
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir actualizar estado de citas (UPDATE)
CREATE POLICY "Permitir actualizar estado de consultas"
ON public.inquiries
FOR UPDATE
TO anon, authenticated
USING (true);

-- 3. CREAR BUCKET DE ALMACENAMIENTO PARA IMÁGENES DE REFERENCIA
INSERT INTO storage.buckets (id, name, public)
VALUES ('inquiry-images', 'inquiry-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para que los clientes puedan subir fotos de referencia
CREATE POLICY "Permitir subida pública de fotos de referencia"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'inquiry-images');

CREATE POLICY "Permitir visualización pública de fotos de referencia"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'inquiry-images');
