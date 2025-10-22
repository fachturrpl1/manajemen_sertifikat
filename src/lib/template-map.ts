export const TEMPLATE_MAP: Record<string, string[]> = {
  // Kunjungan Industri
  "kunjungan industri": [
    "certificate/kunjungan_industri/industri1.png",
    "certificate/kunjungan_industri/industri2.png",
  ],
  "kunjungan_industri": [
    "certificate/kunjungan_industri/industri1.png",
    "certificate/kunjungan_industri/industri2.png",
  ],
  // Magang
  magang: [
    "certificate/magang/magang1.png",
    "certificate/magang/magang2.png",
  ],
  // MoU
  mou: [
    "certificate/mou/mou1.png",
    "certificate/mou/mou2.png",
  ],
  // Pelatihan
  pelatihan: [
    "certificate/pelatihan/pelatihan1.png",
    "certificate/pelatihan/pelatihan2.png",
    "certificate/pelatihan/pelatihan3.png",
  ],
}

export function getTemplates(category: string) {
  return category ? TEMPLATE_MAP[category] || [] : []
}
