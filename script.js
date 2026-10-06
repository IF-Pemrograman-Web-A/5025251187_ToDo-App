const state = {
    tasks: [],
    nextId: 1,
    selectedId: null,
    editingId: null
};


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


function createEl(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function formatDate(isoDate, full) {
    if (!isoDate) return 'Tanpa deadline';

    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonths  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (isoDate.includes('/')) {
        const parts = isoDate.split('/');
        if (parts.length === 3) {
            const day   = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const year  = parts[2];
            return day + ' ' + (full ? fullMonths[month] : shortMonths[month]) + ' ' + year;
    }
    return isoDate;
}

function findTask(id) {
    return state.tasks.find(function (task) {
        return task.id === id;
    });
}
function createActionButton(label, action, extraClass) {
    const button = createEl('button', 'btn-small ' + extraClass, label);
    button.type = 'button';
    button.dataset.action = action;
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
        checkbox.setAttribute('aria-label', 'Status selesai');

        const name = createEl('button', 'task-name', task.title);
        name.type = 'button';
        name.dataset.action = 'select';

        titleRow.appendChild(checkbox);
        titleRow.appendChild(name);

        const meta = createEl('div', 'task-meta');
        if (task.tag) meta.appendChild(createEl('span', 'tag', task.tag));
        meta.appendChild(createEl('span', '', 'Deadline: ' + formatDate(task.deadline, false)));

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

function renderAll() {
    renderTasks();
    renderDetail();
}


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
        task.done = !task.done;
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

todoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (title === '') {
        titleInput.focus();
        return;
    }

    if (state.editingId !== null) {
        const task = findTask(state.editingId);
        task.title = title;
        task.tag = tagInput.value.trim();
        task.deadline = deadlineInput.value;
        task.description = descriptionInput.value.trim();
        state.selectedId = task.id;
    } else {
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

cancelBtn.addEventListener('click', resetForm);

themeToggle.addEventListener('click', function () {
    const isDark = document.body.classList.toggle('dark-mode');
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
});

renderAll();
