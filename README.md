# Todo App - Pemrograman Web A

## Identitas
| Name           | NRP        |
| ------         | -----      |
| Farrel Rizqi Pangestu | 5025251187 |

## Deskripsi

Website To-do list tugas kuliah menggunakan HTML, CSS, dan JavaScript. Data tugas disimpan di IndexedDB, preferensi tema di localStorage, gambar tugas bisa diambil lewat kamera (Media Capture), pengingat memakai Service Worker, dan antarmuka dibuat accessible.

## Struktur Website
**1. Header**

Bagian paling atas website yang menampilkan judul aplikasi.

**2. Task List (Daftar Tugas)**

Menampilkan daftar tugas dengan checkbox status, tag, deadline, serta tombol Mark as Done, Edit, dan Delete.

**3. Task Details (Detail Tugas)**

Menampilkan detail tugas yang dipilih dari daftar.

**4. Create New Task (Form Tambah Tugas)**

Form untuk menambah tugas baru, atau mengedit tugas yang dipilih. Input diambil lewat JavaScript dan langsung tampil di list.

**5. Footer**

Bagian paling bawah yang menampilkan identitas pembuat dan keterangan tugas.

**6. Toggle Light/Dark Mode**

Komponen di ujung kanan atas yang dapat mengubah tampilan antarmuka antara mode terang dan mode gelap. background dan elemen tampilan berubah menjadi warna gelap/terang, sesuai preferensi pengguna.

**7. Web Storage**

Data to-do (termasuk gambar) disimpan di IndexedDB (todoAppDB), dan preferensi light/dark mode disimpan di localStorage (todo-theme). Data dan tema tetap ada setelah di-refresh.

**8. Media Capture API**

Field Image pada form dapat mengambil foto langsung lewat tombol Buka Kamera (getUserMedia) atau input file dengan atribut capture. Gambar ditampilkan di Task Details.

**9. Service Worker**

sw.js menyimpan app shell di cache agar bisa dibuka offline. Field Notification Time memunculkan notifikasi lewat service worker saat waktunya tiba (aplikasi harus terbuka dan izin notifikasi diberikan). Jalankan lewat localhost atau HTTPS.

**10. Accessibility**

Skip link, landmark dan heading terstruktur, label dan pesan error yang jelas, aria-label serta aria-live untuk pembaca layar, fokus keyboard yang terlihat, kontras warna sesuai WCAG AA, dan dukungan prefers-reduced-motion.

## Desktop Preview
- <img width="1919" height="988" alt="image" src="https://github.com/user-attachments/assets/dc818c6b-2b49-438c-bfb1-7cabd3a0e16f" />
- <img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/745805f9-e717-4fe3-aae8-921e37315ef9" />


## Mobile Preview
- <img width="334" height="722" alt="image" src="https://github.com/user-attachments/assets/00e9e21b-6be2-4bdf-aaf6-3d167e828a19" />

## Setelah di-Refresh
- <img width="1918" height="984" alt="image" src="https://github.com/user-attachments/assets/c48119c1-fe54-44b5-9640-a33ba5aae7f2" />
