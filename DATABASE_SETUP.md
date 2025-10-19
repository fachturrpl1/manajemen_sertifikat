# Database Setup untuk Field Baru

## Masalah
Error "Error saving to database: {}" terjadi karena field database untuk positioning dan styling expired date dan certificate number belum ada.

## Solusi
Jalankan SQL berikut di Supabase Dashboard (SQL Editor):

### 1. Tambahkan Field untuk Expired Date
```sql
-- Add positioning and styling fields for expired date
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_x INTEGER DEFAULT 50;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_y INTEGER DEFAULT 130;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_size INTEGER DEFAULT 14;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_color VARCHAR(7) DEFAULT '#000000';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_align VARCHAR(10) DEFAULT 'center';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expired_font VARCHAR(100) DEFAULT 'Inter, ui-sans-serif, system-ui';
```

### 2. Tambahkan Field untuk Certificate Number
```sql
-- Add positioning and styling fields for certificate number
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_x INTEGER DEFAULT 50;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_y INTEGER DEFAULT 150;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_size INTEGER DEFAULT 14;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_color VARCHAR(7) DEFAULT '#000000';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_align VARCHAR(10) DEFAULT 'center';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cert_number_font VARCHAR(100) DEFAULT 'Inter, ui-sans-serif, system-ui';
```

### 3. Tambahkan Field Content (jika belum ada)
```sql
-- Add content fields if they don't exist
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS number VARCHAR(255);
```

## Cara Menjalankan
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy-paste SQL di atas
4. Klik "Run" untuk menjalankan

## Verifikasi
Setelah menjalankan SQL, coba lagi fitur edit di aplikasi. Error seharusnya sudah hilang.

## Field yang Ditambahkan
- **expired_x, expired_y**: Posisi expired date
- **expired_size**: Ukuran font expired date
- **expired_color**: Warna expired date
- **expired_align**: Alignment expired date
- **expired_font**: Font family expired date
- **cert_number_x, cert_number_y**: Posisi nomor sertifikat
- **cert_number_size**: Ukuran font nomor sertifikat
- **cert_number_color**: Warna nomor sertifikat
- **cert_number_align**: Alignment nomor sertifikat
- **cert_number_font**: Font family nomor sertifikat
- **expires_at**: Tanggal expired
- **number**: Nomor sertifikat


