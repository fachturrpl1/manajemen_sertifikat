# CategorySelector Component

Komponen untuk memilih kategori sertifikat dengan fitur "How to Use" yang menampilkan gambar tutorial.

## Fitur

- **Select Kategori**: Dropdown untuk memilih kategori (MOU, Industri, Magang, Pelatihan)
- **How to Use**: Tombol untuk menampilkan tutorial gambar sesuai kategori
- **Modal Tutorial**: Popup yang menampilkan gambar tutorial
- **Error Handling**: Menangani gambar yang tidak ditemukan

## Penggunaan

```tsx
import { CategorySelector } from "@/components/category-selector"

function MyComponent() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  return (
    <CategorySelector 
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    />
  )
}
```

## Props

- `selectedCategory`: Kategori yang sedang dipilih (null jika belum dipilih)
- `onCategoryChange`: Callback function ketika kategori berubah

## Struktur File Gambar

Pastikan gambar tutorial disimpan di folder berikut:

```
public/
  certificate/
    mou/
      mou1.png
    industri/
      industri1.png
    magang/
      magang1.png
    pelatihan/
      pelatihan1.png
```

## Demo

Akses `/category-demo` untuk melihat demo komponen ini.

