-- Script untuk memperbaiki tabel members yang sudah ada
-- Jalankan script ini jika tabel members sudah ada tapi ada masalah dengan kolom

-- Hapus kolom yang tidak ada (jika ada)
-- ALTER TABLE members DROP COLUMN IF EXISTS createdAt;
-- ALTER TABLE members DROP COLUMN IF EXISTS updatedAt;
-- ALTER TABLE members DROP COLUMN IF EXISTS dateOfBirth;

-- Pastikan kolom yang diperlukan ada
ALTER TABLE members ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE members ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS job VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS notes TEXT;

-- Set primary key jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'members_pkey') THEN
        ALTER TABLE members ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Buat index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization);

-- Insert data contoh jika tabel kosong
INSERT INTO members (name, organization, phone, email, job, dob, address, city, notes) 
SELECT 'John Doe', 'PT Example', '08123456789', 'john@example.com', 'Developer', '1990-01-15', 'Jl. Contoh No. 123', 'Jakarta', 'Member aktif'
WHERE NOT EXISTS (SELECT 1 FROM members LIMIT 1);
