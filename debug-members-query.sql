-- Script untuk test query members di Supabase
-- Jalankan script ini di SQL Editor untuk debugging

-- Test 1: Cek apakah tabel members ada
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'members';

-- Test 2: Cek struktur tabel members
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 3: Cek apakah RLS aktif
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'members';

-- Test 4: Cek policy yang ada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'members';

-- Test 5: Query data members (harus berhasil)
SELECT 
    id, 
    name, 
    organization, 
    phone, 
    email, 
    job, 
    dob, 
    address, 
    city, 
    notes,
    created_at,
    updated_at
FROM public.members 
ORDER BY created_at DESC;

-- Test 6: Hitung jumlah data
SELECT COUNT(*) as total_members FROM public.members;

-- Test 7: Cek data users
SELECT id, email, role FROM users;
