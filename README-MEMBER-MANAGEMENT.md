# Panduan Sistem Manajemen Member dengan Supabase

## Overview
Sistem ini menggunakan Supabase sebagai database untuk menyimpan dan mengelola data member. Sistem sudah terintegrasi dengan sistem login yang mengarahkan admin ke halaman admin dan team ke halaman team.

## Setup Database Supabase

### 1. Buat Tabel Members
Jalankan script SQL berikut di SQL Editor di dashboard Supabase:

```sql
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

-- Buat trigger untuk update updatedAt otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Setup Environment Variables
Pastikan file `.env.local` memiliki konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Fitur yang Tersedia

### 1. Login System
- **Admin Login**: `admin@gmail.com` → mengarah ke `/admin`
- **Team Login**: `team@gmail.com` → mengarah ke `/team`
- Sistem menggunakan tabel `users` di Supabase untuk autentikasi
- Password di-hash untuk keamanan (implementasi nyata)

### 2. Manajemen Member
- **Tambah Member Baru**: Klik tombol "+ Baru"
- **Edit Member**: Klik ikon pensil di kolom aksi
- **Hapus Member**: Klik ikon trash di kolom aksi
- **Import Excel**: Upload file Excel untuk import data massal
- **Pencarian**: Filter data berdasarkan nama, organisasi, email, dll.

### 3. Data Member
Setiap member memiliki field:
- **Name** (wajib)
- **Organization**
- **Phone**
- **Email**
- **Job**
- **Date of Birth (dob)**
- **Address**
- **City**
- **Notes**

## Cara Menggunakan

### 1. Login sebagai Admin
1. Buka halaman `/login`
2. Masukkan email: `admin@gmail.com`
3. Masukkan password yang sesuai
4. Sistem akan mengarahkan ke `/admin`

### 2. Akses Manajemen Member
1. Dari halaman admin, klik menu "Manage"
2. Pilih tab "Manajemen Member"
3. Anda akan melihat tabel dengan semua data member

### 3. Tambah Member Baru
1. Klik tombol "+ Baru"
2. Isi form yang muncul
3. Klik "Kirim" untuk menyimpan

### 4. Edit Member
1. Klik ikon pensil di baris member yang ingin diedit
2. Ubah data di form yang muncul
3. Klik "Kirim" untuk menyimpan perubahan

### 5. Hapus Member
1. Klik ikon trash di baris member yang ingin dihapus
2. Konfirmasi penghapusan
3. Member akan dihapus dari database

### 6. Import Excel
1. Klik tombol "Import Excel"
2. Pilih file Excel dengan format:
   - Kolom: NAME, ORGANIZATION, PHONE, EMAIL, JOB, DATE OF BIRTH, ADDRESS, CITY, NOTES
3. Data akan otomatis ter-import ke database

## Struktur Database

### Tabel `users`
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'team')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabel `members`
```sql
CREATE TABLE public.members (
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
```

## Keamanan

1. **Authentication**: Menggunakan Supabase Auth
2. **Authorization**: Role-based access (admin/team)
3. **Data Validation**: Validasi input di frontend dan backend
4. **SQL Injection**: Dilindungi oleh Supabase client
5. **CORS**: Dikonfigurasi dengan benar

## Troubleshooting

### Error "Failed to fetch members"
- Periksa koneksi internet
- Pastikan Supabase URL dan key benar
- Cek apakah tabel `members` sudah dibuat

### Error "Access denied"
- Pastikan sudah login dengan akun yang benar
- Cek role user di database

### Data tidak muncul
- Pastikan ada data di tabel `members`
- Cek filter pencarian
- Refresh halaman

## Pengembangan Lanjutan

1. **Pagination**: Implementasi pagination untuk data besar
2. **Export**: Fitur export data ke Excel/PDF
3. **Bulk Actions**: Operasi massal (hapus, update)
4. **Audit Log**: Log perubahan data
5. **Advanced Search**: Filter berdasarkan multiple criteria
6. **Data Validation**: Validasi email, phone number format
7. **File Upload**: Upload foto profil member
8. **Notifications**: Notifikasi real-time untuk perubahan data
