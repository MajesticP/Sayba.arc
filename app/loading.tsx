// Layar perpindahan antar halaman.
//
// Next.js menampilkan berkas ini otomatis selama segmen rute berikutnya
// masih disiapkan di server. Karena Header dirender di dalam masing-masing
// halaman (bukan di layout), layar ini menggantikan seluruh tampilan — jadi
// bentuknya dibuat menyerupai kerangka situs agar perpindahannya tidak kasar.
//
// Kemunculannya sengaja ditunda 150 md lewat animation-delay. Halaman yang
// sudah tersimpan di cache berpindah lebih cepat dari itu, sehingga layar ini
// tidak sempat terlihat dan tidak menimbulkan kedipan. Yang benar-benar lambat
// saja yang menampilkannya.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat halaman"
      className="fixed inset-0 z-[100] bg-carbon flex flex-col items-center justify-center gap-5 opacity-0 animate-[loaderIn_.25s_ease-out_.15s_forwards]"
    >
      {/* Kisi meja potong — motif ruang kerja teknis, menggantikan orb oranye */}
      <div className="absolute inset-0 cutting-grid-dark pointer-events-none" aria-hidden="true" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-256.png"
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        className="relative w-16 h-16 rounded-2xl object-contain"
      />

      {/* Bar tak tentu — tidak menjanjikan persentase yang tidak kita ketahui */}
      <div className="relative w-32 h-[3px] rounded-full bg-platinum/10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/4 rounded-full bg-steel animate-[loaderBar_1s_ease-in-out_infinite]" />
      </div>

      <span className="sr-only">Memuat halaman…</span>
    </div>
  )
}
