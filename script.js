/* =========================================================
   TODO APP - script.js
   Isi file ini:
   1. Data (disimpan sebagai object)
   2. Fungsi bantu
   3. Fungsi untuk menampilkan (render) data ke halaman
   4. Event handler (klik, submit, dll)
   ========================================================= */


/* ---------- 1. DATA ----------
   Semua data disimpan dalam satu object bernama "state".
   Data ini hanya ada di memori, jadi kalau halaman di-refresh,
   data otomatis kembali ke kondisi awal (default) di bawah ini. */
const state = {
    tasks: [
        {
            id: 1,
            title: 'KKA - Uninformed Search',
            tag: 'KKA',
            deadline: '2026-09-15',
            description: 'Lengkapnya lihat di ITS Classroom.',
            done: false
        },
        {
            id: 2,
            title: 'Matdis - Tugas 1',
            tag: 'Matdis',
            deadline: '2026-09-13',
            description: 'Lengkapnya lihat di ITS Classroom.',
            done: true
        },
        {
            id: 3,
            title: 'Matdis - Tugas 2',
            tag: 'Matdis',
            deadline: '2026-09-20',
            description: 'Lengkapnya lihat di ITS Classroom.',
            done: false
        },
        {
            id: 4,
            title: 'KCV - Buat AI Engine (lanjutkan & selesaikan Notebook)',
            tag: 'KCV',
            deadline: '2026-09-13',
            description: 'Lanjutkan dan selesaikan Notebook.',
            done: true
        }
    ],
    nextId: 5,          // id untuk tugas baru berikutnya
    selectedId: 1,      // tugas yang sedang ditampilkan di Task Details
    editingId: null     // null = sedang tidak edit, angka = id tugas yang diedit
};


/* ---------- Ambil elemen dari HTML ---------- */
const todoList     = document.getElementById('todo-list');
const taskDetail   = document.getElementById('task-detail');
const todoForm     = document.getElementById('todo-form');
const formHeading  = document.getElementById('form-heading');
const submitBtn    = document.getElementById('submit-btn');
const cancelBtn    = document.getElementById('cancel-btn');
const themeToggle  = document.getElementById('theme-toggle');

const titleInput       = document.getElementById('title');
const tagInput         = document.getElementById('tag');
const deadlineInput    = document.getElementById('deadline');
const descriptionInput = document.getElementById('description');


/* ---------- 2. FUNGSI BANTU ---------- */

// Membuat elemen HTML baru: createEl('p', 'nama-class', 'isi teks')
// Pakai textContent (bukan innerHTML) supaya input user aman.
function createEl(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

// Mengubah '2026-09-15' menjadi '15 Sep 2026' (atau '15 September 2026' kalau full = true)
function formatDate(isoDate, full) {
    if (!isoDate) return 'Tanpa deadline';

    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonths  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const parts = isoDate.split('-');           // ['2026', '09', '15']
    const year  = parts[0];
    const month = Number(parts[1]) - 1;         // bulan di array mulai dari 0
    const day   = Number(parts[2]);

    return day + ' ' + (full ? fullMonths[month] : shortMonths[month]) + ' ' + year;
}

// Cari tugas berdasarkan id
function findTask(id) {
    return state.tasks.find(function (task) {
        return task.id === id;
    });
}

// Buat satu tombol kecil di dalam baris tugas
function createActionButton(label, action, extraClass) {
    const button = createEl('button', 'btn-small ' + extraClass, label);
    button.type = 'button';
    button.dataset.action = action;     // dibaca oleh event handler di bawah
    return button;
}


/* ---------- 3. RENDER (menampilkan data ke halaman) ---------- */

function renderTasks() {
    todoList.innerHTML = '';    // kosongkan dulu, lalu isi ulang

    if (state.tasks.length === 0) {
        todoList.appendChild(createEl('li', 'empty-message', 'Belum ada tugas. Tambahkan lewat form di samping.'));
        return;
    }

    state.tasks.forEach(function (task) {
        const item = createEl('li', 'task');
        item.dataset.id = task.id;
        if (task.done) item.classList.add('done');
        if (task.id === state.selectedId) item.classList.add('selected');

        // Baris atas: checkbox (hanya tampilan) + judul tugas
        const titleRow = createEl('div', 'task-title');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.tabIndex = -1;                    // tidak bisa difokus / diklik langsung
        checkbox.setAttribute('aria-label', 'Status selesai');

        const name = createEl('button', 'task-name', task.title);
        name.type = 'button';
        name.dataset.action = 'select';

        titleRow.appendChild(checkbox);
        titleRow.appendChild(name);

        // Baris bawah: tag + deadline
        const meta = createEl('div', 'task-meta');
        if (task.tag) meta.appendChild(createEl('span', 'tag', task.tag));
        meta.appendChild(createEl('span', '', 'Deadline: ' + formatDate(task.deadline, false)));

        // Tombol aksi: Mark as Done, Edit, Delete
        const actions = createEl('div', 'task-actions');
        actions.appendChild(createActionButton(task.done ? 'Mark as Undone' : 'Mark as Done', 'toggle', 'btn-done'));
        actions.appendChild(createActionButton('Edit', 'edit', 'btn-edit'));
        actions.appendChild(createActionButton('Delete', 'delete', 'btn-delete'));

        item.appendChild(titleRow);
        item.appendChild(meta);
        item.appendChild(actions);
        todoList.appendChild(item);
    });
}

function renderDetail() {
    taskDetail.innerHTML = '';
    const task = findTask(state.selectedId);

    if (!task) {
        taskDetail.appendChild(createEl('p', 'empty-message', 'Klik salah satu tugas di daftar untuk melihat detailnya.'));
        return;
    }

    const card = createEl('article', 'detail-card');
    card.appendChild(createEl('h3', '', task.title));

    const list = createEl('dl');
    list.appendChild(createEl('dt', '', 'Tag'));
    list.appendChild(createEl('dd', '', task.tag || '-'));
    list.appendChild(createEl('dt', '', 'Status'));
    list.appendChild(createEl('dd', '', task.done ? 'Selesai' : 'Belum selesai'));
    list.appendChild(createEl('dt', '', 'Due'));
    list.appendChild(createEl('dd', '', formatDate(task.deadline, true)));
    card.appendChild(list);

    card.appendChild(createEl('p', 'description', task.description || 'Tidak ada deskripsi.'));
    taskDetail.appendChild(card);
}

// Tampilkan ulang semua bagian
function renderAll() {
    renderTasks();
    renderDetail();
}


/* ---------- Mode form: tambah / edit ---------- */

function resetForm() {
    state.editingId = null;
    todoForm.reset();
    formHeading.textContent = 'Create New Task';
    submitBtn.textContent = 'Add Todo';
    cancelBtn.hidden = true;
}

function startEdit(task) {
    state.editingId = task.id;
    titleInput.value = task.title;
    tagInput.value = task.tag;
    deadlineInput.value = task.deadline;
    descriptionInput.value = task.description;

    formHeading.textContent = 'Edit Task';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.hidden = false;
    titleInput.focus();
}


/* ---------- 4. EVENT HANDLER ---------- */

// (a) Klik di dalam daftar tugas.
// Satu listener di <ul> untuk semua tombol (disebut event delegation),
// jadi tugas baru yang ditambah nanti otomatis ikut bekerja.
todoList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = Number(button.closest('.task').dataset.id);
    const task = findTask(id);
    const action = button.dataset.action;

    if (action === 'select') {
        state.selectedId = id;
    }

    if (action === 'toggle') {
        task.done = !task.done;         // ubah status -> checkbox & coretan ikut berubah
    }

    if (action === 'edit') {
        state.selectedId = id;
        startEdit(task);
    }

    if (action === 'delete') {
        if (!confirm('Hapus tugas "' + task.title + '"?')) return;

        state.tasks = state.tasks.filter(function (t) {
            return t.id !== id;
        });
        if (state.selectedId === id) {
            state.selectedId = state.tasks.length > 0 ? state.tasks[0].id : null;
        }
        if (state.editingId === id) {
            resetForm();
        }
    }

    renderAll();
});

// (b) Form di-submit: tambah tugas baru, atau simpan hasil edit
todoForm.addEventListener('submit', function (event) {
    event.preventDefault();             // cegah halaman reload

    const title = titleInput.value.trim();
    if (title === '') {
        titleInput.focus();
        return;
    }

    if (state.editingId !== null) {
        // Mode edit: update tugas yang sudah ada
        const task = findTask(state.editingId);
        task.title = title;
        task.tag = tagInput.value.trim();
        task.deadline = deadlineInput.value;
        task.description = descriptionInput.value.trim();
        state.selectedId = task.id;
    } else {
        // Mode tambah: buat object tugas baru
        const newTask = {
            id: state.nextId,
            title: title,
            tag: tagInput.value.trim(),
            deadline: deadlineInput.value,
            description: descriptionInput.value.trim(),
            done: false
        };
        state.nextId++;
        state.tasks.push(newTask);
        state.selectedId = newTask.id;
    }

    resetForm();
    renderAll();
});

// (c) Tombol Cancel saat edit
cancelBtn.addEventListener('click', resetForm);

// (d) Tombol Light / Dark mode: toggle class "dark-mode" di <body>
themeToggle.addEventListener('click', function () {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
});


/* ---------- Jalankan pertama kali ---------- */
renderAll();
