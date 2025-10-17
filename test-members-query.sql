-- Script untuk test query members di Supabase
-- Jalankan script ini di SQL Editor untuk memastikan data ada

-- Test query dasar
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

-- Test jumlah data
SELECT COUNT(*) as total_members FROM public.members;

-- Test data dengan kondisi tertentu
SELECT 
    id, 
    name, 
    organization, 
    email
FROM public.members 
WHERE name IS NOT NULL 
AND name != ''
ORDER BY name;

-- Test apakah ada data kosong
SELECT 
    COUNT(*) as total_rows,
    COUNT(name) as non_null_names,
    COUNT(organization) as non_null_organizations,
    COUNT(email) as non_null_emails
FROM public.members;
