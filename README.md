# Todo App - Pemrograman Web A

## Identitas
| Name           | NRP        |
| ------         | -----      |
| Farrel Rizqi Pangestu | 5025251187 |

## Deskripsi
Todo App berbasis PHP dan MySQL dengan dua menu, **Personal** (tugas pribadi) dan **Shared** (tugas yang dibagikan ke seluruh organisasi). Pada tugas E05 (*The Offline Abyss*), aplikasi ditingkatkan menjadi **Progressive Web App (PWA)**: bisa di-install seperti aplikasi biasa dan tetap menampilkan halaman yang pernah dibuka saat offline.

## Struktur File
| File beserta Fungsinya |

 `index.php` = Pintu masuk, mengambil data lalu menyusun halaman 

 `config.php` = Konfigurasi dan koneksi database (PDO) 

 `functions.php` = Fungsi bantu: query, validasi, upload gambar, CSRF 

 `actions.php` = Memproses create, update, delete, toggle, dan ganti user 

 `header.php`, `menu-bar.php`, `content.php`, `footer.php` = Bagian layout halaman 

 `task-form.php`, `task-list.php`, `task-detail.php` | Komponen di dalam `content.php` 

 `data.sql` = Struktur database dan data dummy 

 `style.css`, `app.js` = Tampilan dan interaksi (dark mode, checkbox, konfirmasi hapus, registrasi Service Worker, tombol install, indikator offline) 

 `manifest.webmanifest` = Web App Manifest (nama, warna, ikon, mode standalone) 

 `sw.js` = Service Worker (precache app shell dan strategi caching per resource) 

 `offline.html` = Halaman fallback saat offline dan halaman belum tersimpan 

 `icons/` = Ikon PWA ukuran 192x192, 512x512, dan maskable 

 `uploads/` = Folder gambar yang diunggah 

## Struktur Website
**1. Header**

Menampilkan judul aplikasi, tombol **Install App** (muncul saat aplikasi bisa di-install), dan tombol toggle light/dark mode (disimpan di localStorage).

**2. Sidebar Menu**

Berisi menu **Personal** dan **Shared** beserta jumlah tugasnya, serta pilihan user ("Signed in as") untuk mencoba berbagi tugas antar pengguna.

**3. Create / Edit Task**

Form untuk menambah atau mengedit tugas: Title, Tag, Deadline, Description, Share with the organization, dan Image.

**4. Task List**

Daftar tugas menurut menu yang aktif, dengan checkbox selesai, tombol Edit dan Delete (hanya untuk pemilik tugas).

**5. Task Details**

Detail tugas yang dipilih, termasuk pemilik, visibilitas, dan gambar.

**6. Footer**

Identitas pembuat dan keterangan tugas.

**7. Menu Bar Personal dan Shared**

Personal menampilkan tugas milik user yang sedang aktif, Shared menampilkan semua tugas yang dibagikan beserta nama pemiliknya.

**8. Modular PHP**

HTML dipecah menjadi beberapa file PHP (`header.php`, `menu-bar.php`, `content.php`, `config.php`, dan lainnya) yang digabung lewat `include`/`require`.

**9. Database**

Struktur tabel `users` dan `tasks` beserta data dummy disimpan di `data.sql`.

**10. CRUD dengan PHP**

Create, Read, Update, dan Delete dijalankan dengan PHP dan PDO (prepared statement), ditambah penanda selesai lewat checkbox. Hanya pemilik tugas yang dapat mengubah atau menghapusnya.

**11. File Handling**

Gambar tugas diunggah lewat PHP (validasi tipe dan ukuran maks. 2 MB, nama file acak), disimpan di folder `uploads/`, dan ikut terhapus saat tugas dihapus atau gambarnya diganti.

**12. Web App Manifest dan Icons**

`manifest.webmanifest` berisi nama aplikasi, `start_url`, mode `standalone`, warna tema, dan tiga ikon (192x192, 512x512, maskable). File ini dihubungkan di `header.php` lewat `<link rel="manifest">`.

**13. Service Worker dan Precache**

`sw.js` menyimpan app shell (`offline.html`, `style.css`, `app.js`, manifest, dan ikon) ke cache saat event `install`. Halaman `index.php?page=personal` dan `index.php?page=shared` ikut disimpan bila server sedang hidup.

**14. Strategi Caching per Resource**

| Resource | Strategi | Alasan |
| --- | --- | --- |
| `offline.html`, manifest, ikon | Precache + Cache First | Tidak berubah antar user, harus selalu ada saat offline |
| `style.css`, `app.js` | Precache + Stale-While-Revalidate | Cepat dari cache, tetap diperbarui bila kode berubah |
| Halaman PHP (`index.php?...`) | Network First, lalu cache, lalu `offline.html` | Data tugas dari MySQL harus terbaru saat online |
| Gambar di `uploads/` | Cache First (maks. 30 item) | Jarang berubah (nama file acak), hemat bandwidth |
| Request POST (create/update/delete/toggle) | Tidak di-cache | Perubahan data butuh server |

Workbox tidak dipakai, seluruh strategi ditulis dengan Cache API bawaan browser.

**15. Tombol Install**

Tombol **Install App** di header muncul saat browser mengirim event `beforeinstallprompt`. Saat diklik, dialog install ditampilkan, dan tombol hilang setelah aplikasi ter-install.

**16. Halaman Offline dan Indikator Offline**

Saat tidak ada koneksi, banner oranye muncul di bawah header. Halaman yang pernah dibuka tetap tampil dari cache, sedangkan halaman yang belum pernah dibuka menampilkan `offline.html`. Karena data ada di MySQL, saat offline tugas hanya bisa dilihat, belum bisa ditambah atau diubah.

## Desktop Preview
- Light Mode
<img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/4f170a7d-5862-4a1b-8db6-0cccdc9e8e30" />

- Dark Mode
<img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/5ad4aa6d-21df-464a-a37d-39dde7ecd131" />

## Mobile Preview (Dark Mode)
<img width="335" height="723" alt="image" src="https://github.com/user-attachments/assets/02fa0b06-e31c-45a7-9af1-534b18415142" />

<img width="337" height="725" alt="image" src="https://github.com/user-attachments/assets/e9205bc4-e5d6-434e-9686-b6d424494b44" />

## Other Screenshots
- Dapat mengubah pengguna
<img width="465" height="389" alt="image" src="https://github.com/user-attachments/assets/48ebe193-801f-4c62-91e6-5157c5283679" />

- Serta menambahkan ToDo
<img width="1385" height="428" alt="image" src="https://github.com/user-attachments/assets/b3af7a6e-150b-4665-85dd-b4d32eb7d20e" />

##Screenshot DevTools
- Manifest terbaca, tiga ikon tampil (Application > Manifest)
<img width="1055" height="799" alt="image" src="https://github.com/user-attachments/assets/e82dda87-f715-4416-81f0-b4e91a2e1e89" />

- Service Worker `sw.js` berstatus *activated and is running* (Application > Service workers)
<img width="1093" height="803" alt="image" src="https://github.com/user-attachments/assets/419bd04f-43d5-494e-a920-41a5499c42bc" />

- Cache storage berisi `todo-shell-v1` dan `todo-pages-v1` (Application > Cache storage)
<img width="1697" height="798" alt="image" src="https://github.com/user-attachments/assets/40b4f61d-1bdc-4d40-8c39-d036deb1aff3" />
<img width="1625" height="807" alt="image" src="https://github.com/user-attachments/assets/0b747177-2745-4268-9046-7b0b601a5c87" />

- Tombol **Install App** dan aplikasi terbuka dalam mode standalone
<img width="1521" height="800" alt="image" src="https://github.com/user-attachments/assets/74bdde62-dada-4f63-b312-3487263874a0" />

##Offline
<img width="982" height="618" alt="WhatsApp Image 2026-11-02 at 19 51 26" src="https://github.com/user-attachments/assets/a7e584ba-6696-4f51-9448-bf1c31f73d66" />

