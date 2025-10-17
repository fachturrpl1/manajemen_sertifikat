-- Script SQL untuk membuat tabel members di Supabase
-- Jalankan script ini di SQL Editor di dashboard Supabase

-- Buat tabel members (sesuai dengan struktur yang sudah ada)
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

-- Buat index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization);

-- Buat trigger untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON public.members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert data contoh (opsional)
INSERT INTO members (name, organization, phone, email, job, dob, address, city, notes) VALUES 
('John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'),
('Jane Smith', 'CV Test', '08123456788', 'jane@example.com', 'Designer', '1992-05-20', 'Jl. Test No. 456', 'Bandung', 'Member baru'),
('Bob Johnson', 'PT Sample', '08123456787', 'bob@example.com', 'Manager', '1988-12-10', 'Jl. Sample No. 789', 'Surabaya', 'Member senior');

-- Set RLS (Row Level Security) jika diperlukan
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk akses (sesuaikan dengan kebutuhan)
-- CREATE POLICY "Allow all operations for authenticated users" ON members
--   FOR ALL USING (auth.role() = 'authenticated');
