-- Script untuk memastikan tabel users sudah benar
-- Jalankan script ini di SQL Editor Supabase

-- Buat tabel users jika belum ada
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'team')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert data default (hapus dulu yang lama jika ada)
DELETE FROM users WHERE email IN ('admin@gmail.com', 'person1@gmail.com');

INSERT INTO users (email, password, role) VALUES 
('admin@gmail.com', 'admin', 'admin'),
('person1@gmail.com', 'team', 'team');

-- Test query untuk memastikan data users ada
SELECT id, email, role FROM users;

-- Nonaktifkan RLS pada tabel users juga (jika ada)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Test query untuk memastikan data members bisa diakses tanpa RLS
SELECT 
    id, 
    name, 
    organization, 
    email,
    created_at
FROM public.members 
ORDER BY created_at DESC 
LIMIT 5;
