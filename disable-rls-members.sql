-- Script untuk menonaktifkan RLS pada tabel members
-- Jalankan script ini di SQL Editor Supabase

-- Nonaktifkan Row Level Security pada tabel members
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Hapus policy yang ada (jika ada)
DROP POLICY IF EXISTS members_auth_full ON public.members;

-- Test query untuk memastikan data bisa diakses
SELECT 
    id, 
    name, 
    organization, 
    email,
    created_at
FROM public.members 
ORDER BY created_at DESC 
LIMIT 5;

-- Test jumlah data
SELECT COUNT(*) as total_members FROM public.members;
