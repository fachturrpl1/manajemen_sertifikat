# Setup Login dengan Tabel Users Custom

## Masalah yang Ditemukan
Sistem login sebelumnya menggunakan Supabase Auth, padahal Anda sudah membuat tabel `users` sendiri untuk autentikasi.

## Solusi

### 1. Setup Tabel Users
Jalankan script `setup-users-table.sql` di SQL Editor Supabase untuk:
- Membuat tabel `users` dengan struktur yang benar
- Insert data default untuk admin dan team
- Menonaktifkan RLS pada tabel `users`

### 2. Nonaktifkan RLS pada Tabel Members
Jalankan script `disable-rls-members.sql` di SQL Editor Supabase untuk:
- Menonaktifkan Row Level Security pada tabel `members`
- Menghapus policy yang memblokir akses
- Memungkinkan akses data tanpa autentikasi Supabase Auth

### 3. Test Login
Sekarang Anda bisa login dengan:

**Admin:**
- Email: `admin@gmail.com`
- Password: `admin`

**Team:**
- Email: `person1@gmail.com`
- Password: `team`

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

### Tabel `members` (tanpa RLS)
```sql
CREATE TABLE public.members (
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
```

## Cara Testing

1. **Jalankan script setup** di Supabase
2. **Refresh halaman** aplikasi
3. **Login dengan:**
   - Email: `admin@gmail.com`
   - Password: `admin`
4. **Akses halaman admin** → Manage → Manajemen Member
5. **Data akan muncul** karena RLS sudah dinonaktifkan

## Troubleshooting

### Error "Email atau password salah"
- Pastikan data sudah di-insert ke tabel `users`
- Cek email dan password yang benar
- Lihat console browser untuk error detail

### Error "Gagal mengambil data member"
- Pastikan RLS sudah dinonaktifkan pada tabel `members`
- Pastikan tabel `members` ada dan memiliki data
- Cek console browser untuk debugging logs

### Data tidak muncul
- Jalankan script `disable-rls-members.sql`
- Refresh halaman
- Cek console browser untuk debugging logs

## Keamanan

- **Password plain text**: Untuk development saja, production harus di-hash
- **No RLS**: Tabel members bisa diakses tanpa autentikasi
- **Custom auth**: Menggunakan tabel users sendiri, bukan Supabase Auth
