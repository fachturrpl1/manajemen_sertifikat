-- Script untuk mengatasi masalah RLS dan memastikan data member muncul
-- Jalankan script ini di SQL Editor Supabase

-- 1. Nonaktifkan RLS pada tabel members
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- 2. Hapus semua policy yang ada pada tabel members
DROP POLICY IF EXISTS members_auth_full ON public.members;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.members;

-- 3. Pastikan tabel members ada dan memiliki struktur yang benar
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT,
  phone TEXT,
  email TEXT,
  job TEXT,
  dob DATE,
  address TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Insert data contoh jika tabel kosong
INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) 
SELECT 'John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'
WHERE NOT EXISTS (SELECT 1 FROM public.members LIMIT 1);

INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) 
SELECT 'Jane Smith', 'CV Test', '08123456788', 'jane@example.com', 'Designer', '1992-05-20', 'Jl. Test No. 456', 'Bandung', 'Member baru'
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE name = 'Jane Smith');

INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) 
SELECT 'Bob Johnson', 'PT Sample', '08123456787', 'bob@example.com', 'Manager', '1988-12-10', 'Jl. Sample No. 789', 'Surabaya', 'Member senior'
WHERE NOT EXISTS (SELECT 1 FROM public.members WHERE name = 'Bob Johnson');

-- 5. Test query untuk memastikan data bisa diakses
SELECT 
    id, 
    name, 
    organization, 
    email,
    created_at
FROM public.members 
ORDER BY created_at DESC;

-- 6. Test jumlah data
SELECT COUNT(*) as total_members FROM public.members;

-- 7. Pastikan tabel users juga tidak ada RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 8. Test query users
SELECT id, email, role FROM users;
