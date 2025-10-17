# Setup User Authentication di Supabase

## Masalah yang Ditemukan
Tabel `members` menggunakan **Row Level Security (RLS)** yang memerlukan user terautentikasi untuk mengakses data. Sistem login sebelumnya tidak menggunakan Supabase Auth yang sebenarnya.

## Solusi

### 1. Setup Database
Jalankan script `setup-complete-members.sql` di SQL Editor Supabase untuk:
- Membuat tabel `members` dengan RLS
- Membuat trigger untuk `updated_at`
- Membuat policy untuk akses authenticated users
- Insert data contoh

### 2. Buat User di Supabase Auth
Di dashboard Supabase, buka **Authentication > Users** dan buat user:

**Admin User:**
- Email: `admin@gmail.com`
- Password: `admin123` (atau password yang Anda inginkan)

**Team User:**
- Email: `team@gmail.com`  
- Password: `team123` (atau password yang Anda inginkan)

### 3. Update Login Form
Login form sudah diperbaiki untuk menggunakan `supabase.auth.signInWithPassword()` yang akan:
- Mengautentikasi user dengan Supabase Auth
- Menyimpan session yang valid
- Memungkinkan akses ke tabel dengan RLS

### 4. Update Member Management
Komponen `MemberManageContent` sudah diperbaiki untuk:
- Cek autentikasi user sebelum mengambil data
- Menggunakan session yang valid untuk query
- Menampilkan error jika user tidak terautentikasi

## Cara Testing

1. **Buat user di Supabase Auth** (langkah 2 di atas)
2. **Refresh halaman** aplikasi
3. **Login dengan:**
   - Email: `admin@gmail.com`
   - Password: `admin123`
4. **Akses halaman admin** → Manage → Manajemen Member
5. **Data akan muncul** karena user sudah terautentikasi

## Troubleshooting

### Error "User not authenticated"
- Pastikan user sudah dibuat di Supabase Auth
- Pastikan email dan password benar
- Cek console browser untuk error detail

### Error "Gagal mengambil data member"
- Pastikan RLS policy sudah dibuat
- Pastikan user sudah login
- Cek apakah tabel `members` ada dan memiliki data

### Data tidak muncul
- Cek console browser untuk debugging logs
- Pastikan data ada di tabel `members`
- Pastikan user sudah terautentikasi dengan benar

## Keamanan

- **RLS aktif**: Hanya user terautentikasi yang bisa akses data
- **Password hashing**: Supabase Auth menangani hashing password
- **Session management**: Supabase menangani session secara otomatis
- **Policy-based access**: Kontrol akses berdasarkan role user
