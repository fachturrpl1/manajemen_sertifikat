-- Script untuk menambahkan trigger updated_at jika belum ada
-- Jalankan script ini di SQL Editor Supabase

-- Buat function untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Buat trigger jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_members_updated_at'
    ) THEN
        CREATE TRIGGER update_members_updated_at 
            BEFORE UPDATE ON public.members 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Buat index jika belum ada
CREATE INDEX IF NOT EXISTS idx_members_name ON public.members(name);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_organization ON public.members(organization);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members(created_at);

-- Test query untuk memastikan semuanya berfungsi
SELECT 
    id, 
    name, 
    organization, 
    email, 
    created_at, 
    updated_at 
FROM public.members 
ORDER BY created_at DESC 
LIMIT 5;
