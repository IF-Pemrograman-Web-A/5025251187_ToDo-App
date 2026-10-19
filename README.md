# Todo App - Pemrograman Web A

## Identitas
| Name           | NRP        |
| ------         | -----      |
| Farrel Rizqi Pangestu | 5025251187 |

## Deskripsi
Todo App berbasis PHP dan MySQL dengan dua menu, **Personal** (tugas pribadi) dan **Shared** (tugas yang dibagikan ke seluruh organisasi).

## Struktur File
| File beserta Fungsinya |

 `index.php` = Pintu masuk, mengambil data lalu menyusun halaman 

 `config.php` = Konfigurasi dan koneksi database (PDO) 

 `functions.php` = Fungsi bantu: query, validasi, upload gambar, CSRF 

 `actions.php` = Memproses create, update, delete, toggle, dan ganti user 

 `header.php`, `menu-bar.php`, `content.php`, `footer.php` = Bagian layout halaman 

 `task-form.php`, `task-list.php`, `task-detail.php` | Komponen di dalam `content.php` 

 `data.sql` = Struktur database dan data dummy 

 `style.css`, `script.js` = Tampilan dan interaksi (dark mode, checkbox, konfirmasi hapus) 

 `uploads/` = Folder gambar yang diunggah 

## Struktur Website
**1. Header**

Menampilkan judul aplikasi dan tombol toggle light/dark mode (disimpan di localStorage).

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
