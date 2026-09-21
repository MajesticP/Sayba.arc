# SAYBA ARC — Arah Desain & Sistem Warna

Sumber kebenaran tunggal untuk warna dan arah visual situs. Setiap keputusan
warna harus bisa dijelaskan dalam satu baris.

## Arah

**Dibaca sebagai:** situs konsultan IT & engineering untuk klien bisnis dan
instansi di Kalimantan Barat, dengan bahasa visual *technical drafting* —
presisi, tenang, tanpa dekorasi berlebih. Dial **ENERGY 2 / RHYTHM 2 / MOTION 1**.

| Dial | Nilai | Artinya di situs ini |
|---|---|---|
| **ENERGY** | 2 | Hero tegas, sisanya tenang. Bukan halaman yang berteriak. |
| **RHYTHM** | 2 | Komposisi seragam dengan 2-3 jeda yang sengaja dibedakan. |
| **MOTION** | 1 | Hanya transisi masuk dan hover. Tidak ada animasi berjalan terus. |

## Palet

Lima warna, satu keluarga hue (cool steel). Netral hangat, aksen sejuk.

| Nama | Hex | Peran | Alasan |
|---|---|---|---|
| **Carbon Black** | `#1c2321` | Latar gelap, teks utama di terang | Hitam dengan undertone hijau-kebiruan; menyatu dengan keluarga steel, tidak sekeras `#000` |
| **Cool Steel** | `#7d98a1` | Aksen, garis penghubung, teks sekunder di gelap | Biru-kelabu yang mengingatkan garis teknik; 5.24:1 di atas Carbon |
| **Blue Slate** | `#5e6572` | Teks sekunder di terang, permukaan panel | Abu-kebiruan untuk teks pendukung tanpa harus hitam; 5.16:1 di atas Platinum |
| **Powder Blue** | `#a9b4c2` | Aksen terang di latar gelap | Untuk tombol dan penanda di atas Carbon; 7.62:1 dengan teks Carbon |
| **Platinum** | `#eef1ef` | Latar terang utama | Putih gading yang lebih lembut dari `#fff`; mengurangi kelelahan mata pada teks panjang |

### Turunan

Turunan dibuat dari lima warna di atas, bukan warna baru.

| Token | Hex | Asal |
|---|---|---|
| `--carbon-800` | `#242c29` | Carbon dinaikkan 4% terang — permukaan terangkat |
| `--carbon-700` | `#2d3733` | Carbon dinaikkan 8% — input di panel gelap |
| `--platinum-dim` | `#e3e8e5` | Platinum diturunkan 5% — latar pembeda section |
| `--platinum-line` | `#d3dad6` | Platinum diturunkan 12% — garis pemisah |
| `--steel-deep` | `#5e7a85` | Steel digelapkan — kategori informasi |

## Kontras (terverifikasi)

Diukur dengan `contrast-check.py` (WCAG 2.x). Ambang: 4.5:1 teks normal, 3:1 teks besar.

| Teks | Latar | Rasio | Status |
|---|---|---|---|
| Carbon `#1c2321` | Platinum `#eef1ef` | 14.08:1 | AAA |
| Platinum `#eef1ef` | Carbon `#1c2321` | 14.08:1 | AAA |
| Blue Slate `#5e6572` | Platinum `#eef1ef` | 5.16:1 | AA |
| Cool Steel `#7d98a1` | Carbon `#1c2321` | 5.24:1 | AA |
| Powder Blue `#a9b4c2` | Carbon `#1c2321` | 7.62:1 | AA |
| Carbon `#1c2321` | Powder Blue `#a9b4c2` | 7.62:1 | AAA |
| Carbon `#1c2321` | Cool Steel `#7d98a1` | 5.24:1 | AA |
| Platinum `#eef1ef` | Blue Slate `#5e6572` | 5.16:1 | AA |

**Dilarang** (gagal WCAG AA):

| Teks | Latar | Rasio |
|---|---|---|
| Powder Blue `#a9b4c2` | Platinum `#eef1ef` | 1.85:1 |
| Cool Steel `#7d98a1` | Platinum `#eef1ef` | 2.68:1 |
| Blue Slate `#5e6572` | Carbon `#1c2321` | 2.73:1 |
| Carbon `#1c2321` | Blue Slate `#5e6572` | 2.73:1 |

Cara verifikasi:

```bash
python ~/AppData/Local/hermes/skills/design/antislop-human/contrast-check.py "#1c2321" "#eef1ef"
```

## Motif: Meja Potong Arsitek

Latar situs meniru meja potong *self-healing* yang dipakai arsitek dan drafter.
Alasannya: situs ini menjual pekerjaan teknis, jadi latarnya mengingatkan ruang
kerja teknis — bukan dekorasi abstrak.

Tiga lapis, semuanya tipis:

1. **Kisi ukur** — 24px halus + 120px tegas. Kelas `.cutting-grid` (terang) dan
   `.cutting-grid-dark` (gelap). Opasitas 0.045–0.09, di bawah ambang gangguan.
2. **Tanda registrasi** — sudut siku di empat pojok, seperti tanda potong di
   meja cetak. Kelas `.reg-mark`.
3. **Garis ukur** — garis dengan tick seperti penggaris baja. Kelas `.rule-line`.

Komponen: `components/cutting-board-bg.tsx` (props `tone="dark" | "light"`).

**Yang dihapus:** semua orb/lingkaran berdenyut, animasi glow, ikon landmark
mengambang, dan putaran lambat. Alasan: gerakan tanpa fungsi mengalihkan
perhatian dari isi, dan termasuk pola yang membuat situs terlihat dibuat
template.

## Tipografi

**Geist** (via `next/font/google`) untuk seluruh situs.

Alasan: sans-serif geometris dengan terminal terbuka, netral untuk teks
Indonesia yang panjang, dan disajikan dari domain sendiri sehingga tidak ada
permintaan ke Google Fonts saat runtime.

Skala yang dipakai:

| Peran | Mobile | Desktop |
|---|---|---|
| Judul halaman | 26–28px | 40–46px |
| Judul section | 18px | 22–24px |
| Judul kartu | 15–16px | 16–17px |
| Teks isi | 13.5–14px | 15–15.5px |
| Teks pendukung | 11.5–12.5px | 12.5–13px |

## Radius

| Nilai | Dipakai untuk |
|---|---|
| `rounded-lg` | Chip, badge |
| `rounded-xl` | Tombol, input, kartu kecil |
| `rounded-2xl` | Kartu konten, panel |
| `rounded-3xl` | Blok ajakan, sorotan |
| `rounded-full` | Hanya penanda status dan avatar |

Radius bervariasi menurut hierarki, tidak seragam di semua elemen.

## Aturan yang mengikat

1. Maksimal **3 warna inti + 1 aksen** (Carbon, Steel, Slate + Powder). Platinum
   netral tidak dihitung.
2. Setiap pasangan teks/latar wajib lolos WCAG AA, diverifikasi dengan alat.
3. Setiap keputusan warna ditulis alasannya dalam satu baris.
4. Tombol di latar gelap: fill Powder + teks Carbon. Tombol di latar terang:
   fill Carbon + teks Platinum.
5. Tidak ada animasi yang berjalan terus tanpa fungsi.
6. Tidak ada ikon sparkle, star, magic, lightning, diamond, robot.
7. Tidak ada emoji di antarmuka.
8. Semua gerakan menghormati `prefers-reduced-motion`.

## Konteks usaha

Dua departemen, tanpa sub-kategori terkelola:

| Departemen | Value DB | Lingkup |
|---|---|---|
| **IT Consultant** | `it_konsulting` | Website, aplikasi web/mobile/desktop, backend & API, machine learning, cloud |
| **Engineering Consultant** | `engineering_konsulting` | Pemetaan GIS, gambar teknik 2D/3D, desain rancang bangun, survey, dokumen teknis |

Tidak ada layanan perkapalan, kelautan, atau maritim di situs ini.
