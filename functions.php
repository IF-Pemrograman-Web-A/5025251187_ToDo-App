<?php
declare(strict_types=1);

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL  = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ALLOWED_IMAGES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];

// ---------- General helpers ----------

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function format_date(?string $date, bool $full = false): string
{
    if ($date === null || $date === '') {
        return 'No deadline';
    }

    [$year, $month, $day] = explode('-', $date);
    $months = $full ? MONTHS_FULL : MONTHS_SHORT;

    return (int) $day . ' ' . $months[(int) $month - 1] . ' ' . $year;
}

function redirect(string $url): never
{
    header('Location: ' . $url);
    exit;
}

function current_page(): string
{
    $page = $_POST['page'] ?? $_GET['page'] ?? 'personal';

    return in_array($page, ['personal', 'shared'], true) ? $page : 'personal';
}

function page_url(string $page, array $extra = []): string
{
    return 'index.php?' . http_build_query(['page' => $page] + $extra);
}

// ---------- CSRF, flash messages, old input ----------

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): bool
{
    return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], (string) $_POST['csrf']);
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function pull_session(string $key): mixed
{
    $value = $_SESSION[$key] ?? null;
    unset($_SESSION[$key]);

    return $value;
}

// ---------- Users ----------

function get_users(): array
{
    return db()->query('SELECT id, name FROM users ORDER BY id')->fetchAll();
}

function current_user(): array
{
    $users = get_users();

    if ($users === []) {
        http_response_code(500);
        exit('No users found. Please import data.sql first.');
    }

    $wanted = (int) ($_SESSION['user_id'] ?? 0);

    foreach ($users as $user) {
        if ((int) $user['id'] === $wanted) {
            return $user;
        }
    }

    $_SESSION['user_id'] = (int) $users[0]['id'];

    return $users[0];
}

// ---------- Tasks ----------

const TASK_SELECT = 'SELECT t.*, u.name AS owner_name FROM tasks t JOIN users u ON u.id = t.user_id';

function get_tasks(string $page, int $userId): array
{
    if ($page === 'shared') {
        $sql  = TASK_SELECT . ' WHERE t.is_shared = 1';
        $args = [];
    } else {
        $sql  = TASK_SELECT . ' WHERE t.is_shared = 0 AND t.user_id = :user_id';
        $args = ['user_id' => $userId];
    }

    $sql .= ' ORDER BY t.is_done ASC, t.deadline IS NULL, t.deadline ASC, t.id DESC';

    $statement = db()->prepare($sql);
    $statement->execute($args);

    return $statement->fetchAll();
}

function get_task(int $id): ?array
{
    $statement = db()->prepare(TASK_SELECT . ' WHERE t.id = :id');
    $statement->execute(['id' => $id]);
    $task = $statement->fetch();

    return $task === false ? null : $task;
}

function count_tasks(int $userId): array
{
    $personal = db()->prepare('SELECT COUNT(*) FROM tasks WHERE is_shared = 0 AND user_id = :user_id');
    $personal->execute(['user_id' => $userId]);

    $shared = db()->query('SELECT COUNT(*) FROM tasks WHERE is_shared = 1');

    return ['personal' => (int) $personal->fetchColumn(), 'shared' => (int) $shared->fetchColumn()];
}

function task_in_page(array $task, string $page, int $userId): bool
{
    if ($page === 'shared') {
        return (int) $task['is_shared'] === 1;
    }

    return (int) $task['is_shared'] === 0 && (int) $task['user_id'] === $userId;
}

function can_modify(array $task, int $userId): bool
{
    return (int) $task['user_id'] === $userId;
}

function validate_task_input(array $input): array
{
    $errors = [];

    $title       = trim((string) ($input['title'] ?? ''));
    $tag         = trim((string) ($input['tag'] ?? ''));
    $deadline    = trim((string) ($input['deadline'] ?? ''));
    $description = trim((string) ($input['description'] ?? ''));

    if ($title === '') {
        $errors[] = 'Title is required.';
    } elseif (mb_strlen($title) > 150) {
        $errors[] = 'Title must be at most 150 characters.';
    }

    if (mb_strlen($tag) > 50) {
        $errors[] = 'Tag must be at most 50 characters.';
    }

    if ($deadline !== '') {
        $date = DateTime::createFromFormat('!Y-m-d', $deadline);

        if ($date === false || $date->format('Y-m-d') !== $deadline) {
            $errors[] = 'Deadline is not a valid date.';
        }
    }

    if (mb_strlen($description) > 2000) {
        $errors[] = 'Description must be at most 2000 characters.';
    }

    return [
        [
            'title'       => $title,
            'tag'         => $tag,
            'deadline'    => $deadline === '' ? null : $deadline,
            'description' => $description,
            'is_shared'   => isset($input['is_shared']) ? 1 : 0,
        ],
        $errors,
    ];
}

// ---------- File handling (image upload) ----------

function handle_image_upload(?array $file): array
{
    if ($file === null || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return ['filename' => null, 'error' => null];
    }

    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        return ['filename' => null, 'error' => 'Image is too large (maximum 2 MB).'];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['filename' => null, 'error' => 'Image upload failed. Please try again.'];
    }

    if ($file['size'] > MAX_UPLOAD_BYTES) {
        return ['filename' => null, 'error' => 'Image is too large (maximum 2 MB).'];
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);

    if (!isset(ALLOWED_IMAGES[$mime]) || @getimagesize($file['tmp_name']) === false) {
        return ['filename' => null, 'error' => 'Image must be a JPG, PNG, WEBP, or GIF file.'];
    }

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . ALLOWED_IMAGES[$mime];

    if (!move_uploaded_file($file['tmp_name'], UPLOAD_DIR . $filename)) {
        return ['filename' => null, 'error' => 'Image could not be saved on the server.'];
    }

    return ['filename' => $filename, 'error' => null];
}

function delete_image(?string $filename): void
{
    if ($filename === null || $filename === '') {
        return;
    }

    $path = UPLOAD_DIR . basename($filename);

    if (is_file($path)) {
        unlink($path);
    }
}
