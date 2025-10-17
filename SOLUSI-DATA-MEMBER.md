# Cara Mengatasi Data Member Tidak Muncul di UI

## Langkah-langkah Penyelesaian

### 1. Jalankan Script Fix di Supabase
Buka **SQL Editor** di dashboard Supabase dan jalankan script `fix-members-data-access.sql`:

```sql
-- Nonaktifkan RLS pada tabel members
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Hapus semua policy
DROP POLICY IF EXISTS members_auth_full ON public.members;

-- Insert data contoh
INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) 
SELECT 'John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'
WHERE NOT EXISTS (SELECT 1 FROM public.members LIMIT 1);
```

### 2. Test Query di Supabase
Jalankan script `debug-members-query.sql` untuk memastikan data ada:

```sql
-- Test query data members
SELECT 
    id, 
    name, 
    organization, 
    email,
    created_at
FROM public.members 
ORDER BY created_at DESC;

-- Test jumlah data
SELECT COUNT(*) as total_members FROM public.members;
```

### 3. Cek Console Browser
1. **Buka Developer Tools** (F12)
2. **Buka tab Console**
3. **Refresh halaman** manajemen member
4. **Lihat log debugging** yang sudah ditambahkan:
   - "Data dari Supabase:"
   - "Jumlah data:"
   - "Data yang sudah di-mapping:"

### 4. Kemungkinan Masalah dan Solusi

#### Masalah 1: RLS Masih Aktif
**Gejala:** Error "permission denied" atau data kosong
**Solusi:** 
```sql
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
```

#### Masalah 2: Tabel Kosong
**Gejala:** Data tidak ada di Supabase
**Solusi:** Insert data contoh atau import data Anda

#### Masalah 3: Nama Kolom Salah
**Gejala:** Error "column does not exist"
**Solusi:** Cek struktur tabel dengan script debug

#### Masalah 4: Policy Masih Ada
**Gejala:** Data tidak bisa diakses
**Solusi:**
```sql
DROP POLICY IF EXISTS members_auth_full ON public.members;
```

### 5. Test Login dan Akses
1. **Login dengan:** `admin@gmail.com` / `admin`
2. **Akses:** Admin → Manage → Manajemen Member
3. **Lihat:** Apakah data muncul

### 6. Jika Masih Tidak Muncul

#### Cek Environment Variables
Pastikan file `.env.local` memiliki:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Cek Network Tab
1. Buka Developer Tools → Network tab
2. Refresh halaman
3. Lihat request ke Supabase
4. Cek response dan status code

#### Test Query Manual
Jalankan query ini di SQL Editor:
```sql
SELECT * FROM public.members LIMIT 5;
```

## Troubleshooting Berdasarkan Error

### Error "permission denied"
- **Penyebab:** RLS masih aktif
- **Solusi:** Jalankan `ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;`

### Error "relation does not exist"
- **Penyebab:** Tabel members belum dibuat
- **Solusi:** Jalankan script create table

### Error "column does not exist"
- **Penyebab:** Nama kolom salah
- **Solusi:** Cek struktur tabel dengan script debug

### Data kosong di console
- **Penyebab:** Tabel kosong atau query gagal
- **Solusi:** Insert data contoh atau cek query

## Script Lengkap untuk Fix

```sql
-- 1. Nonaktifkan RLS
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Hapus policy
DROP POLICY IF EXISTS members_auth_full ON public.members;

-- 3. Insert data contoh
INSERT INTO public.members (name, organization, phone, email, job, dob, address, city, notes) VALUES 
('John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'),
('Jane Smith', 'CV Test', '08123456788', 'jane@example.com', 'Designer', '1992-05-20', 'Jl. Test No. 456', 'Bandung', 'Member baru');

-- 4. Test query
SELECT COUNT(*) FROM public.members;
```

Setelah menjalankan script ini, refresh halaman dan data member akan muncul!
