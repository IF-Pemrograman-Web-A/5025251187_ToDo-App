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

## Screenshots
