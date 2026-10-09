'use strict';

const THEME_KEY = 'todo-theme';
const DB_NAME = 'todoAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';
const REMINDER_INTERVAL_MS = 15000;
const MAX_IMAGE_SIDE = 1280;

const state = {
    tasks: [],
    selectedId: null,
    editingId: null
};

let formImage = null;
let previewUrl = null;
let detailImageUrl = null;
let cameraStream = null;


const todoList     = document.getElementById('todo-list');
const taskDetail   = document.getElementById('task-detail');
const todoForm     = document.getElementById('todo-form');
const formHeading  = document.getElementById('form-heading');
const submitBtn    = document.getElementById('submit-btn');
const cancelBtn    = document.getElementById('cancel-btn');
const themeToggle  = document.getElementById('theme-toggle');
const notifyBtn    = document.getElementById('notify-btn');
const statusRegion = document.getElementById('status');

const titleInput       = document.getElementById('title');
const titleError       = document.getElementById('title-error');
const tagInput         = document.getElementById('tag');
const deadlineInput    = document.getElementById('deadline');
const notifyTimeInput  = document.getElementById('notify-time');
const descriptionInput = document.getElementById('description');

const imageFileInput   = document.getElementById('image-file');
const imageError       = document.getElementById('image-error');
const cameraBtn        = document.getElementById('camera-btn');
const cameraBox        = document.getElementById('camera-box');
const cameraVideo      = document.getElementById('camera-video');
const captureBtn       = document.getElementById('capture-btn');
const cameraCloseBtn   = document.getElementById('camera-close-btn');
const captureCanvas    = document.getElementById('capture-canvas');
const imagePreviewBox  = document.getElementById('image-preview-box');
const imagePreview     = document.getElementById('image-preview');
const imageRemoveBtn   = document.getElementById('image-remove-btn');


function createEl(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function announce(message) {
    statusRegion.textContent = '';
    setTimeout(function () {
        statusRegion.textContent = message;
    }, 50);
}

function formatDate(isoDate, full) {
    if (!isoDate) return 'Tanpa deadline';

    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonths  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const parts = isoDate.split('-');
    const year  = parts[0];
    const month = Number(parts[1]) - 1;
    const day   = Number(parts[2]);

    return day + ' ' + (full ? fullMonths[month] : shortMonths[month]) + ' ' + year;
}

function formatDateTime(localValue, full) {
    if (!localValue) return '-';

    const pieces = localValue.split('T');
    return formatDate(pieces[0], full) + ', ' + (pieces[1] || '').slice(0, 5);
}

function findTask(id) {
    return state.tasks.find(function (task) {
        return task.id === id;
    });
}


function openDatabase() {
    return new Promise(function (resolve, reject) {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB tidak didukung'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = function () {
            resolve(request.result);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

let dbPromise = null;

function getDatabase() {
    if (!dbPromise) dbPromise = openDatabase();
    return dbPromise;
}

function runStore(mode, action) {
    return getDatabase().then(function (db) {
        return new Promise(function (resolve, reject) {
            const transaction = db.transaction(STORE_NAME, mode);
            const request = action(transaction.objectStore(STORE_NAME));
            transaction.oncomplete = function () {
                resolve(request ? request.result : undefined);
            };
            transaction.onerror = function () {
                reject(transaction.error);
            };
            transaction.onabort = function () {
                reject(transaction.error);
            };
        });
    });
}

function dbGetAll() {
    return runStore('readonly', function (store) {
        return store.getAll();
    });
}

function dbPut(task) {
    return runStore('readwrite', function (store) {
        return store.put(task);
    });
}

function dbDelete(id) {
    return runStore('readwrite', function (store) {
        return store.delete(id);
    });
}


function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

function loadTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
    } catch (error) {
        saved = null;
    }

    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved === 'dark');
        return;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
}

function saveTheme(isDark) {
    try {
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
        announce('Preferensi tema tidak dapat disimpan di perangkat ini.');
    }
}


function createActionButton(label, action, extraClass, ariaLabel) {
    const button = createEl('button', 'btn-small ' + extraClass, label);
    button.type = 'button';
    button.dataset.action = action;
    button.setAttribute('aria-label', ariaLabel);
    return button;
}


function renderTasks() {
    todoList.innerHTML = '';

    if (state.tasks.length === 0) {
        todoList.appendChild(createEl('li', 'empty-message', 'Belum ada tugas. Tambahkan lewat form di samping.'));
        return;
    }

    state.tasks.forEach(function (task) {
        const item = createEl('li', 'task');
        item.dataset.id = task.id;
        if (task.done) item.classList.add('done');
        if (task.id === state.selectedId) item.classList.add('selected');

        const titleRow = createEl('div', 'task-title');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.disabled = true;
        checkbox.tabIndex = -1;
        checkbox.setAttribute('aria-hidden', 'true');

        const name = createEl('button', 'task-name', task.title);
        name.type = 'button';
        name.dataset.action = 'select';
        name.setAttribute('aria-label', 'Lihat detail: ' + task.title);
        if (task.id === state.selectedId) name.setAttribute('aria-current', 'true');

        titleRow.appendChild(checkbox);
        titleRow.appendChild(name);
        titleRow.appendChild(createEl('span', 'sr-only', task.done ? '(Selesai)' : '(Belum selesai)'));

        const meta = createEl('div', 'task-meta');
        if (task.tag) meta.appendChild(createEl('span', 'tag', task.tag));
        meta.appendChild(createEl('span', '', 'Deadline: ' + formatDate(task.deadline, false)));
        if (task.notifyAt) {
            meta.appendChild(createEl('span', '', 'Pengingat: ' + formatDateTime(task.notifyAt, false)));
        }
        if (task.image) {
            meta.appendChild(createEl('span', '', 'Ada gambar'));
        }

        const actions = createEl('div', 'task-actions');
        actions.appendChild(createActionButton(
            task.done ? 'Mark as Undone' : 'Mark as Done',
            'toggle',
            'btn-done',
            (task.done ? 'Tandai belum selesai: ' : 'Tandai selesai: ') + task.title
        ));
        actions.appendChild(createActionButton('Edit', 'edit', 'btn-edit', 'Edit tugas: ' + task.title));
        actions.appendChild(createActionButton('Delete', 'delete', 'btn-delete', 'Hapus tugas: ' + task.title));

        item.appendChild(titleRow);
        item.appendChild(meta);
        item.appendChild(actions);
        todoList.appendChild(item);
    });
}


function renderDetail() {
    taskDetail.innerHTML = '';

    if (detailImageUrl) {
        URL.revokeObjectURL(detailImageUrl);
        detailImageUrl = null;
    }

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
    list.appendChild(createEl('dt', '', 'Pengingat'));
    list.appendChild(createEl('dd', '', task.notifyAt ? formatDateTime(task.notifyAt, true) : '-'));
    card.appendChild(list);

    card.appendChild(createEl('p', 'description', task.description || 'Tidak ada deskripsi.'));

    if (task.image) {
        detailImageUrl = URL.createObjectURL(task.image);
        const picture = document.createElement('img');
        picture.className = 'detail-image';
        picture.src = detailImageUrl;
        picture.alt = 'Lampiran gambar untuk tugas ' + task.title;
        card.appendChild(picture);
    }

    taskDetail.appendChild(card);
}


function renderAll() {
    renderTasks();
    renderDetail();
}

function focusTaskControl(id, action) {
    const target = todoList.querySelector('.task[data-id="' + id + '"] [data-action="' + action + '"]');
    if (target) target.focus();
}


function showTitleError() {
    titleError.hidden = false;
    titleInput.setAttribute('aria-invalid', 'true');
    titleInput.focus();
}

function clearTitleError() {
    titleError.hidden = true;
    titleInput.removeAttribute('aria-invalid');
}

function showImageError(message) {
    imageError.textContent = message;
    imageError.hidden = false;
}

function clearImageError() {
    imageError.textContent = '';
    imageError.hidden = true;
}


function setFormImage(blob) {
    formImage = blob;

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    if (blob) {
        previewUrl = URL.createObjectURL(blob);
        imagePreview.src = previewUrl;
        imagePreviewBox.hidden = false;
    } else {
        imagePreview.removeAttribute('src');
        imagePreviewBox.hidden = true;
        imageFileInput.value = '';
    }
}

function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
}

function drawScaled(source, width, height) {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
    captureCanvas.width = Math.round(width * scale);
    captureCanvas.height = Math.round(height * scale);
    captureCanvas.getContext('2d').drawImage(source, 0, 0, captureCanvas.width, captureCanvas.height);
    return canvasToBlob(captureCanvas);
}

async function downscaleFile(file) {
    try {
        const bitmap = await createImageBitmap(file);
        const blob = await drawScaled(bitmap, bitmap.width, bitmap.height);
        if (bitmap.close) bitmap.close();
        return blob || file;
    } catch (error) {
        return file;
    }
}


async function openCamera() {
    clearImageError();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showImageError('Kamera tidak didukung di browser ini. Gunakan pilihan "pilih / ambil foto dari perangkat".');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        cameraVideo.srcObject = cameraStream;
        cameraBox.hidden = false;
        cameraBtn.disabled = true;
        captureBtn.focus();
        announce('Kamera aktif. Tekan Ambil Gambar untuk memotret.');
    } catch (error) {
        const reason = error && error.name === 'NotAllowedError'
            ? 'izin kamera ditolak.'
            : 'kamera tidak ditemukan atau sedang dipakai.';
        showImageError('Kamera tidak dapat dibuka: ' + reason);
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });
        cameraStream = null;
    }
    cameraVideo.srcObject = null;
    cameraBox.hidden = true;
    cameraBtn.disabled = false;
}

async function captureFrame() {
    const width = cameraVideo.videoWidth;
    const height = cameraVideo.videoHeight;

    if (!width || !height) {
        showImageError('Kamera belum siap, coba lagi sebentar lagi.');
        return;
    }

    const blob = await drawScaled(cameraVideo, width, height);
    if (!blob) {
        showImageError('Gagal mengambil gambar dari kamera.');
        return;
    }

    clearImageError();
    setFormImage(blob);
    closeCamera();
    cameraBtn.focus();
    announce('Gambar berhasil diambil dan dilampirkan.');
}


function resetForm() {
    state.editingId = null;
    todoForm.reset();
    clearTitleError();
    clearImageError();
    closeCamera();
    setFormImage(null);
    formHeading.textContent = 'Create New Task';
    submitBtn.textContent = 'Add Todo';
    cancelBtn.hidden = true;
}


function startEdit(task) {
    state.editingId = task.id;
    clearTitleError();
    clearImageError();
    closeCamera();

    titleInput.value = task.title;
    tagInput.value = task.tag;
    deadlineInput.value = task.deadline;
    notifyTimeInput.value = task.notifyAt || '';
    descriptionInput.value = task.description;
    setFormImage(task.image || null);

    formHeading.textContent = 'Edit Task';
    submitBtn.textContent = 'Save Changes';
    cancelBtn.hidden = false;
    titleInput.focus();
    announce('Mode edit: ' + task.title);
}


function notificationsSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
}

function updateNotifyButton() {
    if (!notificationsSupported()) {
        notifyBtn.hidden = true;
        return;
    }

    notifyBtn.hidden = false;

    if (Notification.permission === 'granted') {
        notifyBtn.textContent = 'Notifikasi Aktif';
        notifyBtn.disabled = true;
    } else if (Notification.permission === 'denied') {
        notifyBtn.textContent = 'Notifikasi Diblokir';
        notifyBtn.disabled = true;
    } else {
        notifyBtn.textContent = 'Aktifkan Notifikasi';
        notifyBtn.disabled = false;
    }
}

async function requestNotificationPermission() {
    if (!notificationsSupported()) return;

    try {
        await Notification.requestPermission();
    } catch (error) {
        announce('Izin notifikasi tidak dapat diminta.');
    }

    updateNotifyButton();
    checkReminders();
}

async function showReminder(task) {
    const registration = await navigator.serviceWorker.ready;
    const body = task.deadline
        ? 'Deadline: ' + formatDate(task.deadline, true)
        : 'Saatnya mengerjakan tugas ini.';

    await registration.showNotification('Pengingat: ' + task.title, {
        body: body,
        tag: 'todo-' + task.id,
        data: { id: task.id },
        requireInteraction: false
    });
}

async function checkReminders() {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;

    const now = Date.now();

    for (const task of state.tasks) {
        if (!task.notifyAt || task.notified || task.done) continue;
        if (new Date(task.notifyAt).getTime() > now) continue;

        try {
            await showReminder(task);
            task.notified = true;
            await dbPut(task);
        } catch (error) {
            continue;
        }
    }
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('sw.js').catch(function () {
        announce('Service worker tidak dapat didaftarkan. Gunakan localhost atau HTTPS.');
    });

    navigator.serviceWorker.addEventListener('message', function (event) {
        const data = event.data;
        if (!data || data.type !== 'select-task') return;

        if (findTask(data.id)) {
            state.selectedId = data.id;
            renderAll();
            focusTaskControl(data.id, 'select');
        }
    });
}


todoList.addEventListener('click', async function (event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = Number(button.closest('.task').dataset.id);
    const task = findTask(id);
    const action = button.dataset.action;
    let focusTarget = { id: id, action: action };

    try {
        if (action === 'select') {
            state.selectedId = id;
        }

        if (action === 'toggle') {
            task.done = !task.done;
            await dbPut(task);
            announce(task.title + (task.done ? ' ditandai selesai.' : ' ditandai belum selesai.'));
        }

        if (action === 'edit') {
            state.selectedId = id;
            startEdit(task);
            focusTarget = null;
        }

        if (action === 'delete') {
            if (!confirm('Hapus tugas "' + task.title + '"?')) return;

            await dbDelete(id);
            state.tasks = state.tasks.filter(function (t) {
                return t.id !== id;
            });
            if (state.selectedId === id) {
                state.selectedId = state.tasks.length > 0 ? state.tasks[0].id : null;
            }
            if (state.editingId === id) {
                resetForm();
            }
            announce('Tugas "' + task.title + '" dihapus.');
            focusTarget = state.selectedId !== null ? { id: state.selectedId, action: 'select' } : null;
        }
    } catch (error) {
        announce('Gagal menyimpan perubahan ke penyimpanan lokal.');
        return;
    }

    renderAll();

    if (focusTarget) {
        focusTaskControl(focusTarget.id, focusTarget.action);
    } else if (action === 'delete') {
        document.getElementById('list-heading').setAttribute('tabindex', '-1');
        document.getElementById('list-heading').focus();
    }
});


todoForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (title === '') {
        showTitleError();
        return;
    }
    clearTitleError();

    const notifyAt = notifyTimeInput.value;

    try {
        if (state.editingId !== null) {
            const task = findTask(state.editingId);
            if (task.notifyAt !== notifyAt) task.notified = false;

            task.title = title;
            task.tag = tagInput.value.trim();
            task.deadline = deadlineInput.value;
            task.notifyAt = notifyAt;
            task.description = descriptionInput.value.trim();
            task.image = formImage;

            await dbPut(task);
            state.selectedId = task.id;
            announce('Perubahan pada "' + task.title + '" disimpan.');
        } else {
            const newTask = {
                title: title,
                tag: tagInput.value.trim(),
                deadline: deadlineInput.value,
                notifyAt: notifyAt,
                notified: false,
                description: descriptionInput.value.trim(),
                image: formImage,
                done: false
            };
            newTask.id = await dbPut(newTask);
            state.tasks.push(newTask);
            state.selectedId = newTask.id;
            announce('Tugas "' + newTask.title + '" ditambahkan.');
        }
    } catch (error) {
        announce('Gagal menyimpan tugas ke penyimpanan lokal.');
        return;
    }

    if (notifyAt && notificationsSupported() && Notification.permission === 'default') {
        await requestNotificationPermission();
    }

    resetForm();
    renderAll();
    checkReminders();
});


cancelBtn.addEventListener('click', function () {
    resetForm();
    announce('Edit dibatalkan.');
});


cameraBtn.addEventListener('click', openCamera);
cameraCloseBtn.addEventListener('click', function () {
    closeCamera();
    cameraBtn.focus();
});
captureBtn.addEventListener('click', captureFrame);

cameraBox.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeCamera();
        cameraBtn.focus();
    }
});

imageFileInput.addEventListener('change', async function () {
    const file = imageFileInput.files[0];
    if (!file) return;

    if (file.type.indexOf('image/') !== 0) {
        showImageError('File harus berupa gambar.');
        imageFileInput.value = '';
        return;
    }

    clearImageError();
    setFormImage(await downscaleFile(file));
    announce('Gambar dilampirkan.');
});

imageRemoveBtn.addEventListener('click', function () {
    setFormImage(null);
    clearImageError();
    cameraBtn.focus();
    announce('Gambar dihapus.');
});

window.addEventListener('pagehide', closeCamera);


themeToggle.addEventListener('click', function () {
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
    saveTheme(isDark);
    announce(isDark ? 'Mode gelap aktif.' : 'Mode terang aktif.');
});

notifyBtn.addEventListener('click', requestNotificationPermission);


async function init() {
    loadTheme();
    registerServiceWorker();
    updateNotifyButton();

    try {
        state.tasks = await dbGetAll();
    } catch (error) {
        announce('Penyimpanan lokal (IndexedDB) tidak tersedia, data tidak akan tersimpan.');
    }

    renderAll();
    checkReminders();

    setInterval(checkReminders, REMINDER_INTERVAL_MS);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) checkReminders();
    });
}

init();
