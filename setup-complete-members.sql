-- Script untuk membuat user admin dan team di Supabase Auth
-- Jalankan script ini di SQL Editor Supabase

-- Buat function untuk set updated_at (jika belum ada)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat tabel members dengan RLS
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT,
  phone TEXT,
  email TEXT,
  job TEXT,
  dob DATE,                -- date of birth
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index bantu pencarian cepat
CREATE INDEX IF NOT EXISTS members_text_idx ON public.members (name, organization, email, city);

-- Trigger auto-update updated_at setiap ada perubahan data
DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Izinkan semua user yang terautentikasi melakukan CRUD
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'members' AND policyname = 'members_auth_full'
  ) THEN
    CREATE POLICY members_auth_full ON public.members
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- Insert data contoh
INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) VALUES 
('John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'),
('Jane Smith', 'CV Test', '08123456788', 'jane@example.com', 'Designer', '1992-05-20', 'Jl. Test No. 456', 'Bandung', 'Member baru'),
('Bob Johnson', 'PT Sample', '08123456787', 'bob@example.com', 'Manager', '1988-12-10', 'Jl. Sample No. 789', 'Surabaya', 'Member senior')
ON CONFLICT DO NOTHING;
